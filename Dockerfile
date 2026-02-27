# =============================================================
# ESTÁGIO 1: Build do Backend
# =============================================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copia apenas os arquivos de dependência primeiro (cache layer)
COPY backend/package*.json ./
RUN npm ci

# Copia o restante do backend e builda
COPY backend/ .

# Gera o Prisma Client
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Compila o TypeScript
RUN npm run build

# =============================================================
# ESTÁGIO 2: Imagem Final de Produção
# =============================================================
FROM node:20-alpine

# Timezone America/Sao_Paulo obrigatório
ENV TZ=America/Sao_Paulo
ENV PGTZ=America/Sao_Paulo
ENV NODE_ENV=production

WORKDIR /app

# Copia o build do backend
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package.json ./
COPY --from=backend-builder /app/backend/src/prisma/schema.prisma ./prisma/schema.prisma

# Porta exposta
EXPOSE 3000

# Inicia o servidor
CMD ["node", "dist/main.js"]
