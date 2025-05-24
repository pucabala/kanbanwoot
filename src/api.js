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
export async function getContactById(contactId) {
  debugLog('api.js: getContactById chamado', contactId);
  try {
    const data = await chatwootFetch(`/contacts/${contactId}`);
    return data.payload || null;
  } catch (error) {
    debugLog('Erro ao buscar contato por ID:', error);
    throw error;
  }
}
export async function createContact(contactData) {
  debugLog('api.js: createContact chamado', contactData);
  try {
    return await chatwootFetch('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  } catch (error) {
    debugLog('Erro ao criar contato:', error);
    throw error;
  }
}
export async function updateContact(contactId, contactData) {
  debugLog('api.js: updateContact chamado', contactId, contactData);
  try {
    return await chatwootFetch(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(contactData)
    });
  } catch (error) {
    debugLog('Erro ao atualizar contato:', error);
    throw error;
  }
}
export async function deleteContact(contactId) {
  debugLog('api.js: deleteContact chamado', contactId);
  try {
    return await chatwootFetch(`/contacts/${contactId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    debugLog('Erro ao deletar contato:', error);
    throw error;
  }
}
export async function getConversations(contactId) {
  debugLog('api.js: getConversations chamado', contactId);
  try {
    const data = await chatwootFetch(`/contacts/${contactId}/conversations`);
    return data.payload || [];
  } catch (error) {
    debugLog('Erro ao buscar conversas do contato:', error);
    throw error;
  }
}
export async function getConversationById(conversationId) {
  debugLog('api.js: getConversationById chamado', conversationId);
  try {
    const data = await chatwootFetch(`/conversations/${conversationId}`);
    return data.payload || null;
  } catch (error) {
    debugLog('Erro ao buscar conversa por ID:', error);
    throw error;
  }
}
export async function createConversation(contactId, conversationData) {
  debugLog('api.js: createConversation chamado', contactId, conversationData);
  try {
    return await chatwootFetch(`/contacts/${contactId}/conversations`, {
      method: 'POST',
      body: JSON.stringify(conversationData)
    });
  } catch (error) {
    debugLog('Erro ao criar conversa:', error);
    throw error;
  }
}
export async function updateConversation(conversationId, conversationData) {
  debugLog('api.js: updateConversation chamado', conversationId, conversationData);
  try {
    return await chatwootFetch(`/conversations/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify(conversationData)
    });
  } catch (error) {
    debugLog('Erro ao atualizar conversa:', error);
    throw error;
  }
}
export async function deleteConversation(conversationId) {
  debugLog('api.js: deleteConversation chamado', conversationId);
  try {
    return await chatwootFetch(`/conversations/${conversationId}`, {
      method: 'DELETE'
    });
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
export async function createMessage(conversationId, messageData) {
  debugLog('api.js: createMessage chamado', conversationId, messageData);
  try {
    return await chatwootFetch(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  } catch (error) {
    debugLog('Erro ao criar mensagem:', error);
    throw error;
  }
}
export async function updateMessage(conversationId, messageId, messageData) {
  debugLog('api.js: updateMessage chamado', conversationId, messageId, messageData);
  try {
    return await chatwootFetch(`/conversations/${conversationId}/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify(messageData)
    });
  } catch (error) {
    debugLog('Erro ao atualizar mensagem:', error);
    throw error;
  }
}
export async function deleteMessage(conversationId, messageId) {
  debugLog('api.js: deleteMessage chamado', conversationId, messageId);
  try {
    return await chatwootFetch(`/conversations/${conversationId}/messages/${messageId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    debugLog('Erro ao deletar mensagem:', error);
    throw error;
  }
}
export async function getCustomAttributes() {
  debugLog('api.js: getCustomAttributes chamado');
  try {
    const data = await chatwootFetch('/custom_attributes');
    return data.payload || [];
  } catch (error) {
    debugLog('Erro ao buscar atributos customizados:', error);
    throw error;
  }
}
export async function createCustomAttribute(attributeData) {
  debugLog('api.js: createCustomAttribute chamado', attributeData);
  try {
    return await chatwootFetch('/custom_attributes', {
      method: 'POST',
      body: JSON.stringify(attributeData)
    });
  } catch (error) {
    debugLog('Erro ao criar atributo customizado:', error);
    throw error;
  }
}
export async function updateCustomAttribute(attributeId, attributeData) {
  debugLog('api.js: updateCustomAttribute chamado', attributeId, attributeData);
  try {
    return await chatwootFetch(`/custom_attributes/${attributeId}`, {
      method: 'PUT',
      body: JSON.stringify(attributeData)
    });
  } catch (error) {
    debugLog('Erro ao atualizar atributo customizado:', error);
    throw error;
  }
}
export async function deleteCustomAttribute(attributeId) {
  debugLog('api.js: deleteCustomAttribute chamado', attributeId);
  try {
    return await chatwootFetch(`/custom_attributes/${attributeId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    debugLog('Erro ao deletar atributo customizado:', error);
    throw error;
  }
}
export async function getCustomAttributeDefinitions() {
  debugLog('api.js: getCustomAttributeDefinitions chamado');
  try {
    const data = await chatwootFetch('/custom_attribute_definitions');
    return data.payload || [];
  } catch (error) {
    debugLog('Erro ao buscar definições de atributos customizados:', error);
    throw error;
  }
}
export async function createCustomAttributeDefinition(definitionData) {
  debugLog('api.js: createCustomAttributeDefinition chamado', definitionData);
  try {
    return await chatwootFetch('/custom_attribute_definitions', {
      method: 'POST',
      body: JSON.stringify(definitionData)
    });
  } catch (error) {
    debugLog('Erro ao criar definição de atributo customizado:', error);
    throw error;
  }
}
export async function updateCustomAttributeDefinition(definitionId, definitionData) {
  debugLog('api.js: updateCustomAttributeDefinition chamado', definitionId, definitionData);
  try {
    return await chatwootFetch(`/custom_attribute_definitions/${definitionId}`, {
      method: 'PUT',
      body: JSON.stringify(definitionData)
    });
  } catch (error) {
    debugLog('Erro ao atualizar definição de atributo customizado:', error);
    throw error;
  }
}
export async function deleteCustomAttributeDefinition(definitionId) {
  debugLog('api.js: deleteCustomAttributeDefinition chamado', definitionId);
  try {
    return await chatwootFetch(`/custom_attribute_definitions/${definitionId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    debugLog('Erro ao deletar definição de atributo customizado:', error);
    throw error;
  }
}
export async function getTags() {
  debugLog('api.js: getTags chamado');
  try {
    const data = await chatwootFetch('/tags');
    return data.payload || [];
  } catch (error) {
    debugLog('Erro ao buscar tags:', error);
    throw error;
  }
}
export async function createTag(tagData) {
  debugLog('api.js: createTag chamado', tagData);
  try {
    return await chatwootFetch('/tags', {
      method: 'POST',
      body: JSON.stringify(tagData)
    });
  } catch (error) {
    debugLog('Erro ao criar tag:', error);
    throw error;
  }
}
export async function updateTag(tagId, tagData) {
  debugLog('api.js: updateTag chamado', tagId, tagData);
  try {
    return await chatwootFetch(`/tags/${tagId}`, {
      method: 'PUT',
      body: JSON.stringify(tagData)
    });
  } catch (error) {
    debugLog('Erro ao atualizar tag:', error);
    throw error;
  }
}
export async function deleteTag(tagId) {
  debugLog('api.js: deleteTag chamado', tagId);
  try {
    return await chatwootFetch(`/tags/${tagId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    debugLog('Erro ao deletar tag:', error);
    throw error;
  }
}
export async function getUsers() {
  debugLog('api.js: getUsers chamado');
  try {
    const data = await chatwootFetch('/users');
    return data.payload || [];
  } catch (error) {
    debugLog('Erro ao buscar usuários:', error);
    throw error;
  }
}
export async function createUser(userData) {
  debugLog('api.js: createUser chamado', userData);
  try {
    return await chatwootFetch('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  } catch (error) {
    debugLog('Erro ao criar usuário:', error);
    throw error;
  }
}
export async function updateUser(userId, userData) {
  debugLog('api.js: updateUser chamado', userId, userData);
  try {
    return await chatwootFetch(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  } catch (error) {
    debugLog('Erro ao atualizar usuário:', error);
    throw error;
  }
}
export async function deleteUser(userId) {
  debugLog('api.js: deleteUser chamado', userId);
  try {
    return await chatwootFetch(`/users/${userId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    debugLog('Erro ao deletar usuário:', error);
    throw error;
  }
}