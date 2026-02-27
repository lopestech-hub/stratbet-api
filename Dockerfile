# =============================================================
# ESTÁGIO 1: Build do Backend
# =============================================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend
RUN apk add --no-cache openssl libc6-compat

# Copia apenas os arquivos de dependência primeiro (cache layer)
COPY backend/package*.json ./

# Forçamos NODE_ENV=development para instalar devDependencies (como @nestjs/cli)
RUN NODE_ENV=development npm ci

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

WORKDIR /app/backend
RUN apk add --no-cache openssl libc6-compat

# Copia os arquivos necessários do builder
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/src/prisma/schema.prisma ./src/prisma/schema.prisma

# Debug: Lista os arquivos para garantir a estrutura correta (visto nos logs de build)
RUN ls -R dist/

# Instala apenas as dependências de produção
RUN npm ci --omit=dev

# Copia o Prisma Client gerado (incluindo a pasta .prisma que contém a engine e schemas gerados)
COPY --from=backend-builder /app/backend/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=backend-builder /app/backend/node_modules/.prisma ./node_modules/.prisma

# Porta exposta
EXPOSE 3000

# Inicia o servidor usando o script start:prod (que aponta para node dist/main)
CMD ["npm", "run", "start:prod"]
