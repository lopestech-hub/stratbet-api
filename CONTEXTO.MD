# StratBet API — Coletor de Dados de Futebol ao Vivo
>
> Memória viva. Atualizado automaticamente após qualquer mudança e antes de encerrar cada sessão.

---

## 🎯 Objetivo

Sistema de coleta automatizada de dados de futebol ao vivo via API externa.

- Consulta a API a cada **30 segundos**
- Detecta automaticamente mudanças de minuto e transições de período (1T → 2T)
- Armazena dados estáticos (pré-jogo) em `jogos` e dados dinâmicos (ao vivo) em `snapshots`
- Lógica de deduplicação: ignora snapshots com mesmo minuto e período

---

## 👥 Usuários e Perfis

- Uso interno/técnico — sem autenticação implementada na fase 1
- Consumidores futuros: Dashboard de análise para apostadores/analistas

---

## ⚙️ Regras de Negócio Críticas

### Detecção de Período

| Condição | Ação |
|---|---|
| `tempo_atual > ultimo_tempo` | Minuto novo → **SALVAR** (mesmo período) |
| `tempo_atual < ultimo_tempo` | Regressão → **SALVAR** (novo período = periodo+1) |
| `tempo_atual == ultimo_tempo` | Duplicado → **IGNORAR** |

### Estado em Memória

- Dicionário `estadoJogos: Map<jogo_id, { ultimo_tempo, ultimo_periodo }>`
- Se servidor reiniciar → recupera o último snapshot do banco (evita duplicatas)
- Se jogo sumir da resposta da API → remove do estado (jogo encerrado)

### Inserção de Jogos

- Cada jogo é inserido **UMA ÚNICA VEZ** na tabela `jogos` (dados estáticos/pré-live)
- Snapshots são inseridos a cada minuto diferente detectado
- Índice `(jogo_id, periodo, tempo)` garante performance nas queries de estado

---

## 📦 Stack

- **Backend:** Node.js 20 + NestJS + Fastify + Prisma + PostgreSQL
- **Scheduler:** `@nestjs/schedule` com `@Cron('*/30 * * * * *')` (30 segundos)
- **HTTP Client:** `axios` para chamadas à API externa
- **Logs:** `nestjs-pino` + `pino-pretty` (dev) | Nível produção: `info`
- **MCP:** `db-strat-bet` (configurado no Coolify para consultas ao banco)
- **Infra:** VPS + Coolify | Deploy: GitHub push → auto deploy
- **Timezone:** `America/Sao_Paulo` (UTC-3) — obrigatório em tudo
- **Frontend:** A definir (fase futura — Dashboard de análise)

### Banco de Dados na VPS

- **Projeto Coolify:** `stratbet-pi` (UUID: `dg8okk0g4og8gw488occgckw`)
- **Banco:** `stratbet-pi-db` (UUID: `k0ocooc4c8w8wg808c8gc40w`)
- **Host:** `161.97.181.33:5431`
- **Database:** `stratbet_pi`
- **User:** `stratbet`
- **Status:** ✅ Running

---

## 🗄️ Banco de Dados

### Tabelas

| Tabela | Descrição | Registros |
|---|---|---|
| `jogos` | Dados estáticos e pré-live do confronto | 1 por jogo |
| `snapshots` | Dados ao vivo capturados por minuto | N por jogo |

### Índices de Performance

```sql
-- snapshots
INDEX ON (jogo_id)
INDEX ON (jogo_id, periodo, tempo)  -- Chave para buscar último estado
INDEX ON (capturado_em)
```

### Schema Prisma

📄 Localizado em: `backend/src/prisma/schema.prisma`

**Tabela `jogos`** — ~70 campos incluindo:

- Identificação: `id, liga, time_casa, time_visitante`
- Links: `link_betfair, link_superbet, link_bet365`
- Estatísticas pré: H2H, PPJ, vitórias, derrotas, médias de gols, xG, xGA, clean sheet, BTTS, overs
- Odds pré: casa, visitante, empate, BTTS, over 0.5/1.5/2.5/3.5, over 0.5 HT

**Tabela `snapshots`** — ~80 campos incluindo:

