/* =============================================================================
   08 · ROW LEVEL SECURITY
   -----------------------------------------------------------------------------
   Postura: NEGAR POR PADRÃO. RLS ligada em toda tabela de public; sem policy,
   sem linha. O que não está escrito abaixo, não acontece.

   Escrita em RBAC e ciclo de vida NÃO tem policy de propósito: o caminho é
   grant_role / revoke_role / deactivate_user (migration 07), que verificam
   capacidade, validam a regra e escrevem na trilha. Um UPDATE direto pularia
   os três — então ele simplesmente não existe.
============================================================================= */

alter table public.tenants                     enable row level security;
alter table public.companies                   enable row level security;
alter table public.cost_centers                enable row level security;
alter table public.profiles                    enable row level security;
alter table public.roles                       enable row level security;
alter table public.capabilities                enable row level security;
alter table public.role_capability_patterns    enable row level security;
alter table public.guest_denied_patterns       enable row level security;
alter table public.role_capabilities           enable row level security;
alter table public.role_assignments            enable row level security;
alter table public.role_assignment_companies   enable row level security;
alter table public.role_assignment_cost_centers enable row level security;
alter table public.invites                     enable row level security;

/* Anônimo não lê nada. A tela de login não consulta o banco. */
revoke all on all tables in schema public from anon;

/* ── tenant e empresas ───────────────────────────────────────────────────── */
create policy tenant_self_read on public.tenants
  for select to authenticated
  using (id = app.current_tenant_id() and app.profile_is_active());

create policy companies_in_scope_read on public.companies
  for select to authenticated
  using (
    tenant_id = app.current_tenant_id()
    and (app.has_capability('dashboard.ver', slug) or app.has_capability('portfolio.ver'))
  );

create policy companies_admin_write on public.companies
  for all to authenticated
  using (tenant_id = app.current_tenant_id() and app.has_capability('config.editar'))
  with check (tenant_id = app.current_tenant_id() and app.has_capability('config.editar'));

create policy cost_centers_in_scope_read on public.cost_centers
  for select to authenticated
  using (
    tenant_id = app.current_tenant_id()
    and exists (select 1 from public.companies c
                where c.id = cost_centers.company_id
                  and app.has_capability('dashboard.ver', c.slug))
  );

/* ── perfis ──────────────────────────────────────────────────────────────────
   Cada um vê a si mesmo. A lista completa (com e-mail e status) exige
   usuarios.ver — é dado pessoal, não diretório aberto.                      */
create policy profiles_self_read on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy profiles_admin_read on public.profiles
  for select to authenticated
  using (tenant_id = app.current_tenant_id() and app.has_capability('usuarios.ver'));

create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid() and app.profile_is_active())
  with check (id = auth.uid());

/* Policy não filtra COLUNA. Este gatilho fecha a brecha: o próprio usuário
   edita nome e cargo; tenant, status, MFA e senha são do administrador. */
create or replace function app.guard_profile_self_update()
returns trigger language plpgsql security definer set search_path = '' as $fn$
begin
  if auth.uid() is null then return new; end if;                 -- service_role/migração
  if app.has_capability('usuarios.administrar') then return new; end if;

  if new.id <> old.id
     or new.tenant_id  is distinct from old.tenant_id
     or new.status     is distinct from old.status
     or new.email      is distinct from old.email
     or new.mfa_required is distinct from old.mfa_required
     or new.must_change_password is distinct from old.must_change_password
     or new.deactivated_at is distinct from old.deactivated_at then
    raise exception 'Somente nome e cargo podem ser alterados pelo proprio usuario'
      using errcode = '42501';
  end if;
  return new;
end;
$fn$;

create trigger profiles_guard_self_update before update on public.profiles
  for each row execute function app.guard_profile_self_update();

/* ── catálogo RBAC: leitura ampla, escrita só por migração ───────────────────
   Papéis e capacidades são CÓDIGO, não configuração de tela. Mudam por
   migration revisada em PR, junto com ROLE_POLICIES do front — nunca por
   UPDATE em produção.                                                       */
create policy roles_read on public.roles
  for select to authenticated using (app.profile_is_active());
create policy capabilities_read on public.capabilities
  for select to authenticated using (app.profile_is_active());
