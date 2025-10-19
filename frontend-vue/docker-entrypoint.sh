#!/bin/sh
set -e

# Configurar a URL da API baseado na variável de ambiente
API_URL="${VITE_API_URL:-http://localhost:3001/api}"

echo "Configurando API URL: $API_URL"

# Criar arquivo de configuração JavaScript
cat > /usr/share/nginx/html/config.js << EOF
window.ENV = {
  VITE_API_URL: '$API_URL'
};
EOF

echo "Configuração criada com sucesso!"

# Executar o comando passado (nginx)
exec "$@"
