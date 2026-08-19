/* =============================================================================
   07 · CICLO DE VIDA DA CONTA — convite, concessão, revogação, desligamento
   -----------------------------------------------------------------------------
   Nenhuma dessas operações é um INSERT solto do cliente. Todas passam por
   função que (a) verifica a capacidade, (b) valida a regra e (c) escreve na
   trilha. Assim "quem deu esse acesso e por quê" tem sempre resposta.
============================================================================= */

create type public.invite_status as enum ('pending','accepted','expired','revoked');

create table public.invites (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  email          text not null check (email = lower(email)),
  role_key       text not null references public.roles(key) on update cascade,
  all_companies  boolean not null default false,
  company_ids    uuid[] not null default '{}',
  /* NUNCA o token em claro: só o hash. Vazou o banco, não vazou o convite. */
  token_hash     text not null unique,
  status         public.invite_status not null default 'pending',
  expires_at     timestamptz not null default (now() + interval '7 days'),
  resend_count   int not null default 0 check (resend_count <= 5),
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now(),
  accepted_at    timestamptz,
  accepted_by    uuid references public.profiles(id),
  revoked_at     timestamptz,
  revoked_by     uuid references public.profiles(id)
);
create unique index invites_pending_uk on public.invites (tenant_id, email) where status = 'pending';
create index invites_status_idx on public.invites (tenant_id, status);

comment on table public.invites is
  'Convite = intenção de acesso com prazo. Expira em 7 dias (tela admin/usuarios), reenviável 5x. Aceite cria auth.users -> profile via trigger.';

/* Convite vencido deixa de valer sozinho — sem depender de job. */
create or replace function public.expire_stale_invites()
returns integer language sql security definer set search_path = '' as $fn$
  with x as (
    update public.invites set status = 'expired'
    where status = 'pending' and expires_at < now()
    returning 1
  ) select count(*)::int from x;
$fn$;

/* ── conceder papel ──────────────────────────────────────────────────────────
   Exige usuarios.administrar E sessão AAL2 (a capacidade é 'critica').
   Regras de negação embutidas:
     · ninguém concede papel a si mesmo (auto-elevação);
     · escopo tem de ser coerente (validado pelos constraint triggers);
     · papel 'administrador' só é concedido por outro 'administrador'.      */
