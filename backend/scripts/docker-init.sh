#!/bin/sh
set -e

echo "🚀 Iniciando aplicação..."

# Aguardar banco estar pronto
echo "⏳ Aguardando banco de dados..."
npx wait-on tcp:db:3306 -t 60000

# Gerar Prisma Client
echo "📦 Gerando Prisma Client..."
npx prisma generate

# Rodar migrations
echo "🔄 Aplicando migrations..."
npx prisma migrate deploy

# Rodar seed (apenas se banco estiver vazio)
echo "🌱 Verificando se precisa rodar seed..."
npx prisma db seed || echo "⚠️  Seed já foi executado ou falhou"

# Iniciar aplicação
echo "✅ Iniciando servidor..."
node dist/server.js
