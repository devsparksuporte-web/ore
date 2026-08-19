/* Stubs do que o Supabase provê (GoTrue + PostgREST), para validar as
   migrations num Postgres limpo — sem projeto, sem CLI, sem nuvem.
   NÃO faz parte do schema: nunca rode isto num projeto Supabase real. */
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon')                then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated')       then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role')        then create role service_role nologin bypassrls; end if;
  if not exists (select 1 from pg_roles where rolname='supabase_auth_admin') then create role supabase_auth_admin nologin; end if;
end $$;

create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text, encrypted_password text, email_confirmed_at timestamptz,
  phone text, raw_user_meta_data jsonb default '{}'::jsonb
);
create table if not exists auth.sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid
);

create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
create or replace function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
$$;

grant usage on schema auth, public to authenticated, anon, service_role, supabase_auth_admin;
