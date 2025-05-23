//api.js
import { debugLog } from './debug';

// Configurações da API do Chatwoot vindas do window._env_ (injetadas pelo .env.js)
const CHATWOOT_URL = (window._env_ && window._env_.REACT_APP_CHATWOOT_URL) || '';
const ACCOUNT_ID = (window._env_ && window._env_.REACT_APP_CHATWOOT_ACCOUNT_ID) || '';
const TOKEN = (window._env_ && window._env_.REACT_APP_CHATWOOT_TOKEN) || '';

const chatwootHeaders = {
  'Content-Type': 'application/json',
  'api_access_token': TOKEN
};

async function chatwootFetch(endpoint, options = {}) {
  const url = `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}${endpoint}`;
  debugLog('chatwootFetch', url, options);
  try {
    const response = await fetch(url, { ...options, headers: chatwootHeaders });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    debugLog('Erro na requisição Chatwoot:', error);
    throw error;
  }
}

debugLog('api.js: módulo carregado');

export async function getContacts() {
  debugLog('api.js: getContacts chamado');
  try {
    const data = await chatwootFetch('/contacts');
    return data.payload || [];
  } catch (error) {
    debugLog('Erro ao buscar contatos:', error);
    throw error;
  }
}

export async function getKanbanStages() {
  debugLog('api.js: getKanbanStages chamado');
  try {
    const data = await chatwootFetch('/contact_custom_attributes');
    const kanbanAttr = data.find(attr => attr.attribute_key === 'kanban');
    return kanbanAttr ? kanbanAttr.attribute_display_values : [];
  } catch (error) {
    debugLog('Erro ao buscar estágios do Kanban:', error);
    throw error;
  }
}

export async function updateKanbanStage(contactId, newStage) {
  debugLog('api.js: updateKanbanStage chamado', contactId, newStage);
  try {
    return await chatwootFetch(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify({ custom_attributes: { kanban: newStage } })
    });
  } catch (error) {
    debugLog('Erro ao atualizar estágio do Kanban:', error);
    throw error;
  }
}