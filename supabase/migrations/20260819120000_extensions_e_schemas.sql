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
