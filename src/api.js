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
    const data = await chatwootFetch('/custom_attribute_definitions');
    const kanbanAttr = (data || []).find(attr => attr.attribute_model === 'contact_attribute' && attr.attribute_key === 'kanban');
    if (!kanbanAttr) {
      throw new Error('Atributo customizado "kanban" não encontrado');
    }
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
export async function getContact(contactId) {
  debugLog('api.js: getContact chamado', contactId);
  try {
    const data = await chatwootFetch(`/contacts/${contactId}`);
    return data.payload || null;
  } catch (error) {
    debugLog('Erro ao buscar contato:', error);
    throw error;
  }
}
export async function createContact(contactData) {
  debugLog('api.js: createContact chamado', contactData);
  try {
    const data = await chatwootFetch('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
    return data.payload || null;
  } catch (error) {
    debugLog('Erro ao criar contato:', error);
    throw error;
  }
}
export async function deleteContact(contactId) {
  debugLog('api.js: deleteContact chamado', contactId);
  try {
    const response = await chatwootFetch(`/contacts/${contactId}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    debugLog('Erro ao deletar contato:', error);
    throw error;
  }
}
export async function searchContacts(query) {
  debugLog('api.js: searchContacts chamado', query);
  try {
    const data = await chatwootFetch(`/contacts/search?query=${encodeURIComponent(query)}`);
    return data.payload || [];
  } catch (error) {
    debugLog('Erro ao buscar contatos:', error);
    throw error;
  }
}
export async function getContactConversations(contactId) {
  debugLog('api.js: getContactConversations chamado', contactId);
  try {
    const data = await chatwootFetch(`/contacts/${contactId}/conversations`);
    return data.payload || [];
  } catch (error) {
    debugLog('Erro ao buscar conversas do contato:', error);
    throw error;
  }
}
export async function getConversation(conversationId) {
  debugLog('api.js: getConversation chamado', conversationId);
  try {
    const data = await chatwootFetch(`/conversations/${conversationId}`);
    return data.payload || null;
  } catch (error) {
    debugLog('Erro ao buscar conversa:', error);
    throw error;
  }
}
export async function createConversation(contactId, message) {
  debugLog('api.js: createConversation chamado', contactId, message);
  try {
    const data = await chatwootFetch('/conversations', {
      method: 'POST',
      body: JSON.stringify({
        contact_id: contactId,
        messages: [{ content: message, message_type: 'incoming' }]
      })
    });
    return data.payload || null;
  } catch (error) {
    debugLog('Erro ao criar conversa:', error);
    throw error;
  }
}
export async function updateConversation(conversationId, updates) {
  debugLog('api.js: updateConversation chamado', conversationId, updates);
  try {
    const data = await chatwootFetch(`/conversations/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return data.payload || null;
  } catch (error) {
    debugLog('Erro ao atualizar conversa:', error);
    throw error;
  }
}
export async function deleteConversation(conversationId) {
  debugLog('api.js: deleteConversation chamado', conversationId);
  try {
    const response = await chatwootFetch(`/conversations/${conversationId}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    debugLog('Erro ao deletar conversa:', error);
    throw error;
  }
}
export async function getMessages(conversationId) {
  debugLog('api.js: getMessages chamado', conversationId);
  try {
    const data = await chatwootFetch(`/conversations/${conversationId}/messages`);
    return data.payload || [];
  } catch (error) {
    debugLog('Erro ao buscar mensagens da conversa:', error);
    throw error;
  }
}
export async function sendMessage(conversationId, content) {
  debugLog('api.js: sendMessage chamado', conversationId, content);
  try {
    const data = await chatwootFetch(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, message_type: 'outgoing' })
    });
    return data.payload || null;
  } catch (error) {
    debugLog('Erro ao enviar mensagem:', error);
    throw error;
  }
}
export async function getCustomAttributes() {
  debugLog('api.js: getCustomAttributes chamado');
  try {
    const data = await chatwootFetch('/custom_attribute_definitions');
    return data.payload || [];
  } catch (error) {
    debugLog('Erro ao buscar atributos customizados:', error);
    throw error;
  }
}
export async function createCustomAttribute(attributeData) {
  debugLog('api.js: createCustomAttribute chamado', attributeData);
  try {
    const data = await chatwootFetch('/custom_attribute_definitions', {
      method: 'POST',
      body: JSON.stringify(attributeData)
    });
    return data.payload || null;
  } catch (error) {
    debugLog('Erro ao criar atributo customizado:', error);
    throw error;
  }
}
export async function updateCustomAttribute(attributeId, attributeData) {
  debugLog('api.js: updateCustomAttribute chamado', attributeId, attributeData);
  try {
    const data = await chatwootFetch(`/custom_attribute_definitions/${attributeId}`, {
      method: 'PUT',
      body: JSON.stringify(attributeData)
    });
    return data.payload || null;
  } catch (error) {
    debugLog('Erro ao atualizar atributo customizado:', error);
    throw error;
  }
}
export async function deleteCustomAttribute(attributeId) {
  debugLog('api.js: deleteCustomAttribute chamado', attributeId);
  try {
    const response = await chatwootFetch(`/custom_attribute_definitions/${attributeId}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    debugLog('Erro ao deletar atributo customizado:', error);
    throw error;
  }
}