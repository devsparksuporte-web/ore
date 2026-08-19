# 13 · Regras de banco — identidade, senha, permissão e acesso

> Contraparte de `src/modules/permissions`. O front decide **o que mostrar**;
> este documento e as migrations decidem **o que existe**. Quando os dois
> discordarem, quem vale é o banco.

Implementado em `supabase/migrations/` (00→09) + `supabase/config.toml`.

---

## 1. Princípio

**A UI esconde, o banco nega.** O comentário já está em
`src/modules/permissions/types.ts`; aqui ele vira execução. Toda tabela tem RLS
ligada e nasce fechada: sem policy, sem linha. Um token válido de um usuário
desligado não lê nada, ainda que o front esteja desatualizado, um endpoint
esqueça a checagem ou alguém consulte a API direto com a chave `anon`.

Consequência prática: **nenhuma tela pode ser a única guardiã de um dado.**

---

## 2. Modelo de dados

```
auth.users  (GoTrue — senha, MFA, sessões)
   │ 1:1
public.profiles ─────────► public.tenants ──► public.companies ──► public.cost_centers
   │                                                   ▲                  ▲
   │ 1:N                                               │                  │
public.role_assignments ──┬── role_assignment_companies ┘                  │
   │                      └── role_assignment_cost_centers ────────────────┘
   │ N:1
public.roles ── role_capability_patterns ──(expansão)──► role_capabilities ──► capabilities
                        ▲
              guest_denied_patterns

security.login_attempts / account_locks     audit.access_events (append-only)
```

| Schema     | Papel                                        | Exposto ao cliente |
|------------|----------------------------------------------|--------------------|
| `public`   | dados de negócio                             | sim, sob RLS       |
| `app`      | motor de autorização e hooks                 | não (só funções)   |
| `security` | tentativas de login e bloqueios              | não                |
| `audit`    | trilha imutável                              | não (via view)     |

---

## 3. Senha — o que guardamos é **nada**

O hash vive em `auth.users.encrypted_password`, sob o GoTrue. Nenhuma
migration, função ou policy deste projeto lê essa coluna. `public.profiles`
guarda apenas *metadados de governança*: quando a senha mudou e se a troca é
obrigatória no próximo login.

| Regra                        | Valor                                   | Onde |
|------------------------------|-----------------------------------------|------|
| Tamanho mínimo               | 12 caracteres                           | `config.toml · minimum_password_length` |
| Composição                   | minúscula + maiúscula + dígito + símbolo| `config.toml · password_requirements` |
| Senha vazada (HIBP)          | bloqueada                               | Dashboard › Password protection |
| Algoritmo                    | **bcrypt** (GoTrue)                     | — |
| Expiração periódica          | **não existe** (deliberado)             | — |
| Troca de senha               | exige reautenticação recente            | `secure_password_change = true` |
| Troca de e-mail              | confirma nos dois endereços             | `double_confirm_changes = true` |

**Sobre o Argon2id.** O nível corporativo pede Argon2id; o Supabase gerenciado
hasheia com **bcrypt** e não expõe essa escolha. É a única regra desta
especificação que a plataforma não entrega. As alternativas honestas são: (a)
aceitar bcrypt — o que, com 12 caracteres, quatro classes e HIBP ligado, é
defensável; (b) self-hostar o GoTrue para configurar o hasher. Não há terceira
opção "quase igual". Registrado aqui para ser uma decisão, não um esquecimento.

**Sobre expirar senha.** Rotação forçada a cada 90 dias produz `Senha@2026`,
`Senha@2027`. Trocamos isso por: senha longa + verificação de vazamento + MFA
nos papéis fortes + bloqueio progressivo. Alinhado ao NIST SP 800-63B.

**Reuso de senha anterior** não é verificável no banco: o hash é salgado e o
texto em claro nunca chega ao Postgres. Só um *password hook* do GoTrue, que
recebe a tentativa, poderia fazê-lo. Fica como possibilidade, não como regra
implementada — melhor uma regra a menos que uma regra falsa.

---

## 4. Sessão e MFA