create or replace function public.grant_role(
  p_profile_id  uuid,
  p_role_key    text,
  p_companies   text[] default null,      -- null ou '{*}' => todas
  p_cost_centers text[] default null,
  p_reason      text default null,
  p_expires_at  timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_tenant uuid := app.current_tenant_id();
  v_all boolean := (p_companies is null or p_companies = array['*']);
  v_id uuid;
  v_slug text;
  v_company uuid;
begin
  if not app.has_capability('usuarios.administrar') then
    perform app.log_access_event('grant_role','profile',p_profile_id::text,null,'usuarios.administrar','deny','sem capacidade');
    raise exception 'Sem permissao para conceder papeis' using errcode = '42501';
  end if;

  if p_profile_id = auth.uid() then
    raise exception 'Auto-concessao de papel nao e permitida' using errcode = '42501';
  end if;

  if p_role_key = 'administrador' and not exists (
      select 1 from public.role_assignments ra
      where ra.profile_id = auth.uid() and ra.role_key = 'administrador' and ra.revoked_at is null) then
    raise exception 'Somente um administrador concede o papel administrador' using errcode = '42501';
  end if;

  if not exists (select 1 from public.profiles where id = p_profile_id and tenant_id = v_tenant) then
    raise exception 'Usuario nao pertence ao seu tenant' using errcode = '42501';
  end if;

  insert into public.role_assignments (tenant_id, profile_id, role_key, all_companies,
                                       all_cost_centers, granted_by, grant_reason, expires_at,
                                       last_certified_at, certified_by)
  values (v_tenant, p_profile_id, p_role_key, v_all,
          p_cost_centers is null, auth.uid(), p_reason, p_expires_at, now(), auth.uid())
  returning id into v_id;

  if not v_all then
    foreach v_slug in array p_companies loop
      select id into v_company from public.companies where tenant_id = v_tenant and slug = v_slug;
      if v_company is null then
        raise exception 'Empresa % inexistente no tenant', v_slug using errcode = 'check_violation';
      end if;
      insert into public.role_assignment_companies (assignment_id, company_id) values (v_id, v_company);
    end loop;
  end if;

  if p_cost_centers is not null then
    insert into public.role_assignment_cost_centers (assignment_id, cost_center_id)
    select v_id, cc.id from public.cost_centers cc
    where cc.tenant_id = v_tenant and cc.code = any(p_cost_centers);
  end if;

  perform app.log_access_event('grant_role','role_assignment',v_id::text,null,'usuarios.administrar','allow',
    p_reason, null, jsonb_build_object('profile_id',p_profile_id,'role',p_role_key,
                                       'companies', coalesce(p_companies, array['*']), 'expires_at', p_expires_at));
  return v_id;
end;
$fn$;

/* ── revogar papel: sempre com motivo, nunca com DELETE ──────────────────── */
create or replace function public.revoke_role(p_assignment_id uuid, p_reason text)
returns void
language plpgsql security definer set search_path = '' as $fn$
declare r public.role_assignments%rowtype;
begin
  if not app.has_capability('usuarios.administrar') then
    raise exception 'Sem permissao para revogar papeis' using errcode = '42501';
  end if;
  if coalesce(btrim(p_reason),'') = '' then
    raise exception 'Revogacao exige motivo' using errcode = 'check_violation';
  end if;

  select * into r from public.role_assignments
   where id = p_assignment_id and tenant_id = app.current_tenant_id();
  if not found then raise exception 'Atribuicao nao encontrada' using errcode = 'no_data_found'; end if;

  update public.role_assignments
     set revoked_at = now(), revoked_by = auth.uid(), revoke_reason = p_reason
   where id = p_assignment_id;

  perform app.log_access_event('revoke_role','role_assignment',p_assignment_id::text,null,
    'usuarios.administrar','allow',p_reason,
    jsonb_build_object('profile_id',r.profile_id,'role',r.role_key), null);
end;
$fn$;

/* ── desligamento: corta o acesso AGORA, preserva o rastro ────────────────────
   Não apaga o usuário. Desativa o profile, revoga todos os papéis vigentes e
   derruba as sessões (o refresh deixa de valer). O histórico de aprovações e
   publicações continua atribuível a uma pessoa real — apagar seria fraudar a
   trilha.                                                                    */
create or replace function public.deactivate_user(p_profile_id uuid, p_reason text)
returns void
language plpgsql security definer set search_path = '' as $fn$
begin
  if not app.has_capability('usuarios.administrar') then
    raise exception 'Sem permissao para desativar usuarios' using errcode = '42501';
  end if;
  if p_profile_id = auth.uid() then
    raise exception 'Nao e possivel desativar a propria conta' using errcode = '42501';
  end if;
  if coalesce(btrim(p_reason),'') = '' then
    raise exception 'Desativacao exige motivo' using errcode = 'check_violation';
  end if;

  /* Nunca deixar o tenant sem administrador ativo. */
  if exists (select 1 from public.role_assignments ra
             where ra.profile_id = p_profile_id and ra.role_key = 'administrador' and ra.revoked_at is null)
     and (select count(distinct ra.profile_id) from public.role_assignments ra
          join public.profiles p on p.id = ra.profile_id
          where ra.role_key = 'administrador' and ra.revoked_at is null
            and p.status = 'active' and p.tenant_id = app.current_tenant_id()) <= 1 then
    raise exception 'Este e o ultimo administrador ativo do tenant' using errcode = '42501';
  end if;

  update public.profiles
     set status = 'deactivated', deactivated_at = now(), deactivated_by = auth.uid(),
         deactivation_reason = p_reason
   where id = p_profile_id and tenant_id = app.current_tenant_id();

  update public.role_assignments
     set revoked_at = now(), revoked_by = auth.uid(),
         revoke_reason = coalesce(revoke_reason, 'Desligamento: ' || p_reason)
   where profile_id = p_profile_id and revoked_at is null;

  /* Encerra sessões: o access token expira em minutos, o refresh morre aqui. */
  delete from auth.sessions where user_id = p_profile_id;

  perform app.log_access_event('deactivate_user','profile',p_profile_id::text,null,
    'usuarios.administrar','allow',p_reason);
end;
$fn$;

/* ── LGPD · anonimização (só após retenção legal do vínculo) ─────────────── */
create or replace function public.anonymize_user(p_profile_id uuid, p_reason text)
returns void
language plpgsql security definer set search_path = '' as $fn$
begin
  if not app.has_capability('usuarios.administrar') then
    raise exception 'Sem permissao' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles
                 where id = p_profile_id and status = 'deactivated'
                   and deactivated_at < now() - interval '5 years') then
    raise exception 'Anonimizacao exige conta desativada ha mais de 5 anos (retencao contabil)'
      using errcode = '42501';
  end if;

  update public.profiles
     set full_name = 'Usuario removido',
         email = 'anon+' || left(md5(id::text), 12) || '@invalido.local',
         job_title = null
   where id = p_profile_id;

  update auth.users
     set email = 'anon+' || left(md5(id::text), 12) || '@invalido.local',
         phone = null, raw_user_meta_data = '{}'::jsonb
   where id = p_profile_id;

  perform app.log_access_event('anonymize_user','profile',p_profile_id::text,null,null,'allow',p_reason);
