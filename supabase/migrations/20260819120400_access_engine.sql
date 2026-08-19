/* =============================================================================
   04 · MOTOR DE AUTORIZAÇÃO NO BANCO
   -----------------------------------------------------------------------------
   Porte 1:1 de src/modules/permissions/engine.ts. A ordem de avaliação é a
   mesma: papel -> capacidade (wildcard já expandido) -> empresa -> centro de
   custo. Toda negativa tem MOTIVO em pt-BR, igual ao AccessDecision.reason —
   é o texto que o widget mascarado exibe.

   Estas funções são SECURITY DEFINER de propósito: elas SÃO a fronteira.
   Precisam ler as tabelas de RBAC sem passar pela RLS que elas próprias
   sustentam (senão, recursão). search_path fixo em '' fecha a porta de
   sequestro de schema.
============================================================================= */

/* Quem está perguntando. */
create or replace function app.current_profile_id()
returns uuid language sql stable set search_path = '' as $fn$
  select auth.uid();
$fn$;

/* Nível de garantia da sessão: 'aal1' = só senha · 'aal2' = senha + segundo fator. */
create or replace function app.session_aal()
returns text language sql stable set search_path = '' as $fn$
  select coalesce(auth.jwt() ->> 'aal', 'aal1');
$fn$;

create or replace function app.current_tenant_id()
returns uuid language sql stable security definer set search_path = '' as $fn$
  select p.tenant_id from public.profiles p where p.id = auth.uid();
$fn$;

/* Conta desativada/suspensa não tem acesso — mesmo com token válido ainda
   dentro da validade. É o desligamento imediato exigido pela auditoria. */
create or replace function app.profile_is_active()
returns boolean language sql stable security definer set search_path = '' as $fn$
  select exists (
    select 1 from public.profiles p
    join public.tenants t on t.id = p.tenant_id
    where p.id = auth.uid() and p.status = 'active' and t.status = 'active'
  );
$fn$;