| Regra                    | Valor      | Por quê |
|--------------------------|------------|---------|
| Access token             | 30 min     | Revogação de permissão dói em ≤30 min |
| Refresh rotativo         | sim        | Cada uso troca o token |
| Janela de reuso          | 10 s       | Corrida de rede legítima; fora dela = roubo → família revogada |
| Teto absoluto da sessão  | 12 h       | Estação destravada não vira sessão eterna |
| Inatividade              | 30 min     | idem |
| Segundo fator            | TOTP       | `auth.mfa.totp` |

**MFA obrigatório** para `administrador` e `financeiro` (`roles.requires_mfa`) e
para toda capacidade marcada `critica` — publicar período, configurar
integração, excluir documento, conceder acesso, delegar alçada.

A exigência não é um aviso na tela: `app.has_capability()` **retorna falso** se
a sessão for `aal1` (só senha). `public.authorize()` devolve
`{"allowed": false, "code": "mfa_required"}` para a UI oferecer o segundo
fator em vez de mostrar "sem permissão" — negar sem explicar é o que faz o
usuário abrir chamado.

`profiles.mfa_required` é **derivado**, não digitado: conceder papel forte liga
a exigência (trigger `role_assignments_sync_mfa`). Não há como esquecer.

> **Ordem no primeiro acesso:** cadastrar o TOTP *antes* de conceder o papel de
> administrador. Um admin sem MFA fica em impasse — precisa de AAL2 para agir e
> ninguém pode agir por ele. Por isso existe `public.bootstrap_first_admin()`,
> executável só pelo `service_role`.

---

## 5. Bloqueio progressivo de login

Alimentado pelo hook `app.password_verification_attempt_hook`, que o GoTrue
chama a cada tentativa de senha.

| Falhas consecutivas | Bloqueio |
|---------------------|----------|
| 1–4                 | nenhum   |
| 5ª                  | 1 minuto |
| 6ª                  | 5 minutos|
| 7ª                  | 15 minutos|
| 8ª                  | 1 hora   |
| 9ª ou mais          | 4 horas (teto) + evento crítico na trilha |

O contador zera no primeiro acerto e após 24 h de silêncio. **Não existe
bloqueio permanente**: seria negação de serviço contra o próprio usuário —
qualquer um que saiba o e-mail derrubaria a conta do CFO na véspera do
fechamento. Contas bloqueadas agora: `public.v_locked_accounts`.

---

## 6. Permissão — papel × capacidade × empresa × escopo

Porte 1:1 de `engine.ts`. A ordem de avaliação é a mesma:

```
papel vigente → capacidade concedida → empresa no escopo → centro de custo → MFA
```

**Capacidade** é `modulo.acao` (`dre.ver`, `periodo.publicar`). Os papéis são
declarados com *wildcard*, exatamente como em `ROLE_POLICIES`
(`caixa.*`, `*`), em `role_capability_patterns` — é o que um humano lê e edita.
Um gatilho expande para `role_capabilities`, que é o que a RLS consulta: casar
wildcard linha a linha custaria caro em tabela grande.

**Escopo de empresa**: `companies: "*"` do front vira `all_companies = true`;
lista explícita vira linhas em `role_assignment_companies`. Constraint triggers
recusam escopo vazio, escopo ambíguo (`"*"` + lista) e empresa de outro tenant.

**Convidado** (`investidores`): a lista de negação
(`guest_denied_patterns` ← `RESTRICTED_FROM_GUESTS`) é aplicada **na expansão**.
A capacidade não é filtrada em tempo de consulta — ela simplesmente não existe
para o papel. Wildcard futuro em `ROLE_POLICIES` não consegue reabrir a porta.

### Matriz vigente

| Papel | Escopo típico | MFA | Resumo |
|---|---|---|---|
| `administrador` | tenant | **sim** | tudo (`*`) |
| `holding` | todas as investidas | não | portfólio completo, leitura ampla, decide alçada do fundo, exporta |
| `diretoria` | sua investida | não | leitura ampla, aprova CAPEX, cobra justificativa, exporta |
| `financeiro` | sua investida | **sim** | operação financeira completa, publica período, configura, De-Para |
| `operacao` | sua investida + CC | não | seu recorte: vê OxR e justifica, solicita compra/CAPEX |
| `compras` | sua investida | não | compras ponta a ponta, decide na sua alçada |
| `investidores` | leitura do portfólio | não | DRE, caixa, documentos. Sem pipeline, sem export, sem config |