create policy role_capabilities_read on public.role_capabilities
  for select to authenticated using (app.profile_is_active());
create policy patterns_read on public.role_capability_patterns
  for select to authenticated using (app.has_capability('usuarios.ver'));
create policy guest_denied_read on public.guest_denied_patterns
  for select to authenticated using (app.has_capability('usuarios.ver'));

/* ── atribuições: cada um vê as suas; o admin vê as do tenant ─────────────── */
create policy assignments_self_read on public.role_assignments
  for select to authenticated
  using (profile_id = auth.uid());

create policy assignments_admin_read on public.role_assignments
  for select to authenticated
  using (tenant_id = app.current_tenant_id() and app.has_capability('usuarios.ver'));

create policy ra_companies_read on public.role_assignment_companies
  for select to authenticated
  using (exists (select 1 from public.role_assignments ra
                 where ra.id = role_assignment_companies.assignment_id
                   and (ra.profile_id = auth.uid()
                        or (ra.tenant_id = app.current_tenant_id() and app.has_capability('usuarios.ver')))));

create policy ra_cost_centers_read on public.role_assignment_cost_centers
  for select to authenticated
  using (exists (select 1 from public.role_assignments ra
                 where ra.id = role_assignment_cost_centers.assignment_id
                   and (ra.profile_id = auth.uid()
                        or (ra.tenant_id = app.current_tenant_id() and app.has_capability('usuarios.ver')))));

/* Sem policy de INSERT/UPDATE/DELETE em role_assignments*: use grant_role(),
   revoke_role(). É a diferença entre "permissão concedida" e "linha inserida". */

/* ── convites ────────────────────────────────────────────────────────────── */
create policy invites_admin_read on public.invites
  for select to authenticated
  using (tenant_id = app.current_tenant_id() and app.has_capability('usuarios.ver'));

create policy invites_admin_insert on public.invites
  for insert to authenticated
  with check (
    tenant_id = app.current_tenant_id()
    and app.has_capability('usuarios.convidar')
    and created_by = auth.uid()
    and status = 'pending'
    /* Convite só para domínio autorizado do tenant (quando houver lista). */
    and (
      (select cardinality(t.allowed_email_domains) from public.tenants t where t.id = tenant_id) = 0
      or split_part(email, '@', 2) = any (
           select unnest(t.allowed_email_domains) from public.tenants t where t.id = tenant_id)
    )
    /* Convidar administrador exige ser administrador. */
    and (role_key <> 'administrador' or app.has_capability('usuarios.administrar'))
  );

create policy invites_admin_update on public.invites
  for update to authenticated
  using (tenant_id = app.current_tenant_id() and app.has_capability('usuarios.convidar'))
  with check (tenant_id = app.current_tenant_id());

/* ── diretório mínimo ────────────────────────────────────────────────────────
   Telas mostram "aprovado por Bruna M. Cruz". Isso não pode exigir
   usuarios.ver — mas também não expõe e-mail, status nem papéis.            */
create or replace view public.v_user_directory as
  select p.id, p.full_name,
         upper(left(split_part(p.full_name,' ',1),1) ||
               coalesce(left(nullif(split_part(p.full_name,' ',2),''),1),'')) as initials
  from public.profiles p
  where p.tenant_id = app.current_tenant_id()
    and p.status = 'active'
    and app.profile_is_active();

revoke all on public.v_user_directory from public, anon;
grant select on public.v_user_directory to authenticated;

/* ── grants de tabela (a RLS filtra; o grant abre a porta) ───────────────── */
grant select on public.tenants, public.companies, public.cost_centers,
                public.profiles, public.roles, public.capabilities,
                public.role_capabilities, public.role_capability_patterns,
                public.guest_denied_patterns, public.role_assignments,
                public.role_assignment_companies, public.role_assignment_cost_centers,
                public.invites
  to authenticated;

grant update (full_name, job_title, last_access_at) on public.profiles to authenticated;
grant insert, update on public.invites to authenticated;
grant update (name, short_name, status) on public.companies to authenticated;

/* Novas tabelas em public nascem fechadas para anon. */
alter default privileges in schema public revoke all on tables from anon;
