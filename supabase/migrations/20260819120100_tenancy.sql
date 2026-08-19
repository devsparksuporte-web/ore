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