Sensibilidade da capacidade: `normal` · `sensivel` (dado financeiro/pessoal) ·
`critica` (muda o estado do sistema ou de quem acessa → exige AAL2).

---

## 7. Ciclo de vida da conta

Nenhuma dessas operações é um `INSERT` solto do cliente. **Não existe policy de
escrita em `role_assignments`** — de propósito. O caminho é a função, que
verifica a capacidade, valida a regra e escreve na trilha. Um UPDATE direto
pularia os três.

| Operação | Função | Regras embutidas |
|---|---|---|
| Convidar | `INSERT em invites` (policy) | domínio de e-mail autorizado; convidar `administrador` exige ser `administrador`; 7 dias; 5 reenvios |
| Conceder papel | `grant_role()` | exige `usuarios.administrar` + AAL2; **proíbe auto-concessão**; só admin cria admin; escopo validado |
| Revogar | `revoke_role()` | **motivo obrigatório**; nunca DELETE — revogação é datada e assinada |
| Desligar | `deactivate_user()` | motivo obrigatório; revoga todos os papéis; **apaga as sessões** (`auth.sessions`); recusa desligar o último admin ativo e recusa auto-desligamento |
| Recertificar | `certify_assignment()` | carimba a revisão periódica |
| Anonimizar (LGPD) | `anonymize_user()` | só após 5 anos desativado (retenção contábil) |

**Por que não apagar o usuário.** Aprovações, publicações de período e
justificativas de desvio apontam para pessoas. Apagar a pessoa transforma a
trilha em "alguém aprovou R$ 2,4 mi" — que é o mesmo que não ter trilha. Conta
desativada perde o acesso no mesmo instante; o nome permanece atribuível.

**Acesso temporário** (auditor externo, consultor): `expires_at` na atribuição.
Expira sozinho, sem depender de alguém lembrar.

**Recertificação**: `v_access_recertification_due` lista atribuições vigentes
não revisadas há mais de 180 dias. Acesso que ninguém revisa vira acesso
esquecido — o vetor mais comum de vazamento interno não é invasão, é o estagiário
de 2023 que ainda enxerga o caixa.

---

## 8. Auditoria

`audit.access_events` é **append-only literal**: um gatilho levanta exceção em
`UPDATE` e `DELETE`. Corrigir a trilha se faz com um novo evento.

Registram-se: login com bloqueio crítico, concessão e revogação de papel,
desligamento, anonimização, recertificação, e qualquer negativa relevante —
com autor, e-mail, empresa, capacidade, motivo e os estados antes/depois.

Leitura por `public.v_audit_events`, que exige `auditoria.ver` **na empresa do
evento**. O cliente nunca toca a tabela crua — não tem nem `USAGE` no schema.

Retenção: `security.login_attempts` 90 dias (`security.purge_login_attempts()`);
`audit.access_events` **não expira**.

---

## 9. Divergências encontradas no front

Auditoria de `ROLE_POLICIES` contra as telas existentes. Cada item está
seedado no banco com `capabilities.origin = 'proposto'` — as telas funcionam,
mas o front ainda não declara quem pode vê-las:

| Tela | Capacidade proposta | Situação |
|---|---|---|
| `e/[empresa]/estrategia` | `estrategia.ver` / `.editar` | ausente de `ROLE_POLICIES` |
| `e/[empresa]/performance` | `performance.ver` | ausente |
| `e/[empresa]/governanca-corporativa` | `governanca.ver` | ausente |
| `e/[empresa]/config/de-para` | `de_para.ver` / `.editar` | coberta só indiretamente por `config.*` |
| `notificacoes` | `notificacoes.ver` | ausente |
| `admin/usuarios` | `usuarios.ver`, `usuarios.convidar` | o front só tem `usuarios.administrar` |

Também: `src/lib/session.ts` declara um tipo `Capability` **fechado**, com 13
entradas, que não coincide com `ROLE_POLICIES`. São duas listas de permissão
convivendo. Ao plugar o backend, `mockSession` deve morrer e `GET /me` (aqui:
`public.me()`) passa a ser a única fonte.

