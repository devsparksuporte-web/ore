/* =============================================================================
   ORE · REGRAS DE BANCO — ARQUIVO ÚNICO PARA APLICAÇÃO MANUAL
   -----------------------------------------------------------------------------
   Gerado a partir de supabase/migrations/ (00 -> 09), na ordem. Não edite este
   arquivo: edite as migrations e regenere com

       bash supabase/tests/gerar-arquivo-unico.sh

   COMO APLICAR
   ------------
   Supabase Dashboard > SQL Editor > New query > cole TUDO > Run.

   O editor roda o bloco inteiro em UMA transação: se qualquer comando falhar,
   nada é aplicado. Não há estado pela metade — leia o erro, corrija, rode de
   novo. Leva alguns segundos.

   DEPOIS DE RODAR (nada disto é SQL — sem estes passos, metade das regras não
   está no ar):

   1. Authentication > Hooks
        · Custom Access Token           -> app.custom_access_token_hook
        · Password Verification Attempt -> app.password_verification_attempt_hook
      Sem o segundo, NÃO EXISTE bloqueio progressivo de login.

   2. Authentication > Password protection
        · Minimum password length ............ 12
        · Required characters ................ letras minúsculas, maiúsculas,
                                               dígitos e símbolos
        · Prevent use of leaked passwords .... LIGADO (HIBP)

   3. Authentication > Sessions
        · Time-box user sessions ............. 12 horas
        · Inactivity timeout ................. 30 minutos
        · Access token (JWT) expiry .......... 1800 s
        · Refresh token rotation ............. LIGADO, reuse interval 10 s

   4. Authentication > Sign In / Providers
        · Allow new users to sign up ......... DESLIGADO (plataforma é por convite)
        · Confirm email ...................... LIGADO
        · Secure email change ................ LIGADO
        · Secure password change ............. LIGADO
        · MFA (TOTP) ......................... habilitado

   5. Primeiro administrador — nesta ordem:
        a) Authentication > Users > Invite user (e-mail corporativo)
        b) a pessoa entra e CADASTRA O TOTP
        c) SQL Editor:  select public.bootstrap_first_admin('email@dominio');
      Cadastrar o TOTP antes é obrigatório: o papel administrador exige AAL2,
      e um admin sem segundo fator fica travado sem ninguém que possa destravá-lo.

   6. Conferência: cole supabase/tests/conferir.sql no SQL Editor.

   Regras, matriz de papéis e o que ficou de fora: docs/13-regras-de-banco.md
============================================================================= */




/* ###########################################################################
   20260819120000_extensions_e_schemas.sql
   ########################################################################### */

/* =============================================================================
   00 · EXTENSÕES E SCHEMAS
   -----------------------------------------------------------------------------
   Separação de responsabilidades:
     public   → dados de negócio (expostos via PostgREST, TODOS sob RLS)
     app      → funções de decisão de acesso e hooks (NÃO expostas; security definer)
     security → estado de defesa do login (tentativas, bloqueios) — só o Auth escreve
     audit    → trilha append-only (ninguém atualiza, ninguém apaga)

   Princípio (espelha P-E4 do front): a UI esconde, o BANCO nega.
   Toda política aqui é avaliada no servidor, independentemente do front.
============================================================================= */

create extension if not exists pgcrypto with schema extensions;

create schema if not exists app;
create schema if not exists security;
create schema if not exists audit;

comment on schema app is
  'Motor de autorização (espelho de src/modules/permissions) + hooks do Supabase Auth. Funções security definer com search_path fixo.';
comment on schema security is
  'Defesa de autenticação: tentativas de login, bloqueio progressivo. Escrito apenas pelo GoTrue via hook.';
comment on schema audit is
  'Trilha imutável. Sem UPDATE, sem DELETE — nem para o dono da tabela.';

/* Nenhum papel do PostgREST enxerga app/security/audit diretamente.
   O acesso acontece por funções e views controladas. */
revoke all on schema app, security, audit from public;
grant usage on schema app to authenticated, service_role;

/* ── utilitário compartilhado ─────────────────────────────────────────────── */
create or replace function app.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


/* ###########################################################################
   20260819120100_tenancy.sql
   ########################################################################### */

/* =============================================================================
   01 · TENANT, INVESTIDAS E CENTROS DE CUSTO
   -----------------------------------------------------------------------------
   O escopo de acesso da plataforma é hierárquico e igual ao do front:
       tenant  →  empresa (investida)  →  centro de custo
   RoleAssignment.companies ("*" | slugs) e .costCenters vivem aqui.
============================================================================= */

