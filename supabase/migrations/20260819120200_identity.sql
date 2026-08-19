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
