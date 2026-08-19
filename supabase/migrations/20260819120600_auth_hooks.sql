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