/* ── a pergunta central: pode? ────────────────────────────────────────────── */
create or replace function app.has_capability(
  p_capability     text,
  p_company_slug   text default null,
  p_cost_center    text default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
  select app.profile_is_active() and exists (
    select 1
    from public.role_assignments ra
    join public.roles r              on r.key = ra.role_key
    join public.role_capabilities rc on rc.role_key = ra.role_key
    join public.capabilities c       on c.key = rc.capability_key
    where ra.profile_id = auth.uid()
      and ra.revoked_at is null
      and (ra.expires_at is null or ra.expires_at > now())
      and rc.capability_key = p_capability

      /* escopo de empresa: "*" (all_companies) ou lista explícita */
      and (
        p_company_slug is null
        or ra.all_companies
        or exists (
          select 1 from public.role_assignment_companies rac
          join public.companies co on co.id = rac.company_id
          where rac.assignment_id = ra.id
            and co.slug = p_company_slug
            and co.tenant_id = ra.tenant_id
            and co.status = 'active'
        )
      )

      /* escopo fino de centro de custo (gestor de área) */
      and (
        p_cost_center is null
        or ra.all_cost_centers
        or exists (
          select 1 from public.role_assignment_cost_centers racc
          join public.cost_centers cc on cc.id = racc.cost_center_id
          where racc.assignment_id = ra.id and cc.code = p_cost_center
        )
      )

      /* segundo fator: exigido pela capacidade OU pelo papel */
      and (not (c.requires_mfa or r.requires_mfa) or app.session_aal() = 'aal2')
  );
$fn$;

comment on function app.has_capability(text, text, text) is
  'Decisão booleana de acesso. Usada em RLS e nas políticas de escrita. Espelha authorize() do front — mas esta aqui é a que vale.';

/* ── a mesma decisão, EXPLICADA (contrato AccessDecision do front) ────────── */
create or replace function public.authorize(
  p_capability   text,
  p_company_slug text default null,
  p_cost_center  text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $fn$
declare
  v_has_cap_somewhere boolean;
  v_needs_mfa boolean;
  v_granted record;
begin
  if auth.uid() is null then
    return jsonb_build_object('allowed', false, 'reason', 'Sessao nao autenticada');
  end if;

  if not app.profile_is_active() then
    return jsonb_build_object('allowed', false, 'reason', 'Conta inativa ou suspensa');
  end if;

  /* O papel concede esta capacidade em ALGUM escopo? */
  select exists (
    select 1 from public.role_assignments ra
    join public.role_capabilities rc on rc.role_key = ra.role_key
    where ra.profile_id = auth.uid() and ra.revoked_at is null
      and (ra.expires_at is null or ra.expires_at > now())
      and rc.capability_key = p_capability
  ) into v_has_cap_somewhere;

  if not v_has_cap_somewhere then
    return jsonb_build_object('allowed', false,
      'reason', 'Seu papel nao tem acesso a este conteudo');
  end if;

  /* Tem a capacidade, mas a sessão é fraca? Diga isso — a UI oferece o MFA. */
  select exists (
    select 1 from public.role_assignments ra
    join public.roles r on r.key = ra.role_key
    join public.role_capabilities rc on rc.role_key = ra.role_key
    join public.capabilities c on c.key = rc.capability_key
    where ra.profile_id = auth.uid() and ra.revoked_at is null
      and rc.capability_key = p_capability and (c.requires_mfa or r.requires_mfa)
  ) into v_needs_mfa;

  if v_needs_mfa and app.session_aal() <> 'aal2' then
    return jsonb_build_object('allowed', false,
      'reason', 'Esta acao exige verificacao em duas etapas',
      'code', 'mfa_required');
  end if;

  if app.has_capability(p_capability, p_company_slug, p_cost_center) then
    select ra.role_key as role,
           case when ra.all_companies then 'todas as empresas'
                else (select string_agg(co.slug, ', ' order by co.slug)
                      from public.role_assignment_companies rac
                      join public.companies co on co.id = rac.company_id
                      where rac.assignment_id = ra.id) end as scope
      into v_granted
      from public.role_assignments ra
      join public.role_capabilities rc on rc.role_key = ra.role_key
     where ra.profile_id = auth.uid() and ra.revoked_at is null
       and rc.capability_key = p_capability
     order by (select r.rank from public.roles r where r.key = ra.role_key)
     limit 1;

    return jsonb_build_object('allowed', true, 'reason', 'ok',
      'grantedBy', jsonb_build_object('role', v_granted.role, 'scope', v_granted.scope));
  end if;

  if p_company_slug is not null then
    return jsonb_build_object('allowed', false, 'reason', 'Seu acesso nao inclui esta empresa');
  end if;
  if p_cost_center is not null then
    return jsonb_build_object('allowed', false, 'reason', 'Fora do seu escopo de centro de custo');
  end if;
  return jsonb_build_object('allowed', false, 'reason', 'Seu papel nao tem acesso a este conteudo');
end;
$fn$;

/* Empresas visíveis para uma capacidade — alimenta o ContextSwitcher. */
create or replace function public.companies_in_scope(p_capability text default 'dashboard.ver')
returns table (id uuid, slug text, name text)
language sql stable security definer set search_path = '' as $fn$
  select distinct co.id, co.slug, co.name
  from public.companies co
  join public.role_assignments ra on ra.tenant_id = co.tenant_id
  join public.role_capabilities rc on rc.role_key = ra.role_key
  where ra.profile_id = auth.uid()
    and ra.revoked_at is null
    and (ra.expires_at is null or ra.expires_at > now())
    and rc.capability_key = p_capability
    and co.status = 'active'
    and (ra.all_companies or exists (
      select 1 from public.role_assignment_companies rac
      where rac.assignment_id = ra.id and rac.company_id = co.id))
    and app.profile_is_active()
  order by co.name;
$fn$;

/* ── GET /me (doc 10 §4) — o que src/lib/session.ts mocka hoje ───────────── */
create or replace function public.me()
returns jsonb
language sql stable security definer set search_path = '' as $fn$
  select jsonb_build_object(
    'user', jsonb_build_object(
      'id', p.id, 'name', p.full_name, 'email', p.email,
      'initials', upper(left(split_part(p.full_name, ' ', 1), 1) ||
                        coalesce(left(nullif(split_part(p.full_name, ' ', 2), ''), 1), '')),
      'role', coalesce((select r.name from public.role_assignments ra
                        join public.roles r on r.key = ra.role_key
                        where ra.profile_id = p.id and ra.revoked_at is null
                        order by r.rank limit 1), 'sem papel'),
      'status', p.status,
      'mfaRequired', p.mfa_required,
      'mfaEnrolled', p.mfa_enrolled_at is not null,
      'mustChangePassword', p.must_change_password
    ),
    'tenant', jsonb_build_object('name', t.name, 'slug', t.slug),
    'session', jsonb_build_object('aal', app.session_aal()),
    'roles', coalesce((select jsonb_agg(jsonb_build_object(
                'role', ra.role_key,
                'companies', case when ra.all_companies then to_jsonb('*'::text)
                             else coalesce((select jsonb_agg(co.slug order by co.slug)
                                            from public.role_assignment_companies rac
                                            join public.companies co on co.id = rac.company_id
                                            where rac.assignment_id = ra.id), '[]'::jsonb) end,
                'expiresAt', ra.expires_at))
              from public.role_assignments ra
              where ra.profile_id = p.id and ra.revoked_at is null
                and (ra.expires_at is null or ra.expires_at > now())), '[]'::jsonb),
    /* Capacidades efetivas: o front usa para esconder. O banco continua negando. */
    'capabilities', coalesce((select jsonb_agg(distinct rc.capability_key)
              from public.role_assignments ra
              join public.role_capabilities rc on rc.role_key = ra.role_key
              where ra.profile_id = p.id and ra.revoked_at is null
                and (ra.expires_at is null or ra.expires_at > now())), '[]'::jsonb)
  )
  from public.profiles p
  join public.tenants t on t.id = p.tenant_id
  where p.id = auth.uid();
$fn$;

/* Marca presença — alimenta a coluna "Último acesso" de admin/usuarios. */
create or replace function public.touch_last_access()
returns void language sql security definer set search_path = '' as $fn$
  update public.profiles set last_access_at = now() where id = auth.uid();
$fn$;

/* ── superfície pública: só o que a aplicação precisa chamar ─────────────── */
revoke all on function public.authorize(text, text, text) from public;
revoke all on function public.companies_in_scope(text) from public;
revoke all on function public.me() from public;
revoke all on function public.touch_last_access() from public;

grant execute on function public.authorize(text, text, text) to authenticated;
grant execute on function public.companies_in_scope(text)    to authenticated;
grant execute on function public.me()                         to authenticated;
grant execute on function public.touch_last_access()          to authenticated;

/* As policies de RLS avaliam app.has_capability com os privilégios de quem
   consulta — então 'authenticated' PRECISA de execute. É seguro: a função é
   SECURITY DEFINER e só responde sobre o auth.uid() do próprio chamador,
   nunca sobre terceiros. Anônimo não executa nada. */
revoke all on function app.has_capability(text, text, text) from public, anon;
revoke all on function app.profile_is_active() from public, anon;
revoke all on function app.session_aal() from public, anon;
revoke all on function app.current_tenant_id() from public, anon;

grant execute on function app.has_capability(text, text, text) to authenticated;
grant execute on function app.profile_is_active()   to authenticated;
grant execute on function app.session_aal()         to authenticated;
grant execute on function app.current_tenant_id()   to authenticated;
grant execute on function app.match_capability(text, text) to authenticated;
