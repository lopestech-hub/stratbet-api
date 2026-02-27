# Status do Projeto - StratBet API

## 📅 Atualização: 27/02/2026

### ✅ O que foi feito hoje

1. **Estrutura Backend**: Criada aplicação NestJS com módulos de Coletor, Jogos e Snapshots.
2. **Schema do Banco**: Definido schema Prisma com ~150 colunas cobrindo todos os dados da API FutAlerta.
3. **Banco de Dados na VPS**: Criado banco `stratbet_pi` no Coolify e estruturado via scripts SQL (`criar-tabelas.ts`).
4. **Lógica de Coleta (Upsert)**: Implementada lógica avançada que atualiza snapshots do mesmo minuto (mantendo dados sempre atuais) e detecta mudanças de turno (1T/2T).
5. **Git/GitHub**: Código sincronizado com o repositório `lopestech-hub/stratbet-api` usando autenticação via Token.
6. **Logs**: Sistema de logs detalhado com emojis e nomes de times para monitoramento fácil.

### 🧪 O que foi testado

- **Coleta Local**: O script rodou localmente e salvou dados reais no banco da VPS com sucesso.
- **Conexão API**: Endpoint da FutAlerta verificado e mapeamento de chaves (com hífens) confirmado.
- **Deploy Coolify**: Imagem Docker funcional rodando em ambiente de produção (Debian Slim).

### 🚀 Status do Deploy - ✅ CONCLUÍDO

1. **Correção Prisma**: Migração para `node:20-slim` e inclusão da pasta `.prisma` resolveu o erro de inicialização.
2. **Resiliência NPM**: Configurado `fetch-retries` para superar instabilidades de rede no build.
3. **Runtime**: Logs confirmando conexão com o banco e coleta ativa em tempo real.

### 📅 Próximos Passos

1. **Dashboard de Análise**: Planejamento do frontend para visualização dos PI em tempo real.
2. **Alertas**: Implementar sistema de notificações para jogos com alta pressão.

---
**Status Geral:** 🟢 TOTALMENTE OPERACIONAL (Backend rodando 24h na VPS)
