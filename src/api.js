import axios from 'axios';

export async function getContacts() {
  const res = await axios.get('/api/contacts');
  return res.data;
}

export async function getKanbanStages() {
  const res = await axios.get('/api/custom-attributes');
  // Supondo que o campo 'kanban' seja uma lista de valores
  const kanbanAttr = res.data.find(attr => attr.attribute_key === 'kanban');
  return kanbanAttr ? kanbanAttr.attribute_display_values : [];
}

export async function updateKanbanStage(contactId, newStage) {
  return axios.put(`/api/contacts/${contactId}`, {
    custom_attributes: { kanban: newStage }
  });
}