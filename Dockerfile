# =============================================================
# ESTÁGIO 1: Build do Backend
# =============================================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

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

WORKDIR /app

# Copia o build do backend
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package.json ./
COPY --from=backend-builder /app/backend/src/prisma/schema.prisma ./prisma/schema.prisma

# Instala apenas as dependências de produção para a imagem final
RUN npm ci --omit=dev

# Copia o Prisma Client gerado (está dentro de node_modules do builder)
COPY --from=backend-builder /app/backend/node_modules/@prisma/client ./node_modules/@prisma/client

# Porta exposta
EXPOSE 3000

# Inicia o servidor
CMD ["node", "dist/main.js"]
