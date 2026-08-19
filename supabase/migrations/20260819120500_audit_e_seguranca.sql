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
