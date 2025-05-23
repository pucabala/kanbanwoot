#!/bin/sh

# Define o caminho do arquivo .env na raiz do projeto servido
ENV_FILE="/usr/share/nginx/html/.env.js"

echo "Gerando arquivo de variáveis de ambiente: $ENV_FILE"

# Cria o arquivo .env com base nas variáveis do ambiente disponíveis no container
cat <<EOF > "$ENV_FILE"
window._env_ = {
  REACT_APP_CHATWOOT_URL: "${CHATWOOT_URL}",
  REACT_APP_CHATWOOT_TOKEN: "${CHATWOOT_TOKEN}",
  REACT_APP_CHATWOOT_ACCOUNT_ID: "${CHATWOOT_ACCOUNT_ID}",
  REACT_APP_DEBUG: "${REACT_APP_DEBUG}"
};
EOF

echo "Arquivo .env gerado com sucesso com os seguintes valores:"
cat "$ENV_FILE"

# Inicia o Nginx
exec nginx -g "daemon off;"