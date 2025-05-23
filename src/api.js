import { debugLog } from './debug';

// Checagem das variáveis de ambiente
if (
  !process.env.REACT_APP_API_URL ||
  !process.env.REACT_APP_CHATWOOT_TOKEN ||
  !process.env.REACT_APP_ACCOUNT_ID
) {
  throw new Error('Variáveis de ambiente da API não configuradas corretamente.');
}

// Função centralizada de request usando fetch
async function request({ method, url, data, params }) {
  const baseUrl = process.env.REACT_APP_API_URL;
  let fullUrl = `${baseUrl}${url}`;

  // Adiciona query params se existirem
  if (params) {
    const query = new URLSearchParams(params).toString();
    fullUrl += `?${query}`;
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'api_access_token': process.env.REACT_APP_CHATWOOT_TOKEN
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    debugLog('API Request:', { method, fullUrl, data, params });
    console.log('Chamando URL:', fullUrl); // <-- Adicionado log da URL
    const response = await fetch(fullUrl, options);
    const responseData = await response.json();

    debugLog('API Response:', {
      url: fullUrl,
      status: response.status,
      data: responseData
    });

    if (!response.ok) {
      throw new Error(responseData?.message || 'Erro na requisição');
    }

    return responseData;
  } catch (error) {
    debugLog('API Error:', error.message);
    throw error;
  }
}

/**
 * 1. Listar todos os custom attributes de contato
 *    Usado para encontrar o campo 'kanban' e pegar seu id e valores possíveis.
 */
export const getContactCustomAttributes = () =>
  request({
    method: 'GET',
    url: `/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/custom_attribute_definitions`,
    params: { attribute_model: 'contact_attribute' }
  });

/**
 * 2. Detalhar o custom attribute 'kanban'
 *    Usado para obter os valores possíveis do campo kanban (stages).
 */
export const getKanbanAttributeDetails = (kanbanAttributeId) =>
  request({
    method: 'GET',
    url: `/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/custom_attribute_definitions/${kanbanAttributeId}`
  });

/**
 * 3. Listar contatos
 *    Usado para exibir os contatos no kanban.
 */
export const getContacts = () =>
  request({
    method: 'GET',
    url: `/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/contacts`
  }).then(data => data.payload);

/**
 * 4. Atualizar o stage do contato (campo kanban)
 *    Usado para mover o contato entre as colunas do kanban.
 */
export const updateKanbanStage = (contactId, stage) =>
  request({
    method: 'PUT',
    url: `/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/contacts/${contactId}`,
    data: {
      custom_attributes: {
        kanban: stage
      }
    }
  });

/**
 * 5. (Opcional) Buscar apenas os valores possíveis do campo kanban
 *    Útil para montar as colunas do kanban.
 */
export const getKanbanStages = async () => {
  const attributes = await getContactCustomAttributes();
  const kanbanField = attributes.find(attr => attr.attribute_key === 'kanban');
  return kanbanField?.attribute_values || [];
};
