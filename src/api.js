import axios from 'axios';

if (!process.env.REACT_APP_API_URL || !process.env.REACT_APP_CHATWOOT_TOKEN || !process.env.REACT_APP_ACCOUNT_ID) {
  throw new Error('Variáveis de ambiente da API não configuradas corretamente.');
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'api_access_token': process.env.REACT_APP_CHATWOOT_TOKEN
  }
});

export const getContacts = async () => {
  const response = await api.get(`/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/contacts`);
  return response.data.payload;
};

export const updateKanbanStage = async (contactId, stage) => {
  return api.patch(`/api/v1/accounts/${process.env.REACT_APP_ACCOUNT_ID}/contacts/${contactId}`, {
    custom_attributes: {
      kanban: stage
    }
  });
};
