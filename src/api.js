import axios from 'axios';
import { debugLog } from './debug';

export async function getContacts() {
  debugLog('api.js: getContacts chamado');
  const res = await axios.get('/api/contacts');
  return res.data;
}

export async function getKanbanStages() {
  debugLog('api.js: getKanbanStages chamado');
  const res = await axios.get('/api/custom-attributes');
  // Supondo que o campo 'kanban' seja uma lista de valores
  const kanbanAttr = res.data.find(attr => attr.attribute_key === 'kanban');
  return kanbanAttr ? kanbanAttr.attribute_display_values : [];
}

export async function updateKanbanStage(contactId, newStage) {
  debugLog('api.js: updateKanbanStage chamado', contactId, newStage);
  return axios.put(`/api/contacts/${contactId}`, {
    custom_attributes: { kanban: newStage }
  });
}