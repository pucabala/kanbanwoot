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

// Interceptores para log detalhado das requisições e respostas
api.interceptors.request.use(
  request => {
    debugLog('API Request:', {
      url: request.url,
      method: request.method,
      data: request.data,
      params: request.params,
      headers: request.headers
    });
    return request;
  },
  error => {
    debugLog('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    debugLog('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    debugLog('API Response Error:', error);
    return Promise.reject(error);
  }
);

// Wrapper para padronizar chamadas e tratamento de erro
async function apiCall(fn, ...args) {
  try {
    const result = await fn(...args);
    return result;
  } catch (error) {
    debugLog('API Call Error:', error?.response?.data || error.message);
    // Você pode customizar o tratamento de erro aqui
    throw error;
  }
}

/**
 * 1. Listar todos os custom attributes de contato
 *    Usado para encontrar o campo 'kanban' e pegar seu id e valores possíveis.
 */
export const getContactCustomAttributes = () =>
  apiCall(async () => {
    const response = await api.get(
      `/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/custom_attribute_definitions?attribute_model=contact_attribute`
    );
    return response.data; // Array de atributos customizados
  });

/**
 * 2. Detalhar o custom attribute 'kanban'
 *    Usado para obter os valores possíveis do campo kanban (stages).
 */
export const getKanbanAttributeDetails = (kanbanAttributeId) =>
  apiCall(async () => {
    const response = await api.get(
      `/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/custom_attribute_definitions/${kanbanAttributeId}`
    );
    return response.data; // Detalhes do atributo 'kanban'
  }, kanbanAttributeId);

/**
 * 3. Listar contatos
 *    Usado para exibir os contatos no kanban.
 */
export const getContacts = () =>
  apiCall(async () => {
    const response = await api.get(`/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/contacts`);
    return response.data.payload;
  });

/**
 * 4. Atualizar o stage do contato (campo kanban)
 *    Usado para mover o contato entre as colunas do kanban.
 */
export const updateKanbanStage = (contactId, stage) =>
  apiCall(async () => {
    const response = await api.put(
      `/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/contacts/${contactId}`,
      {
        custom_attributes: {
          kanban: stage
        }
      }
    );
    return response.data;
  }, contactId, stage);

/**
 * 5. (Opcional) Buscar apenas os valores possíveis do campo kanban
 *    Útil para montar as colunas do kanban.
 */
export const getKanbanStages = () =>
  apiCall(async () => {
    // Busca todos os custom attributes de contato e filtra pelo 'kanban'
    const res = await api.get(
      `/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/custom_attribute_definitions?attribute_model=contact_attribute`
    );
    const kanbanField = res.data.find(attr => attr.attribute_key === 'kanban');
    return kanbanField?.attribute_values || [];
  });
