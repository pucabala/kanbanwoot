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
  // Corrigido para /accounts/ (no plural)
  const url = `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}${endpoint}`;
  debugLog('chatwootFetch', url, options);
  try {
    const response = await fetch(url, { ...options, headers: chatwootHeaders });
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
    if (!response.ok) {
      const errorDetails = {
        message: `Erro na API: ${url} ${response.status}`,
        status: response.status,
        url,
        method: options.method || 'GET',
        requestBody: options.body,
        headers: chatwootHeaders,
        response: responseData,
        stack: (new Error()).stack
      };
      debugLog('Detalhes do erro Chatwoot:', errorDetails);
      const error = new Error(errorDetails.message);
      Object.assign(error, errorDetails);
      throw error;
    }
    return responseData;
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
    // Buscar todos os custom_attribute_definitions
    const data = await chatwootFetch('/custom_attribute_definitions');
    // Filtrar pelo attribute_model = "contact_attribute" e attribute_key = "kanban"
    const kanbanAttr = (data || []).find(attr => attr.attribute_model === 'contact_attribute' && attr.attribute_key === 'kanban');
    if (!kanbanAttr) {
      throw new Error('Atributo customizado "kanban" não encontrado');
    }
    // Retornar os valores possíveis do atributo (attribute_values)
    return kanbanAttr.attribute_values || [];
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

// WebSocket para mensagens em tempo real
let chatwootSocket = null;
let chatwootSocketStatus = 'disconnected';

export function connectChatwootWebSocket(onMessage, onStatusChange) {
  if (chatwootSocket) {
    chatwootSocket.close();
  }
  // Exemplo de endpoint WebSocket do Chatwoot (ajuste conforme necessário)
  const wsUrl = CHATWOOT_URL.replace(/^http/, 'ws') + `/cable`;
  chatwootSocket = new WebSocket(wsUrl);

  chatwootSocket.onopen = () => {
    chatwootSocketStatus = 'connected';
    if (onStatusChange) onStatusChange('connected');
    debugLog('WebSocket conectado:', wsUrl);
    // Exemplo de subscribe para mensagens de conta (ajuste conforme necessário)
    if (ACCOUNT_ID) {
      const subscribeMsg = {
        command: 'subscribe',
        identifier: JSON.stringify({ channel: 'RoomChannel', account_id: ACCOUNT_ID })
      };
      chatwootSocket.send(JSON.stringify(subscribeMsg));
      debugLog('WebSocket subscribe enviado:', subscribeMsg);
    }
  };
  chatwootSocket.onclose = () => {
    chatwootSocketStatus = 'disconnected';
    if (onStatusChange) onStatusChange('disconnected');
    debugLog('WebSocket desconectado');
  };
  chatwootSocket.onerror = (err) => {
    debugLog('WebSocket erro:', err);
    if (onStatusChange) onStatusChange('error');
  };
  chatwootSocket.onmessage = (event) => {
    debugLog('WebSocket mensagem recebida:', event.data);
    if (onMessage) onMessage(event.data);
  };
}

export function disconnectChatwootWebSocket() {
  if (chatwootSocket) {
    chatwootSocket.close();
    chatwootSocket = null;
    chatwootSocketStatus = 'disconnected';
  }
}