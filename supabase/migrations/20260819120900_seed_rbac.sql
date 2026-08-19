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
