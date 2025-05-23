import axios from 'axios';
import { debugLog } from './debug';

if (
  !process.env.REACT_APP_API_URL ||
  !process.env.REACT_APP_CHATWOOT_TOKEN ||
  !process.env.REACT_APP_ACCOUNT_ID
) {
  throw new Error('Variáveis de ambiente da API não configuradas corretamente.');
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'api_access_token': process.env.REACT_APP_CHATWOOT_TOKEN
  }
});

// Interceptores para log detalhado
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

export const getContacts = () =>
  apiCall(async () => {
    const response = await api.get(`/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/contacts`);
    return response.data.payload;
  });

export const updateKanbanStage = (contactId, stage) =>
  apiCall(async () => {
    const response = await api.patch(
      `/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/contacts/${contactId}`,
      {
        custom_attributes: {
          kanban: stage
        }
      }
    );
    return response.data;
  }, contactId, stage);

export const getKanbanStages = () =>
  apiCall(async () => {
    const res = await api.get(
      `/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/custom_attributes`
    );
    const kanbanField = res.data.find(attr => attr.attribute_key === 'kanban');
    return kanbanField?.attribute_values || [];
  });
