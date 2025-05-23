import axios from 'axios';
import { debugLog } from './debug';

// Checagem das variáveis de ambiente
if (
  !process.env.REACT_APP_API_URL ||
  !process.env.REACT_APP_CHATWOOT_TOKEN ||
  !process.env.REACT_APP_ACCOUNT_ID
) {
  throw new Error('Variáveis de ambiente da API não configuradas corretamente.');
}

// Instância do axios configurada para a API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'api_access_token': process.env.REACT_APP_CHATWOOT_TOKEN
  }
});

// Função centralizada de request
async function request({ method, url, data, params }) {
  try {
    debugLog('API Request:', { method, url, data, params });
    const response = await api.request({ method, url, data, params });
    debugLog('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response.data;
  } catch (error) {
    debugLog('API Error:', error?.response?.data || error.message);
    throw error;
  }
}

/**
 * 1. Listar todos os custom attributes de contato
 *    Usado para encontrar o campo 'kanban' e pegar seu id e valores possíveis.
 */
export const getContactCustomAttributes = () =>
  request({
    method: 'get',
    url: `/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/custom_attribute_definitions`,
    params: { attribute_model: 'contact_attribute' }
  });

/**
 * 2. Detalhar o custom attribute 'kanban'
 *    Usado para obter os valores possíveis do campo kanban (stages).
 */
export const getKanbanAttributeDetails = (kanbanAttributeId) =>
  request({
    method: 'get',
    url: `/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/custom_attribute_definitions/${kanbanAttributeId}`
  });

/**
 * 3. Listar contatos
 *    Usado para exibir os contatos no kanban.
 */
export const getContacts = () =>
  request({
    method: 'get',
    url: `/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/contacts`
  }).then(data => data.payload);

/**
 * 4. Atualizar o stage do contato (campo kanban)
 *    Usado para mover o contato entre as colunas do kanban.
 */
export const updateKanbanStage = (contactId, stage) =>
  request({
    method: 'put',
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
