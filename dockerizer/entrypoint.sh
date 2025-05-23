#!/bin/sh

# Define o caminho do arquivo env.js no diretório onde o React é servido
ENV_FILE="/usr/share/nginx/html/env.js"

echo "Gerando arquivo de variáveis de ambiente: $ENV_FILE"

# Cria o arquivo JS com base nas variáveis do ambiente disponíveis no container
cat <<EOF > "$ENV_FILE"
window._env_ = {
  REACT_APP_API_URL: "${REACT_APP_API_URL}",
  REACT_APP_CHATWOOT_TOKEN: "${REACT_APP_CHATWOOT_TOKEN}",
  REACT_APP_ACCOUNT_ID: "${REACT_APP_ACCOUNT_ID}"
};
EOF

echo "Arquivo env.js gerado com sucesso com os seguintes valores:"
cat "$ENV_FILE"

# Inicia o Nginx
exec nginx -g "daemon off;"
