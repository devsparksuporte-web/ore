/* =============================================================================
   CONFERÊNCIA PÓS-APLICAÇÃO
   -----------------------------------------------------------------------------
   Cole no SQL Editor depois de rodar supabase/aplicar-manual.sql.
   Sete perguntas. Cada uma tem uma resposta certa, indicada abaixo dela.
   Só de leitura — não altera nada.
============================================================================= */

-- 1) Alguma tabela de public ficou sem RLS?   ESPERADO: zero linhas
select tablename as tabela_sem_rls
from pg_tables
where schemaname = 'public' and not rowsecurity;

-- 2) Alguma tabela com RLS ligada mas SEM policy? (fechada para todos —
--    pode ser intencional, mas você deve saber quais são)
--    ESPERADO: nenhuma inesperada
select t.tablename, count(p.policyname) as policies
from pg_tables t
left join pg_policies p on p.schemaname = t.schemaname and p.tablename = t.tablename
where t.schemaname = 'public'
group by t.tablename
having count(p.policyname) = 0
order by 1;

-- 3) Quantas capacidades cada papel recebeu depois da expansão dos wildcards?
--    ESPERADO: administrador com o total (56); investidores com 5.
select r.key as papel, r.requires_mfa as exige_mfa, count(rc.capability_key) as capacidades
from public.roles r
left join public.role_capabilities rc on rc.role_key = r.key
group by 1, 2
order by 3 desc;

-- 4) O convidado recebeu alguma capacidade da lista de negação?
--    ESPERADO: zero. Se aparecer qualquer linha, a expansão está furada.
select rc.capability_key as vazou_para_convidado
from public.role_capabilities rc
join public.roles r on r.key = rc.role_key
join public.guest_denied_patterns g on app.match_capability(g.pattern, rc.capability_key)
where r.is_guest;

-- 5) Todo pattern declarado casou com pelo menos uma capacidade real?
--    ESPERADO: zero linhas. Pattern órfão = permissão que ninguém tem,
--    normalmente erro de digitação no nome do módulo.
select p.role_key, p.pattern as pattern_sem_capacidade
from public.role_capability_patterns p
where not exists (
  select 1 from public.capabilities c where app.match_capability(p.pattern, c.key)
)
order by 1, 2;

-- 6) Capacidades que existem no catálogo mas nenhum papel tem.
--    ESPERADO: só as que você decidiu deixar sem dono (revise a lista).
select c.key as capacidade_sem_dono, c.origin
from public.capabilities c
where not exists (select 1 from public.role_capabilities rc where rc.capability_key = c.key)
order by 1;

-- 7) Os hooks estão registrados e as funções existem?
--    ESPERADO: as duas linhas presentes. (Ligar o hook em si é no Dashboard —
--    esta consulta só confirma que a função está lá para ser apontada.)
select p.proname as funcao, n.nspname as schema
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'app'
  and p.proname in ('custom_access_token_hook', 'password_verification_attempt_hook');

-- 8) Administradores ativos. ESPERADO: pelo menos 2 depois do go-live —
--    um só é ponto único de falha (deactivate_user recusa remover o último).
select p.full_name, p.email, p.status, p.mfa_enrolled_at is not null as mfa_cadastrado
from public.role_assignments ra
join public.profiles p on p.id = ra.profile_id
where ra.role_key = 'administrador' and ra.revoked_at is null;
