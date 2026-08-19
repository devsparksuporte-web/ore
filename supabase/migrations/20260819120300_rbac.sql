/* =============================================================================
   03 · RBAC — papéis × capacidades × escopo
   -----------------------------------------------------------------------------
   Espelho fiel de src/modules/permissions:
     roles                     <- Role (7 papéis)
     capabilities              <- catálogo "modulo.acao" (doc 09)
     role_capability_patterns  <- ROLE_POLICIES (com wildcard, fonte de verdade)
     role_capabilities         <- expansão materializada (o que a RLS lê)
     guest_denied_patterns     <- RESTRICTED_FROM_GUESTS
     role_assignments          <- RoleAssignment { role, companies, costCenters }

   Por que materializar: RLS roda por LINHA. Casar wildcard a cada linha é caro;
   a expansão vira lookup por índice. Os patterns continuam sendo o que um
   humano edita — o gatilho reconstrói a expansão.
============================================================================= */

create type public.capability_sensitivity as enum ('normal','sensivel','critica');

create table public.capabilities (
  key           text primary key check (key ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'),
  module        text not null,
  action        text not null,
  name          text not null,
  sensitivity   public.capability_sensitivity not null default 'normal',
  /* Capacidade crítica só é concedida em sessão com segundo fator (AAL2). */
  requires_mfa  boolean not null default false,
  /* 'doc-05' = já existe em ROLE_POLICIES · 'proposto' = lacuna do front */
  origin        text not null default 'doc-05' check (origin in ('doc-05','proposto')),
  created_at    timestamptz not null default now()
);
create index capabilities_module_idx on public.capabilities (module);

create table public.roles (
  key           text primary key,
  name          text not null,
  description   text not null,
  is_system     boolean not null default true,
  /* Convidado: sofre a lista de negação (RESTRICTED_FROM_GUESTS). */
  is_guest      boolean not null default false,
  /* MFA obrigatório para QUALQUER capacidade deste papel. */
  requires_mfa  boolean not null default false,
  rank          smallint not null default 100,
  created_at    timestamptz not null default now()
);

create table public.role_capability_patterns (
  role_key    text not null references public.roles(key) on update cascade on delete cascade,
  pattern     text not null check (pattern = '*' or pattern ~ '^[a-z][a-z0-9_]*\.(\*|[a-z][a-z0-9_]*)$'),
  primary key (role_key, pattern)
);

create table public.guest_denied_patterns (
  pattern text primary key,
  reason  text not null
);

create table public.role_capabilities (
  role_key       text not null references public.roles(key) on update cascade on delete cascade,
  capability_key text not null references public.capabilities(key) on update cascade on delete cascade,
  primary key (role_key, capability_key)
);
create index role_capabilities_cap_idx on public.role_capabilities (capability_key);

/* ── casamento de wildcard: mesma semântica de matchCapability() ──────────── */
create or replace function app.match_capability(p_pattern text, p_capability text)
returns boolean
language sql
immutable
set search_path = ''
as $fn$
  select case
    when p_pattern = '*'            then true
    when right(p_pattern, 2) = '.*' then starts_with(p_capability, left(p_pattern, -1))
    else p_pattern = p_capability
  end;
$fn$;

/* ── expansão materializada dos patterns ─────────────────────────────────── */
create or replace function app.rebuild_role_capabilities()
returns void
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  /* Sai o que deixou de casar com algum pattern do papel. */
  delete from public.role_capabilities rc
  where not exists (
    select 1
    from public.role_capability_patterns p
    join public.roles r on r.key = p.role_key
    where p.role_key = rc.role_key
      and app.match_capability(p.pattern, rc.capability_key)
      and not (r.is_guest and exists (
        select 1 from public.guest_denied_patterns g
        where app.match_capability(g.pattern, rc.capability_key)))
  );

  /* Entra o que passou a casar. Convidado nunca recebe o que a lista nega —
     a capacidade nao e filtrada depois: ela nao chega a existir para o papel. */
  insert into public.role_capabilities (role_key, capability_key)
  select distinct p.role_key, c.key
  from public.role_capability_patterns p
  join public.capabilities c on app.match_capability(p.pattern, c.key)
  join public.roles r on r.key = p.role_key
  where not (r.is_guest and exists (
    select 1 from public.guest_denied_patterns g
    where app.match_capability(g.pattern, c.key)))
  on conflict do nothing;
end;
$fn$;

create or replace function app.rebuild_role_capabilities_trg()
returns trigger language plpgsql security definer set search_path = '' as $fn$
begin
  perform app.rebuild_role_capabilities();
  return null;
end;
$fn$;

create trigger patterns_rebuild after insert or update or delete on public.role_capability_patterns
  for each statement execute function app.rebuild_role_capabilities_trg();
create trigger capabilities_rebuild after insert or update or delete on public.capabilities
  for each statement execute function app.rebuild_role_capabilities_trg();
create trigger guest_denied_rebuild after insert or update or delete on public.guest_denied_patterns
  for each statement execute function app.rebuild_role_capabilities_trg();

/* ── atribuição: papel + escopo, com validade e recertificação ───────────── */
create table public.role_assignments (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  profile_id        uuid not null references public.profiles(id) on delete cascade,
  role_key          text not null references public.roles(key) on update cascade,

  /* companies = "*" no front  ->  all_companies = true aqui.
     Caso contrário, o escopo vem de role_assignment_companies. */
  all_companies     boolean not null default false,
  all_cost_centers  boolean not null default true,

  granted_by        uuid references public.profiles(id),
  granted_at        timestamptz not null default now(),
  grant_reason      text,

  /* Acesso temporário (auditor externo, consultor): expira sozinho. */
  expires_at        timestamptz,
  last_certified_at timestamptz,
  certified_by      uuid references public.profiles(id),

  revoked_at        timestamptz,
  revoked_by        uuid references public.profiles(id),
  revoke_reason     text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint role_assignments_expiry_future check (expires_at is null or expires_at > granted_at),
  constraint role_assignments_revocation_explained check (revoked_at is null or revoke_reason is not null)
);

/* Um papel vigente por usuário. Trocar escopo = revogar e reatribuir (rastro). */
create unique index role_assignments_active_uk
  on public.role_assignments (profile_id, role_key) where revoked_at is null;
create index role_assignments_profile_idx on public.role_assignments (profile_id) where revoked_at is null;
create index role_assignments_tenant_idx  on public.role_assignments (tenant_id, role_key) where revoked_at is null;

create trigger role_assignments_touch before update on public.role_assignments
  for each row execute function app.touch_updated_at();

create table public.role_assignment_companies (
  assignment_id uuid not null references public.role_assignments(id) on delete cascade,
  company_id    uuid not null references public.companies(id) on delete cascade,
  primary key (assignment_id, company_id)
);
create index ra_companies_company_idx on public.role_assignment_companies (company_id);

create table public.role_assignment_cost_centers (
  assignment_id  uuid not null references public.role_assignments(id) on delete cascade,
  cost_center_id uuid not null references public.cost_centers(id) on delete cascade,
  primary key (assignment_id, cost_center_id)
);

/* ── invariantes de escopo (verificados no COMMIT, não pelo app) ──────────────
   1. all_companies=false exige ao menos uma empresa;
   2. all_companies=true não convive com lista (escopo ambíguo);
   3. empresa listada pertence ao mesmo tenant da atribuição;
   4. centro de custo listado pertence a uma empresa do escopo.              */
create or replace function app.validate_assignment_scope()
returns trigger
language plpgsql
set search_path = ''
as $fn$
declare
  /* A funcao serve 3 tabelas (a atribuicao e suas duas de escopo) e roda em
     INSERT/UPDATE/DELETE. NEW nao existe em DELETE, OLD nao existe em INSERT:
     acessar o campo direto levantaria 'record is not assigned yet'. Passar
     pelo jsonb resolve os dois casos com um caminho so. */
  j jsonb := to_jsonb(case when tg_op = 'DELETE' then old else new end);
  v_id uuid := coalesce(j ->> 'assignment_id', j ->> 'id')::uuid;
  r public.role_assignments%rowtype;
  v_companies int;
  v_ccs int;
begin
  select * into r from public.role_assignments where id = v_id;
  if not found then return null; end if;        -- apagada em cascata
  if r.revoked_at is not null then return null; end if;

  select count(*) into v_companies from public.role_assignment_companies where assignment_id = r.id;
  select count(*) into v_ccs       from public.role_assignment_cost_centers where assignment_id = r.id;

  if not r.all_companies and v_companies = 0 then
    raise exception 'Atribuicao %: escopo vazio. Marque all_companies ou informe ao menos uma empresa.', r.id
      using errcode = 'check_violation';
  end if;

  if r.all_companies and v_companies > 0 then
    raise exception 'Atribuicao %: all_companies=true nao convive com lista de empresas.', r.id
      using errcode = 'check_violation';
  end if;

  if exists (select 1 from public.role_assignment_companies rac
             join public.companies c on c.id = rac.company_id
             where rac.assignment_id = r.id and c.tenant_id <> r.tenant_id) then
    raise exception 'Atribuicao %: empresa de outro tenant no escopo.', r.id
      using errcode = 'check_violation';
  end if;

  if not r.all_cost_centers and v_ccs = 0 then
    raise exception 'Atribuicao %: all_cost_centers=false exige ao menos um centro de custo.', r.id
      using errcode = 'check_violation';
  end if;

  if not r.all_companies and exists (
      select 1 from public.role_assignment_cost_centers racc
      join public.cost_centers cc on cc.id = racc.cost_center_id
      where racc.assignment_id = r.id
        and not exists (select 1 from public.role_assignment_companies rac
                        where rac.assignment_id = r.id and rac.company_id = cc.company_id)) then
    raise exception 'Atribuicao %: centro de custo fora das empresas do escopo.', r.id
      using errcode = 'check_violation';
  end if;

  return null;
end;
$fn$;

create constraint trigger role_assignments_scope_check
  after insert or update on public.role_assignments
  deferrable initially deferred for each row execute function app.validate_assignment_scope();
create constraint trigger ra_companies_scope_check
  after insert or update or delete on public.role_assignment_companies
  deferrable initially deferred for each row execute function app.validate_assignment_scope();
create constraint trigger ra_cost_centers_scope_check
  after insert or update or delete on public.role_assignment_cost_centers
  deferrable initially deferred for each row execute function app.validate_assignment_scope();

/* ── MFA derivado do papel: conceder papel forte liga a exigência ─────────── */
create or replace function app.sync_mfa_requirement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_profile uuid := case when tg_op = 'DELETE' then old.profile_id else new.profile_id end;
begin
  update public.profiles p
     set mfa_required = exists (
       select 1 from public.role_assignments ra
       join public.roles r on r.key = ra.role_key
       where ra.profile_id = v_profile
         and ra.revoked_at is null
         and (ra.expires_at is null or ra.expires_at > now())
         and r.requires_mfa)
   where p.id = v_profile;
  return null;
end;
$fn$;

create trigger role_assignments_sync_mfa
  after insert or update or delete on public.role_assignments
  for each row execute function app.sync_mfa_requirement();
