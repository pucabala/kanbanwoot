// Este arquivo substitui o uso do .env para variáveis de ambiente no frontend
window._env_ = {
  REACT_APP_CHATWOOT_TOKEN: 'xvKatAgC67jwYwj2gbqW5LJm',
  REACT_APP_CHATWOOT_ACCOUNT_ID: '2',
  REACT_APP_CHATWOOT_URL: 'https://whats.agente.live',
  REACT_APP_DEBUG: 'true',
};
// O arquivo .env.js é injetado no build do React, então não é necessário usar dotenv ou outro pacote para carregar variáveis de ambiente.
// As variáveis de ambiente são acessadas através de window._env_ no código do React.
// Isso permite que você tenha um arquivo de configuração separado para o frontend, sem expor as variáveis de ambiente no código-fonte.
// Você pode usar o arquivo .env.js para definir variáveis de ambiente específicas para o frontend, como a URL da API do Chatwoot, o ID da conta e o token de acesso.
// Isso é útil para evitar expor informações sensíveis no código-fonte e para facilitar a configuração do ambiente de desenvolvimento e produção.