- Placar ao vivo, xG ao vivo, PI1/PI2/PI3, APPM, APPM10
- Chutes (total, ao gol, fora), CG, CG10
- Cantos (HT e totais), ataques, ataques perigosos, posse
- Cartões (amarelos e vermelhos), último gol, tempo desde último gol
- Odds ao vivo: casa, visitante, empate, BTTS, overs
- Primeiro gol (% histórico), CG gol marcados

### Scripts de Migração

- `backend/scripts/` — Scripts de DDL/DML via Prisma Client (nunca `prisma migrate` em produção)

---

## 🔌 Rotas da API

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/api/coletor/status` | Estado atual dos jogos em memória | Não |
| GET | `/api/jogos` | Lista todos os jogos registrados | Não |
| GET | `/api/jogos/:id` | Busca jogo + todos os snapshots | Não |
| GET | `/api/snapshots/jogo/:jogoId` | Histórico de snapshots de um jogo | Não |
| GET | `/api/snapshots/jogo/:jogoId/ultimo` | Último snapshot de um jogo | Não |

---

## 📁 Estrutura de Pastas Atual

```
stratbet-api/
├── backend/
│   ├── src/
│   │   ├── prisma/
│   │   │   ├── schema.prisma        ← Schema completo com jogos + snapshots
│   │   │   ├── prisma.service.ts    ← Singleton PrismaClient com log de queries lentas
│   │   │   └── prisma.module.ts     ← Módulo global
│   │   ├── modules/
│   │   │   ├── coletor/
│   │   │   │   ├── coletor.service.ts    ← Lógica central (Cron 30s + controle de estado)
│   │   │   │   ├── coletor.controller.ts ← GET /coletor/status
│   │   │   │   ├── coletor.module.ts
│   │   │   │   └── coletor.types.ts      ← Tipos EstadoJogo, MapaEstadoJogos
│   │   │   ├── jogos/
│   │   │   │   ├── jogos.service.ts      ← garantirJogoExiste(), listar, buscar
│   │   │   │   ├── jogos.controller.ts
│   │   │   │   └── jogos.module.ts
│   │   │   └── snapshots/
│   │   │       ├── snapshots.service.ts  ← salvarSnapshot(), listar, buscarUltimo
│   │   │       ├── snapshots.controller.ts
│   │   │       └── snapshots.module.ts
│   │   ├── app.module.ts            ← Módulo raiz com Config, Schedule, Pino
│   │   └── main.ts                  ← Bootstrap Fastify + Pino
│   ├── scripts/                     ← Scripts de migração de banco
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
├── frontend/                        ← A definir (fase futura)
├── Dockerfile                       ← Multi-stage build
├── .env.example                     ← Template de variáveis de ambiente
├── .gitignore
└── CONTEXTO.MD                      ← Este arquivo
```

---

## 🔧 Variáveis de Ambiente

```env
DATABASE_URL="postgresql://user:password@host:5432/stratbet?schema=public"
TZ=America/Sao_Paulo
PGTZ=America/Sao_Paulo
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
API_FUTEBOL_URL=https://sua-api-futebol.com/jogos-ao-vivo
API_FUTEBOL_TOKEN=
INTERVALO_COLETA_MS=30000
```

---

## 📋 Integrações Externas

| Integração | Tipo | Status |
|---|---|---|
| **FutAlerta API** | GET polling 30s | ✅ URL confirmada e funcionando |
| Betfair | Link externo (ID numérico no campo) | Campo no banco |
| Superbet | Link externo (URL completa) | Campo no banco |
| Bet365 | Link externo (URL completa) | Campo no banco |

**FutAlerta API:**

- URL: `https://futalerta.com.br/api/in-live?api_token=TOKEN`
- Retorna: array JSON flat com todos os jogos ao vivo
- Token: configurado via `API_FUTEBOL_URL` no `.env`

**Mapeamentos de chaves (API → Banco):**

