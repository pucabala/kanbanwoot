import { debugLog } from './debug';

// Configurações da API do Chatwoot vindas do .env (injetadas no build)
const CHATWOOT_URL = process.env.REACT_APP_CHATWOOT_URL || process.env.CHATWOOT_URL;
const ACCOUNT_ID = process.env.REACT_APP_ACCOUNT_ID || process.env.CHATWOOT_ACCOUNT_ID;
const TOKEN = process.env.REACT_APP_CHATWOOT_TOKEN || process.env.CHATWOOT_TOKEN;


const chatwootHeaders = {
  'Content-Type': 'application/json',
  'api_access_token': TOKEN
};

async function chatwootFetch(endpoint, options = {}) {
  const url = `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}${endpoint}`;
  debugLog('chatwootFetch', url, options);
  const response = await fetch(url, { ...options, headers: chatwootHeaders });
  if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
  return response.json();
}

export async function getContacts() {
  debugLog('api.js: getContacts chamado');
  const data = await chatwootFetch('/contacts');
  return data.payload || [];
}

export async function getKanbanStages() {
  debugLog('api.js: getKanbanStages chamado');
  const data = await chatwootFetch('/contact_custom_attributes');
  const kanbanAttr = data.find(attr => attr.attribute_key === 'kanban');
  return kanbanAttr ? kanbanAttr.attribute_display_values : [];
}

export async function updateKanbanStage(contactId, newStage) {
  debugLog('api.js: updateKanbanStage chamado', contactId, newStage);
  return chatwootFetch(`/contacts/${contactId}`, {
    method: 'PUT',
    body: JSON.stringify({ custom_attributes: { kanban: newStage } })
  });
}