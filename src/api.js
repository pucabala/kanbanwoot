import { debugLog } from './debug';

/**
 * Valida e retorna as variáveis de ambiente necessárias.
 * @returns {{ API_URL: string, TOKEN: string, ACCOUNT_ID: string }}
 */
function getEnv() {
  const { REACT_APP_API_URL, REACT_APP_CHATWOOT_TOKEN, REACT_APP_ACCOUNT_ID } = process.env;
  if (!REACT_APP_API_URL || !REACT_APP_CHATWOOT_TOKEN || !REACT_APP_ACCOUNT_ID) {
    throw new Error('Variáveis de ambiente da API não configuradas corretamente.');
  }
  return {
    API_URL: REACT_APP_API_URL,
    TOKEN: REACT_APP_CHATWOOT_TOKEN,
    ACCOUNT_ID: REACT_APP_ACCOUNT_ID
  };
}

const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
};

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
};

/**
 * Função centralizada de request usando fetch, com timeout e cancelamento.
 * @param {Object} options
 * @param {string} options.method
 * @param {string} options.url
 * @param {Object} [options.data]
 * @param {Object} [options.params]
 * @param {number} [options.timeout] - Timeout em ms (opcional)
 * @returns {Promise<any>}
 */
async function request({ method, url, data, params, timeout = 15000 }) {
  const { API_URL, TOKEN } = getEnv();
  let fullUrl = `${API_URL}${url}`;

  // Adiciona query params se existirem
  if (params) {
    const query = new URLSearchParams(params).toString();
    fullUrl += `?${query}`;
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const headers = {
    ...DEFAULT_HEADERS,
    'api_access_token': TOKEN
  };

  const fetchOptions = {
    method,
    headers,
    signal: controller.signal
  };

  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }

  try {
    debugLog('API Request:', JSON.stringify({ method, fullUrl, data, params }, null, 2));
    const response = await fetch(fullUrl, fetchOptions);
    clearTimeout(id);

    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    debugLog('API Response:', {
      url: fullUrl,
      status: response.status,
      data: responseData
    });

    if (!response.ok) {
      throw new Error(responseData?.message || `Erro na requisição: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    if (error.name === 'AbortError') {
      debugLog('API Error:', 'Request timeout');
      throw new Error('Tempo de requisição excedido.');
    }
    debugLog('API Error:', error.message);
    throw error;
  }
}

/**
 * Listar todos os custom attributes de contato.
 * @returns {Promise<Array>}
 */
export const getContactCustomAttributes = () => {
  const { ACCOUNT_ID } = getEnv();
  return request({
    method: HTTP_METHODS.GET,
    url: `/api/v1/accounts/${ACCOUNT_ID}/custom_attribute_definitions`,
    params: { attribute_model: 'contact_attribute' }
  });
};

/**
 * Detalhar o custom attribute 'kanban'.
 * @param {string} kanbanAttributeId
 * @returns {Promise<Object>}
 */
export const getKanbanAttributeDetails = (kanbanAttributeId) => {
  const { ACCOUNT_ID } = getEnv();
  return request({
    method: HTTP_METHODS.GET,
    url: `/api/v1/accounts/${ACCOUNT_ID}/custom_attribute_definitions/${kanbanAttributeId}`
  });
};

/**
 * Listar contatos.
 * @returns {Promise<Array>}
 */
export const getContacts = () => {
  const { ACCOUNT_ID } = getEnv();
  return request({
    method: HTTP_METHODS.GET,
    url: `/api/v1/accounts/${ACCOUNT_ID}/contacts`
  }).then(data => data.payload);
};

/**
 * Atualizar o stage do contato (campo kanban).
 * @param {string} contactId
 * @param {string} stage
 * @returns {Promise<Object>}
 */
export const updateKanbanStage = (contactId, stage) => {
  const { ACCOUNT_ID } = getEnv();
  return request({
    method: HTTP_METHODS.PUT,
    url: `/api/v1/accounts/${ACCOUNT_ID}/contacts/${contactId}`,
    data: {
      custom_attributes: {
        kanban: stage
      }
    }
  });
};

/**
 * Buscar apenas os valores possíveis do campo kanban.
 * @returns {Promise<Array>}
 */
export const getKanbanStages = async () => {
  const attributes = await getContactCustomAttributes();
  const kanbanField = attributes.find(attr => attr.attribute_key === 'kanban');
  return kanbanField?.attribute_values || [];
};