Os papéis do formulário de convite em `admin/usuarios/page.tsx` ("Analista do
fundo", "Aprovador", "Operador de integração") **não existem** em `Role`. O
`select` precisa ser alimentado por `public.roles`, não por `<option>` fixo.

---

## 10. Superfície exposta ao cliente

Só isto é chamável por um usuário autenticado:

| Função | Uso |
|---|---|
| `public.me()` | contrato do `GET /me` — substitui `mockSession` |
| `public.authorize(cap, empresa?, cc?)` | decisão **explicada** — alimenta o widget mascarado |
| `public.companies_in_scope(cap)` | empresas visíveis — alimenta o `ContextSwitcher` |
| `public.grant_role` / `revoke_role` / `deactivate_user` / `certify_assignment` | administração |
| `public.touch_last_access()` | coluna "Último acesso" |
| Views | `v_audit_events`, `v_user_directory`, `v_locked_accounts`, `v_access_recertification_due` |

`anon` não lê nada: a tela de login não consulta o banco.
`app.*` não é chamável pelo cliente — é o que as policies usam por dentro.

---

## 11. Como aplicar

```bash
npm i -g supabase          # se ainda não tiver
supabase link --project-ref <ref>
supabase db push           # aplica 00 → 09
```

Depois, **na ordem**:

1. Dashboard › Authentication › Hooks: ligar *Custom Access Token* e
   *Password Verification Attempt* (o `config.toml` já os declara para o
   ambiente local).
2. Dashboard › Authentication › Password protection: ligar **HIBP**.
3. Criar a conta do primeiro administrador (Auth › Users › Invite).
4. Essa pessoa entra, **cadastra o TOTP** e só então:

```sql
-- SQL Editor (roda como service_role)
select public.bootstrap_first_admin('marcio@oreinvestments.com.br');
```

5. Conferir: `select * from public.v_access_recertification_due;`

### Validar antes de aplicar

```bash
bash supabase/tests/validar.sh     # requer Docker
```

Sobe um Postgres descartável com stubs do GoTrue (`supabase/tests/stub-supabase.sql`),
aplica as 10 migrations em ordem e confere três coisas: nenhuma tabela de
`public` sem RLS, quantas capacidades cada papel recebeu após a expansão dos
wildcards, e que o convidado não recebeu nenhuma capacidade da lista de negação.
Não toca em nenhum projeto Supabase.

### Checklist de go-live

- [ ] `enable_signup = false` confirmado em produção
- [ ] HIBP ligado
- [ ] Hooks ligados e testados (errar uma senha 5× deve bloquear por 1 min)
- [ ] Ao menos **dois** administradores com MFA (o `deactivate_user` protege o
      último, mas um só administrador é um ponto único de falha)
- [ ] `select count(*) from pg_tables t
        where schemaname='public' and not rowsecurity;` → **0**
- [ ] `supabase db lint` e o Security Advisor sem alertas

---

## 12. O que fica para depois

Itens do nível "auditoria externa" que **não** estão implementados — a decisão
foi nível corporativo:

- **Aprovação de dois olhos** para mudança de permissão (hoje um administrador
  concede sozinho; a trilha registra, mas não exige segundo aprovador).
- **Segregação de funções (SoD)**: nada impede acumular `financeiro` e
  `compras` — quem solicita e quem paga podem ser a mesma pessoa.
- **Criptografia em nível de coluna** (`pgsodium`/Vault) para dados sensíveis.
- **Reuso de senha anterior** (ver §3).

As três primeiras cabem em migrations aditivas, sem redesenho: `role_assignments`
já tem `granted_by`, `certified_by` e `expires_at`, que são a matéria-prima
delas.

---

## 13. Regra de manutenção

> Alterou `ROLE_POLICIES` em `src/modules/permissions/policies.ts`?
> **Nova migration no mesmo PR.** Divergência entre os dois não é dívida de
> sincronismo: é bug de segurança. O front esconde de menos ou de mais — e só
> se descobre qual quando alguém vê o que não devia.