end;
$fn$;

/* ── recertificação: acesso que ninguém revisa vira acesso esquecido ─────── */
create or replace view public.v_access_recertification_due as
  select ra.id as assignment_id, p.full_name, p.email, ra.role_key,
         case when ra.all_companies then '*' else
           (select string_agg(co.slug, ', ' order by co.slug)
            from public.role_assignment_companies rac
            join public.companies co on co.id = rac.company_id
            where rac.assignment_id = ra.id) end as escopo,
         ra.granted_at, ra.last_certified_at, ra.expires_at,
         coalesce(ra.last_certified_at, ra.granted_at) < now() - interval '180 days' as vencida
  from public.role_assignments ra
  join public.profiles p on p.id = ra.profile_id
  where ra.revoked_at is null
    and ra.tenant_id = app.current_tenant_id()
    and app.has_capability('usuarios.administrar');

create or replace function public.certify_assignment(p_assignment_id uuid)
returns void language plpgsql security definer set search_path = '' as $fn$
begin
  if not app.has_capability('usuarios.administrar') then
    raise exception 'Sem permissao' using errcode = '42501';
  end if;
  update public.role_assignments
     set last_certified_at = now(), certified_by = auth.uid()
   where id = p_assignment_id and tenant_id = app.current_tenant_id() and revoked_at is null;
  perform app.log_access_event('certify_assignment','role_assignment',p_assignment_id::text,null,null,'allow','recertificacao periodica');
end;
$fn$;

/* ── superfície exposta ─────────────────────────────────────────────────── */
revoke all on function public.grant_role(uuid,text,text[],text[],text,timestamptz) from public, anon;
revoke all on function public.revoke_role(uuid,text) from public, anon;
revoke all on function public.deactivate_user(uuid,text) from public, anon;
revoke all on function public.anonymize_user(uuid,text) from public, anon;
revoke all on function public.certify_assignment(uuid) from public, anon;
revoke all on function public.expire_stale_invites() from public, anon;

grant execute on function public.grant_role(uuid,text,text[],text[],text,timestamptz) to authenticated;
grant execute on function public.revoke_role(uuid,text)      to authenticated;
grant execute on function public.deactivate_user(uuid,text)  to authenticated;
grant execute on function public.anonymize_user(uuid,text)   to authenticated;
grant execute on function public.certify_assignment(uuid)    to authenticated;
grant execute on function public.expire_stale_invites()      to authenticated;

revoke all on public.v_access_recertification_due from public, anon;
grant select on public.v_access_recertification_due to authenticated;