| Chave na API | Campo no banco |
|---|---|
| `time-casa` | `time_casa` |
| `link-betfair` | `link_betfair` (string) |
| `placar_ht-casa` | `placar_ht_casa` |
| `tempo` | `snapshots.tempo` |
| `total_de_chutes-casa` | `total_chutes_casa` |
| `chutes_fora_do_gol-casa` | `chutes_fora_casa` |
| `posse_de_bola-casa` | `posse_casa` |
| `tempo_desde_o_ultimo_gol-casa` | `tempo_desde_ultimo_gol_casa` |
| `odds_over_2_5_live` | `odds_over_25_live` (⚠️ underscore na fonte) |
| `1_gol-casa` | `primeiro_gol_casa` |
| `odds_over_0_5_ht-live` | `odds_over_05_ht_live` |

---

## 🚀 Roadmap

- [x] **Fase 1 — Setup e Estrutura**
  - [x] Schema Prisma completo (jogos + snapshots)
  - [x] NestJS com Fastify + Pino
  - [x] Módulo Coletor com Cron de 30s
  - [x] Lógica de detecção de período em memória
  - [x] Recuperação de estado do banco após restart
  - [x] Dockerfile multi-stage
- [ ] **Fase 2 — Configuração e Testes**
  - [ ] Configurar `.env` com URL da API real
  - [ ] Instalar dependências (`npm install`)
  - [ ] Configurar banco PostgreSQL na VPS
  - [ ] Criar tabelas (`npx prisma generate` + script de migração)
  - [ ] Testar coleta com jogos reais
- [ ] **Fase 3 — Monitoramento**
  - [ ] Dashboard de visualização dos snapshots
  - [ ] Alertas de falha na coleta
- [ ] **Fase 4 — Análise**
  - [ ] Módulo de análise ao vivo (AI/regras)
  - [ ] Exportação de dados para análise externa

---

## 📝 Decisões Técnicas

| Decisão | Motivo |
|---|---|
| NestJS sobre Fastify (puro) | Volume de dados alto, vários módulos com responsabilidades distintas |
| Estado em memória (`Map`) | Performance máxima — evita query ao banco a cada 30 segundos |
| Recuperação do banco no startup | Resiliência após restart — evita duplicatas e erros de período |
| Todos os campos `nullable` em snapshots | API pode não retornar todos os campos sempre |
| `Decimal` para odds e percentuais | Evita erros de ponto flutuante em cálculos |
| Índice em `(jogo_id, periodo, tempo)` | Query mais comum: buscar último estado do jogo |

---

## ⚠️ Problemas Conhecidos

- URL da API de futebol ao vivo ainda não fornecida pelo usuário
- O mapeamento dos campos da API (`dadosApi.xxx`) depende do formato real da resposta — **confirmar com o usuário**
- Período 3 (prorrogação) não está explicitamente tratado, mas a lógica de detecção de regressão funciona genericamente

---

## 📅 Última Sessão — 2026-02-27

**O que foi feito:**

- Planejamento completo do projeto seguindo o fluxo Arquiteto de Projetos
- Schema Prisma criado com 2 tabelas e ~150 campos combinados
- Estrutura NestJS completa: módulos Coletor, Jogos, Snapshots
- Lógica central de detecção de período e controle de estado implementada
- Dockerfile multi-stage criado
- URL e formato real da API FutAlerta confirmados e mapeados
- Todos os campos corrigidos com as chaves reais da API (hífens, nomes composto)
- Campo `odds_over_05_ht_live` adicionado ao schema de snapshots

**O que foi testado:** API FutAlerta consultada e respondendo corretamente

**Próximos passos:**

1. Configurar `.env` com `DATABASE_URL` apontando para o banco na VPS
2. `cd backend && npm install`
3. Criar script de migração em `backend/scripts/criar-tabelas.ts`
4. `npm run start:dev` para testar a coleta ao vivo

---

## ➡️ Próximos Passos

1. **Configurar `.env`** com as credenciais do banco e URL da API
2. **Instalar dependências:** `cd backend && npm install`
3. **Gerar Prisma Client:** `npx prisma generate --schema=src/prisma/schema.prisma`
4. **Criar as tabelas no banco** via script em `backend/scripts/`
5. **Informar o formato JSON que a API retorna** (para ajustar o mapeamento de campos)
6. **Rodar em dev:** `npm run start:dev`

---

## 📅 Histórico de Mudanças

| Data | Versão | Mudança |
|---|---|---|
| 2026-02-27 | 1.0.0 | Estrutura inicial criada — Schema, NestJS, Coletor, Dockerfile |