create table public.tenants (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]{2,40}$'),
  name        text not null,
  /* Domínios de e-mail que podem receber convite sem exceção manual. */
  allowed_email_domains text[] not null default '{}',
  status      text not null default 'active' check (status in ('active','suspended')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.companies (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  slug        text not null check (slug ~ '^[a-z0-9-]{2,60}$'),
  name        text not null,
  short_name  text,
  status      text not null default 'active' check (status in ('active','divested','archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  /* slug é a chave que o front usa na URL /e/[empresa] — único por tenant */
  unique (tenant_id, slug)
);
create index companies_tenant_idx on public.companies (tenant_id) where status = 'active';

create table public.cost_centers (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  company_id  uuid not null references public.companies(id) on delete cascade,
  code        text not null,
  name        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, code)
);
create index cost_centers_company_idx on public.cost_centers (company_id);

create trigger tenants_touch      before update on public.tenants      for each row execute function app.touch_updated_at();
create trigger companies_touch    before update on public.companies    for each row execute function app.touch_updated_at();
create trigger cost_centers_touch before update on public.cost_centers for each row execute function app.touch_updated_at();

comment on column public.companies.slug is
  'Mesmo slug de src/mocks/companies.ts — é o identificador de escopo em RoleAssignment.companies.';


/* ###########################################################################
   20260819120200_identity.sql
   ########################################################################### */

/* =============================================================================
   02 · IDENTIDADE — public.profiles (1:1 com auth.users)
   -----------------------------------------------------------------------------
   REGRA DE OURO: senha NUNCA transita nem repousa em tabela nossa.
   O hash vive em auth.users.encrypted_password, gerenciado pelo GoTrue.
   Nenhuma migration, função ou policy deste projeto lê essa coluna.

   Aqui ficam apenas os ATRIBUTOS DE GOVERNANÇA da conta: tenant, status do
   ciclo de vida (convidado → ativo → desativado), exigência de MFA, rotação
   de senha e último acesso.
============================================================================= */

create type public.profile_status as enum ('invited','active','suspended','deactivated');

create table public.profiles (
  /* PK = auth.users.id. Sem coluna própria: uma conta, uma identidade. */
  id                    uuid primary key references auth.users(id) on delete cascade,
  tenant_id             uuid not null references public.tenants(id) on delete restrict,
  full_name             text not null check (length(btrim(full_name)) between 2 and 120),
  email                 text not null check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  job_title             text,
  status                public.profile_status not null default 'invited',

  /* ── senha (metadados; o segredo é do GoTrue) ───────────────────────────── */
  password_changed_at   timestamptz,
  must_change_password  boolean not null default false,

  /* ── MFA ────────────────────────────────────────────────────────────────── */
  /* Derivado do papel (ver app.sync_mfa_requirement) — admin e financeiro
     não navegam sem AAL2. Pode ser elevado manualmente, nunca rebaixado
     abaixo do que o papel exige. */
  mfa_required          boolean not null default false,
  mfa_enrolled_at       timestamptz,

  /* ── ciclo de vida ──────────────────────────────────────────────────────── */
  last_access_at        timestamptz,
  deactivated_at        timestamptz,
  deactivated_by        uuid references public.profiles(id),
  deactivation_reason   text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  /* Desativação é sempre explicada — exigência de auditoria. */
  constraint profiles_deactivation_complete check (
    (status <> 'deactivated') or (deactivated_at is not null and deactivation_reason is not null)
  )
);

create unique index profiles_tenant_email_uk on public.profiles (tenant_id, email);
create index profiles_tenant_status_idx on public.profiles (tenant_id, status);

create trigger profiles_touch before update on public.profiles
  for each row execute function app.touch_updated_at();

/* ── e-mail do profile segue o e-mail da conta, sempre em minúsculas ──────── */
create or replace function app.normalize_profile_email()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.email := lower(btrim(new.email));
  return new;
end;
$$;
create trigger profiles_normalize_email before insert or update of email on public.profiles
  for each row execute function app.normalize_profile_email();

/* ── provisionamento: toda conta criada no Auth ganha um profile ──────────────
   O tenant vem do metadata do convite; na ausência, o único tenant ativo.
   Conta sem tenant resolvível é rejeitada — não existe usuário órfão. */
create or replace function app.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant uuid;
begin
  select t.id into v_tenant
  from public.tenants t
  where t.slug = coalesce(new.raw_user_meta_data ->> 'tenant_slug', '')
    and t.status = 'active';

  /* Fallback: só é seguro quando existe EXATAMENTE um tenant ativo.
     Com mais de um, a conta é rejeitada — errar o tenant é vazar dados. */
  if v_tenant is null then
    select t.id into v_tenant
      from public.tenants t
     where t.status = 'active'
       and (select count(*) from public.tenants where status = 'active') = 1;
  end if;

  if v_tenant is null then
    raise exception 'tenant_slug ausente ou ambiguo no metadata da conta %', new.id
      using errcode = 'check_violation';
  end if;

  insert into public.profiles (id, tenant_id, full_name, email, status, password_changed_at)
  values (
    new.id,
    v_tenant,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    lower(new.email),
    case when new.email_confirmed_at is null
         then 'invited'::public.profile_status
         else 'active'::public.profile_status end,
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.handle_new_auth_user();

/* ── rotação de senha: registra a troca sem tocar no segredo ──────────────── */
create or replace function app.on_auth_password_changed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.encrypted_password is distinct from old.encrypted_password then
    update public.profiles
       set password_changed_at = now(),
           must_change_password = false
     where id = new.id;
  end if;
  /* confirmação de e-mail promove o convidado a ativo */
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.profiles set status = 'active' where id = new.id and status = 'invited';
  end if;
  return new;
end;
$$;

create trigger on_auth_user_password_changed
  after update of encrypted_password, email_confirmed_at on auth.users
  for each row execute function app.on_auth_password_changed();


/* ###########################################################################
   20260819120300_rbac.sql
   ########################################################################### */

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


/* ###########################################################################
   20260819120400_access_engine.sql
   ########################################################################### */

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


/* ###########################################################################
   20260819120500_audit_e_seguranca.sql
   ########################################################################### */

/* =============================================================================
   05 · TRILHA IMUTÁVEL E DEFESA DE LOGIN
   -----------------------------------------------------------------------------
   audit.access_events   — quem fez o quê, onde, com qual capacidade. Append-only.
   security.login_attempts / account_locks — bloqueio progressivo por e-mail+IP.

   "Imutável" aqui é literal: UPDATE e DELETE disparam exceção mesmo para o dono
   da tabela (force row level security + gatilho). Correção de trilha se faz com
   um novo evento, nunca apagando o anterior.
============================================================================= */

create table audit.access_events (
  id             bigint generated always as identity primary key,
  occurred_at    timestamptz not null default now(),
  tenant_id      uuid,
  actor_id       uuid,                    -- sem FK: o rastro sobrevive ao usuário
  actor_email    text,
  action         text not null,           -- 'login' | 'grant_role' | 'revoke_role' | 'export' | ...
  entity         text,                    -- 'profile' | 'role_assignment' | 'periodo' | ...
  entity_id      text,
  company_slug   text,
  capability     text,
  decision       text check (decision in ('allow','deny')),
  reason         text,
  ip             inet,
  user_agent     text,
  request_id     text,
  before_state   jsonb,
  after_state    jsonb
);
create index access_events_tenant_time_idx on audit.access_events (tenant_id, occurred_at desc);
create index access_events_actor_idx       on audit.access_events (actor_id, occurred_at desc);
create index access_events_action_idx      on audit.access_events (action, occurred_at desc);

create or replace function audit.block_mutation()
returns trigger language plpgsql set search_path = '' as $fn$
begin
  raise exception 'audit.access_events e append-only: % nao e permitido', tg_op
    using errcode = 'insufficient_privilege';
end;
$fn$;

create trigger access_events_immutable
  before update or delete on audit.access_events
  for each row execute function audit.block_mutation();

alter table audit.access_events enable row level security;
revoke all on audit.access_events from public, authenticated, anon;

/* Único caminho de escrita: função controlada, que carimba o autor da sessão. */
create or replace function app.log_access_event(
  p_action text,
  p_entity text default null,
  p_entity_id text default null,
  p_company_slug text default null,
  p_capability text default null,
  p_decision text default null,
  p_reason text default null,
  p_before jsonb default null,
  p_after jsonb default null
)
returns void
language sql security definer set search_path = '' as $fn$
  insert into audit.access_events (
    tenant_id, actor_id, actor_email, action, entity, entity_id,
    company_slug, capability, decision, reason, before_state, after_state
  )
  select app.current_tenant_id(), auth.uid(),
         (select email from public.profiles where id = auth.uid()),
         p_action, p_entity, p_entity_id, p_company_slug, p_capability,
         p_decision, p_reason, p_before, p_after;
$fn$;
grant execute on function app.log_access_event(text,text,text,text,text,text,text,jsonb,jsonb) to authenticated;

/* Leitura da trilha: só quem tem auditoria.ver, e só do próprio tenant.
   View SECURITY DEFINER de propósito — o cliente nunca toca a tabela crua
   (não tem sequer USAGE no schema audit); o filtro abaixo é a permissão. */
create or replace view public.v_audit_events as
  select e.id, e.occurred_at, e.actor_email, e.action, e.entity, e.entity_id,
         e.company_slug, e.capability, e.decision, e.reason, e.before_state, e.after_state
  from audit.access_events e
  where e.tenant_id = app.current_tenant_id()
    and app.has_capability('auditoria.ver', e.company_slug);

revoke all on public.v_audit_events from public, anon;
grant select on public.v_audit_events to authenticated;

/* ═══ DEFESA DE LOGIN ═══════════════════════════════════════════════════════
   O GoTrue não conhece nossas tabelas — quem as alimenta é o hook
   app.password_verification_attempt_hook (migration 06), chamado pelo Auth a
   cada tentativa de senha. Aqui ficam o estado e a política de bloqueio.     */

create table security.login_attempts (
  id            bigint generated always as identity primary key,
  email         text not null,
  user_id       uuid,
  succeeded     boolean not null,
  ip            inet,
  attempted_at  timestamptz not null default now()
);
create index login_attempts_email_time_idx on security.login_attempts (email, attempted_at desc);
/* Retenção: 90 dias (ver security.purge_login_attempts). */

create table security.account_locks (
  email          text primary key,
  user_id        uuid,
  failed_count   int not null default 0,
  locked_until   timestamptz,
  last_failed_at timestamptz,
  updated_at     timestamptz not null default now()
);

/* Bloqueio PROGRESSIVO — atrito cresce com a insistência, sem porta permanente
   fechada (lockout eterno vira negação de serviço contra o próprio usuário).

     1–4 falhas   → sem bloqueio
     5ª           → 1 minuto
     6ª           → 5 minutos
     7ª           → 15 minutos
     8ª           → 1 hora
     9ª+          → 4 horas (teto) + evento crítico na trilha

   O contador zera no primeiro login bem-sucedido e após 24h sem tentativa. */
create or replace function security.lock_duration(p_failed int)
returns interval language sql immutable set search_path = '' as $fn$
  select case
    when p_failed < 5  then null
    when p_failed = 5  then interval '1 minute'
    when p_failed = 6  then interval '5 minutes'
    when p_failed = 7  then interval '15 minutes'
    when p_failed = 8  then interval '1 hour'
    else interval '4 hours'
  end;
$fn$;

create or replace function security.purge_login_attempts()
returns void language sql security definer set search_path = '' as $fn$
  delete from security.login_attempts where attempted_at < now() - interval '90 days';
$fn$;

alter table security.login_attempts enable row level security;
alter table security.account_locks  enable row level security;
revoke all on security.login_attempts, security.account_locks from public, authenticated, anon;

/* Visão para o admin: contas sob bloqueio agora. */
create or replace view public.v_locked_accounts as
  select l.email, l.failed_count, l.locked_until, l.last_failed_at
  from security.account_locks l
  where l.locked_until is not null and l.locked_until > now()
    and app.has_capability('usuarios.administrar');

revoke all on public.v_locked_accounts from public, anon;
grant select on public.v_locked_accounts to authenticated;


/* ###########################################################################
   20260819120600_auth_hooks.sql
   ########################################################################### */

/* =============================================================================
   06 · AUTH HOOKS — onde a política de senha e sessão vira execução
   -----------------------------------------------------------------------------
   O GoTrue chama estas funções. É por elas que o bloqueio progressivo e os
   claims de tenant/papel existem de verdade, e não só no papel.

   Ativar em Dashboard > Authentication > Hooks (ou supabase/config.toml):
     · Custom Access Token          -> app.custom_access_token_hook
     · Password Verification Attempt-> app.password_verification_attempt_hook
============================================================================= */

/* ── 1. Bloqueio progressivo ─────────────────────────────────────────────────
   event: { "user_id": uuid, "valid": bool }
   retorno: { "decision": "continue" | "reject", "message": "..." }         */
create or replace function app.password_verification_attempt_hook(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_user   uuid := (event ->> 'user_id')::uuid;
  v_valid  boolean := coalesce((event ->> 'valid')::boolean, false);
  v_email  text;
  v_lock   security.account_locks%rowtype;
  v_failed int;
  v_dur    interval;
begin
  select p.email into v_email from public.profiles p where p.id = v_user;
  if v_email is null then
    select lower(u.email) into v_email from auth.users u where u.id = v_user;
  end if;
  /* Conta sem e-mail resolvivel ainda precisa de chave estavel: o id serve. */
  v_email := coalesce(v_email, v_user::text);

  insert into security.login_attempts (email, user_id, succeeded)
  values (v_email, v_user, v_valid);

  select * into v_lock from security.account_locks where email = v_email;

  /* Já bloqueado: nem conta a tentativa como nova falha — só recusa. */
  if v_lock.locked_until is not null and v_lock.locked_until > now() then
    return jsonb_build_object(
      'decision', 'reject',
      'message', 'Conta temporariamente bloqueada por tentativas invalidas. Tente novamente mais tarde ou redefina a senha.');
  end if;

  if v_valid then
    delete from security.account_locks where email = v_email;
    return jsonb_build_object('decision', 'continue');
  end if;

  /* Falhas param de acumular depois de 24h de silêncio. */
  v_failed := case
    when v_lock.email is null then 1
    when v_lock.last_failed_at < now() - interval '24 hours' then 1
    else v_lock.failed_count + 1
  end;
  v_dur := security.lock_duration(v_failed);

  insert into security.account_locks (email, user_id, failed_count, last_failed_at, locked_until)
  values (v_email, v_user, v_failed, now(), case when v_dur is null then null else now() + v_dur end)
  on conflict (email) do update
    set failed_count   = excluded.failed_count,
        last_failed_at = excluded.last_failed_at,
        locked_until   = excluded.locked_until,
        user_id        = coalesce(excluded.user_id, account_locks.user_id),
        updated_at     = now();

  if v_failed >= 9 then
    insert into audit.access_events (tenant_id, actor_id, actor_email, action, entity, entity_id, decision, reason)
    select p.tenant_id, v_user, v_email, 'login.lockout_critico', 'profile', v_user::text, 'deny',
           v_failed || ' falhas consecutivas de senha'
    from public.profiles p where p.id = v_user;
  end if;

  if v_dur is null then
    return jsonb_build_object('decision', 'continue');
  end if;

  return jsonb_build_object(
    'decision', 'reject',
    'message', 'Credenciais invalidas. Novas tentativas estao bloqueadas por ' ||
               extract(epoch from v_dur)::int / 60 || ' minuto(s).');
end;
$fn$;

/* ── 2. Claims do access token ───────────────────────────────────────────────
   Carrega no JWT o mínimo que o backend/RLS usa como atalho: tenant, papéis e
   a exigência de MFA. NÃO carrega o catálogo de capacidades — token não é
   cache de permissão: permissão revogada tem de doer no próximo request, e o
   que decide é a tabela, não o claim.

   Conta desativada não recebe token útil: o claim 'account_status' permite ao
   backend recusar de imediato, antes mesmo da RLS.                          */
create or replace function app.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $fn$
declare
  v_user   uuid := (event ->> 'user_id')::uuid;
  v_claims jsonb := coalesce(event -> 'claims', '{}'::jsonb);
  p        public.profiles%rowtype;
  v_tenant text;
  v_roles  jsonb;
begin
  select * into p from public.profiles where id = v_user;
  if not found then
    return event;
  end if;

  select t.slug into v_tenant from public.tenants t where t.id = p.tenant_id;

  select coalesce(jsonb_agg(ra.role_key order by r.rank), '[]'::jsonb)
    into v_roles
  from public.role_assignments ra
  join public.roles r on r.key = ra.role_key
  where ra.profile_id = v_user
    and ra.revoked_at is null
    and (ra.expires_at is null or ra.expires_at > now());

  v_claims := v_claims
    || jsonb_build_object('tenant_id', p.tenant_id)
    || jsonb_build_object('tenant_slug', v_tenant)
    || jsonb_build_object('account_status', p.status)
    || jsonb_build_object('mfa_required', p.mfa_required)
    || jsonb_build_object('must_change_password', p.must_change_password)
    || jsonb_build_object('app_roles', v_roles);

  return jsonb_set(event, '{claims}', v_claims);
end;
$fn$;

/* ── permissões dos hooks ───────────────────────────────────────────────────
   Só o GoTrue executa. Nem authenticated, nem anon, nem PostgREST.          */
grant usage on schema app, security, audit to supabase_auth_admin;

grant execute on function app.password_verification_attempt_hook(jsonb) to supabase_auth_admin;
grant execute on function app.custom_access_token_hook(jsonb)           to supabase_auth_admin;
revoke execute on function app.password_verification_attempt_hook(jsonb) from authenticated, anon, public;
revoke execute on function app.custom_access_token_hook(jsonb)           from authenticated, anon, public;

grant select on public.profiles, public.tenants, public.roles, public.role_assignments to supabase_auth_admin;
grant select, insert, update, delete on security.account_locks to supabase_auth_admin;
grant select, insert on security.login_attempts to supabase_auth_admin;
grant insert on audit.access_events to supabase_auth_admin;
grant usage on all sequences in schema audit, security to supabase_auth_admin;

/* O hook precisa enxergar as linhas sem esbarrar na RLS destas tabelas. */
create policy auth_admin_reads_profiles on public.profiles
  for select to supabase_auth_admin using (true);
create policy auth_admin_reads_assignments on public.role_assignments
  for select to supabase_auth_admin using (true);


/* ###########################################################################
   20260819120700_ciclo_de_vida.sql
   ########################################################################### */

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


/* ###########################################################################
   20260819120800_rls.sql
   ########################################################################### */

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


/* ###########################################################################
   20260819120900_seed_rbac.sql
   ########################################################################### */

/* =============================================================================
   09 · SEED — catálogo de capacidades e papéis
   -----------------------------------------------------------------------------
   Esta migration é a contraparte de src/modules/permissions/policies.ts.
   Alterou ROLE_POLICIES lá? Nova migration aqui, no mesmo PR. Divergência
   entre os dois é bug de segurança, não detalhe de sincronismo.

   origin = 'doc-05'   -> paridade exata com ROLE_POLICIES
   origin = 'proposto' -> lacuna encontrada no front; ver docs/13, secao 9
============================================================================= */

insert into public.capabilities (key, module, action, name, sensitivity, requires_mfa, origin) values
  ('portfolio.ver',        'portfolio','ver',       'Ver portfolio consolidado',      'normal',  false,'doc-05'),
  ('portfolio.comparar',   'portfolio','comparar',  'Comparar investidas',            'normal',  false,'doc-05'),
  ('portfolio.exportar',   'portfolio','exportar',  'Exportar visao de portfolio',    'sensivel',false,'doc-05'),
  ('pipeline.ver',         'pipeline','ver',        'Ver pipeline de investimentos',  'sensivel',false,'doc-05'),
  ('pipeline.editar',      'pipeline','editar',     'Editar pipeline',                'sensivel',false,'doc-05'),
  ('dashboard.ver',        'dashboard','ver',       'Ver dashboards',                 'normal',  false,'doc-05'),
  ('dashboard.personalizar','dashboard','personalizar','Personalizar dashboards',     'normal',  false,'doc-05'),
  ('caixa.ver',            'caixa','ver',           'Ver fluxo de caixa',             'normal',  false,'doc-05'),
  ('caixa.editar',         'caixa','editar',        'Editar movimentos de caixa',     'sensivel',false,'doc-05'),
  ('caixa.projetar',       'caixa','projetar',      'Editar premissas de projecao',   'sensivel',false,'doc-05'),
  ('dre.ver',              'dre','ver',             'Ver DRE',                        'normal',  false,'doc-05'),
  ('dre.editar',           'dre','editar',          'Editar DRE',                     'sensivel',false,'doc-05'),
  ('dre.mapear',           'dre','mapear',          'Mapear contas do ERP',           'sensivel',false,'doc-05'),
  ('oxr.ver',              'oxr','ver',             'Ver OxR',                        'normal',  false,'doc-05'),
  ('oxr.justificar',       'oxr','justificar',      'Justificar desvio',              'normal',  false,'doc-05'),
  ('oxr.cobrar',           'oxr','cobrar',          'Cobrar justificativa',           'normal',  false,'doc-05'),
  ('oxr.editar',           'oxr','editar',          'Editar matriz OxR',              'sensivel',false,'doc-05'),
  ('forecast.ver',         'forecast','ver',        'Ver forecast',                   'normal',  false,'doc-05'),
  ('forecast.editar',      'forecast','editar',     'Editar forecast',                'sensivel',false,'doc-05'),
  ('orcamento.ver',        'orcamento','ver',       'Ver orcamento',                  'normal',  false,'doc-05'),
  ('orcamento.editar',     'orcamento','editar',    'Editar orcamento',               'sensivel',false,'doc-05'),
  ('orcamento.publicar',   'orcamento','publicar',  'Publicar orcamento',             'critica', true, 'doc-05'),
  ('compras.ver',          'compras','ver',         'Ver compras',                    'normal',  false,'doc-05'),
  ('compras.solicitar',    'compras','solicitar',   'Solicitar compra',               'normal',  false,'doc-05'),
  ('compras.aprovar',      'compras','aprovar',     'Aprovar compra',                 'sensivel',false,'doc-05'),
  ('compras.cancelar',     'compras','cancelar',    'Cancelar pedido',                'sensivel',false,'doc-05'),
  ('capex.ver',            'capex','ver',           'Ver CAPEX',                      'normal',  false,'doc-05'),
  ('capex.solicitar',      'capex','solicitar',     'Solicitar CAPEX',                'normal',  false,'doc-05'),
  ('capex.aprovar',        'capex','aprovar',       'Aprovar CAPEX',                  'sensivel',false,'doc-05');

insert into public.capabilities (key, module, action, name, sensitivity, requires_mfa, origin) values
  ('aprovacoes.ver',       'aprovacoes','ver',      'Ver fila de aprovacoes',         'normal',  false,'doc-05'),
  ('aprovacoes.decidir',   'aprovacoes','decidir',  'Decidir aprovacao',              'sensivel',false,'doc-05'),
  ('aprovacoes.delegar',   'aprovacoes','delegar',  'Delegar alcada',                 'critica', true, 'doc-05'),
  ('auditoria.ver',        'auditoria','ver',       'Ver trilha de auditoria',        'sensivel',false,'doc-05'),
  ('auditoria.exportar',   'auditoria','exportar',  'Exportar trilha',                'critica', true, 'doc-05'),
  ('documentos.ver',       'documentos','ver',      'Ver documentos',                 'normal',  false,'doc-05'),
  ('documentos.enviar',    'documentos','enviar',   'Enviar documentos',              'normal',  false,'doc-05'),
  ('documentos.excluir',   'documentos','excluir',  'Excluir documento',              'critica', true, 'doc-05'),
  ('periodo.ver',          'periodo','ver',         'Ver periodos fiscais',           'normal',  false,'doc-05'),
  ('periodo.publicar',     'periodo','publicar',    'Publicar periodo (snapshot)',    'critica', true, 'doc-05'),
  ('periodo.reabrir',      'periodo','reabrir',     'Reabrir periodo publicado',      'critica', true, 'doc-05'),
  ('config.ver',           'config','ver',          'Ver configuracoes',              'normal',  false,'doc-05'),
  ('config.editar',        'config','editar',       'Editar configuracoes',           'critica', true, 'doc-05'),
  ('integracoes.ver',      'integracoes','ver',     'Ver integracoes',                'normal',  false,'doc-05'),
  ('integracoes.configurar','integracoes','configurar','Configurar integracao',       'critica', true, 'doc-05'),
  ('integracoes.desconectar','integracoes','desconectar','Desconectar integracao',    'critica', true, 'doc-05'),
  ('relatorios.exportar',  'relatorios','exportar', 'Exportar relatorios',            'sensivel',false,'doc-05'),
  ('usuarios.ver',         'usuarios','ver',        'Ver usuarios e permissoes',      'sensivel',false,'doc-05'),
  ('usuarios.convidar',    'usuarios','convidar',   'Convidar usuario',               'critica', true, 'doc-05'),
  ('usuarios.administrar', 'usuarios','administrar','Conceder e revogar acessos',     'critica', true, 'doc-05'),
  -- lacunas do front: as telas existem, ROLE_POLICIES ainda nao as cobre
  ('de_para.ver',          'de_para','ver',         'Ver De-Para de contas',          'normal',  false,'proposto'),
  ('de_para.editar',       'de_para','editar',      'Editar De-Para de contas',       'sensivel',false,'proposto'),
  ('estrategia.ver',       'estrategia','ver',      'Ver Estrategia e Execucao',      'normal',  false,'proposto'),
  ('estrategia.editar',    'estrategia','editar',   'Editar tese, riscos e decisoes', 'sensivel',false,'proposto'),
  ('performance.ver',      'performance','ver',     'Ver Performance do Investimento','normal',  false,'proposto'),
  ('governanca.ver',       'governanca','ver',      'Ver Governanca Corporativa',     'normal',  false,'proposto'),
  ('notificacoes.ver',     'notificacoes','ver',    'Ver notificacoes',               'normal',  false,'proposto');

/* ── os 7 papéis (Role do front) ─────────────────────────────────────────── */
insert into public.roles (key, name, description, is_guest, requires_mfa, rank) values
  ('administrador','Administrador','Super Admin do tenant. Acesso total.',                       false, true,  10),
  ('holding',      'Holding',      'Socios e gestao da Ore. Visao total do portfolio.',          false, false, 20),
  ('diretoria',    'Diretoria',    'Diretoria da investida. Leitura ampla e alcadas altas.',     false, false, 30),
  ('financeiro',   'Financeiro',   'CFO/Controller. Operacao financeira completa.',              false, true,  40),
  ('operacao',     'Operacao',     'Gestores de area. Recorte operacional do proprio escopo.',   false, false, 50),
  ('compras',      'Compras',      'Suprimentos. Compras e decisoes da sua alcada.',             false, false, 60),
  ('investidores', 'Investidores', 'LPs e conselho. Leitura governada do portfolio.',            true,  false, 70);

/* ── negação para convidados (RESTRICTED_FROM_GUESTS) ────────────────────── */
insert into public.guest_denied_patterns (pattern, reason) values
  ('pipeline.*',          'Pipeline de investimentos e informacao do fundo, nao do investidor.'),
  ('relatorios.exportar', 'Extracao de base nao e concedida a convidado.'),
  ('config.*',            'Configuracao do tenant e do administrador.'),
  ('usuarios.*',          'Gestao de acessos e do administrador.');

/* ── ROLE_POLICIES, linha por linha ──────────────────────────────────────── */
insert into public.role_capability_patterns (role_key, pattern) values
  ('administrador','*'),

  ('holding','portfolio.*'),
  ('holding','dashboard.ver'), ('holding','caixa.ver'), ('holding','dre.ver'),
  ('holding','oxr.ver'), ('holding','forecast.ver'),
  ('holding','compras.ver'), ('holding','capex.ver'),
  ('holding','aprovacoes.decidir'),
  ('holding','auditoria.ver'), ('holding','documentos.ver'),
  ('holding','relatorios.exportar'),

  ('diretoria','dashboard.ver'), ('diretoria','caixa.ver'), ('diretoria','dre.ver'),
  ('diretoria','oxr.ver'), ('diretoria','oxr.cobrar'), ('diretoria','forecast.ver'),
  ('diretoria','compras.ver'), ('diretoria','capex.ver'), ('diretoria','capex.aprovar'),
  ('diretoria','aprovacoes.decidir'),
  ('diretoria','auditoria.ver'), ('diretoria','documentos.ver'),
  ('diretoria','relatorios.exportar'),

  ('financeiro','dashboard.ver'),
  ('financeiro','caixa.*'), ('financeiro','dre.*'), ('financeiro','oxr.*'),
  ('financeiro','forecast.*'), ('financeiro','orcamento.*'),
  ('financeiro','compras.ver'), ('financeiro','capex.ver'),
  ('financeiro','aprovacoes.decidir'),
  ('financeiro','periodo.publicar'), ('financeiro','auditoria.ver'), ('financeiro','documentos.*'),
  ('financeiro','config.*'), ('financeiro','integracoes.ver'),
  ('financeiro','relatorios.exportar'),

  ('operacao','dashboard.ver'),
  ('operacao','oxr.ver'), ('operacao','oxr.justificar'),
  ('operacao','compras.ver'), ('operacao','compras.solicitar'),
  ('operacao','capex.ver'), ('operacao','capex.solicitar'),

  ('compras','dashboard.ver'), ('compras','compras.*'),
  ('compras','aprovacoes.decidir'), ('compras','oxr.ver'),

  ('investidores','portfolio.ver'), ('investidores','dashboard.ver'),
  ('investidores','dre.ver'), ('investidores','caixa.ver'),
  ('investidores','documentos.ver');

/* ── capacidades 'proposto': concedidas aqui, PENDENTES no front ─────────────
   Sem estas linhas, telas que já existem (Estratégia, Performance, Governança
   Corporativa, De-Para, Notificações) ficariam sem dono no banco. Ao refletir
   em ROLE_POLICIES, mova o origin destas capacidades para 'doc-05'.        */
insert into public.role_capability_patterns (role_key, pattern) values
  ('holding','estrategia.ver'), ('holding','performance.ver'), ('holding','governanca.ver'), ('holding','notificacoes.ver'),
  ('diretoria','estrategia.ver'), ('diretoria','performance.ver'), ('diretoria','governanca.ver'), ('diretoria','notificacoes.ver'),
  ('financeiro','estrategia.ver'), ('financeiro','performance.ver'), ('financeiro','governanca.ver'),
  ('financeiro','notificacoes.ver'), ('financeiro','de_para.ver'), ('financeiro','de_para.editar'),
  ('operacao','notificacoes.ver'), ('compras','notificacoes.ver'),
  ('investidores','performance.ver'), ('investidores','notificacoes.ver');

select app.rebuild_role_capabilities();

/* ── tenant e investidas (espelham src/mocks/companies.ts) ───────────────── */
insert into public.tenants (slug, name, allowed_email_domains) values
  ('ore', 'Ore Investments', array['oreinvestments.com.br'])
on conflict (slug) do nothing;

insert into public.companies (tenant_id, slug, name, short_name)
select t.id, x.slug, x.name, x.short_name
from public.tenants t,
  (values
    ('ativa-mineracao',  'Ativa Mineracao',            'Ativa'),
    ('nazareno-gold',    'Nazareno Gold',              'Nazareno'),
    ('morro-verde',      'Morro Verde Fertilizantes',  'Morro Verde'),
    ('rio-novo',         'Rio Novo Cobre e Ouro',      'Rio Novo'),
    ('alvo-minerals',    'Alvo Minerals',              'Alvo'),
    ('neeo-exploration', 'Neeo Exploration',           'Neeo')
  ) as x(slug, name, short_name)
where t.slug = 'ore'
on conflict (tenant_id, slug) do nothing;

/* ── bootstrap do primeiro administrador ─────────────────────────────────────
   Ovo e galinha: conceder papel exige usuarios.administrar, que ninguem tem
   ainda. Esta funcao resolve UMA vez e so pelo service_role (SQL Editor /
   chave de servico) — nunca pelo cliente. Recusa se ja existir admin ativo. */
create or replace function public.bootstrap_first_admin(p_email text)
returns uuid
language plpgsql security definer set search_path = '' as $fn$
declare v_profile uuid; v_id uuid;
begin
  if exists (select 1 from public.role_assignments where role_key = 'administrador' and revoked_at is null) then
    raise exception 'Ja existe administrador. Use grant_role().' using errcode = '42501';
  end if;
  select id into v_profile from public.profiles where email = lower(p_email);
  if v_profile is null then
    raise exception 'Nenhum profile com e-mail % (crie a conta no Auth antes)', p_email using errcode = 'no_data_found';
  end if;

  insert into public.role_assignments (tenant_id, profile_id, role_key, all_companies,
                                       all_cost_centers, grant_reason, last_certified_at)
  select p.tenant_id, p.id, 'administrador', true, true, 'bootstrap inicial do tenant', now()
  from public.profiles p where p.id = v_profile
  returning id into v_id;

  update public.profiles set status = 'active' where id = v_profile;

  insert into audit.access_events (tenant_id, actor_id, actor_email, action, entity, entity_id, decision, reason)
  select tenant_id, v_profile, lower(p_email), 'bootstrap_admin', 'role_assignment', v_id::text, 'allow',
         'primeiro administrador do tenant'
  from public.profiles where id = v_profile;

  return v_id;
end;
$fn$;

revoke all on function public.bootstrap_first_admin(text) from public, anon, authenticated;
