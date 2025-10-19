# Stage 1: build TypeScript
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
COPY src ./src
COPY prisma ./prisma
RUN npm run build

# Stage 2: production image
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y openssl bash && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependências de produção + ferramentas necessárias
RUN npm ci --omit=dev && \
    npm install -g wait-on && \
    npm install tsconfig-paths ts-node

# Copiar arquivos compilados e prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Copiar script de inicialização
COPY scripts/docker-init.sh ./scripts/
RUN chmod +x ./scripts/docker-init.sh

ENV PORT=3001
EXPOSE 3001

CMD ["./scripts/docker-init.sh"]
