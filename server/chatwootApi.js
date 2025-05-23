import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

const CHATWOOT_URL = process.env.CHATWOOT_URL;
const ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;
const TOKEN = process.env.CHATWOOT_TOKEN;

const chatwootHeaders = {
  'Content-Type': 'application/json',
  'api_access_token': TOKEN
};

router.get('/custom-attributes', async (req, res) => {
  try {
    const url = `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/contact_custom_attributes`;
    const response = await fetch(url, { headers: chatwootHeaders });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ 
      message: 'Erro ao buscar custom attributes.',
      error: err.message 
    });
  }
});

router.get('/custom-attributes/:id', async (req, res) => {
  try {
    const url = `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/contact_custom_attributes/${req.params.id}`;
    const response = await fetch(url, { headers: chatwootHeaders });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ 
      message: 'Erro ao buscar atributo.',
      error: err.message 
    });
  }
});

router.get('/contacts', async (req, res) => {
  try {
    const url = `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts`;
    const response = await fetch(url, { headers: chatwootHeaders });
    const data = await response.json();
    // Supondo que os contatos estejam em data.payload
    res.json(data.payload || []);
  } catch (err) {
    res.status(500).json({ 
      message: 'Erro ao buscar contatos.',
      error: err.message 
    });
  }
});

router.put('/contacts/:id', async (req, res) => {
  try {
    const url = `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts/${req.params.id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: chatwootHeaders,
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ 
      message: 'Erro ao atualizar contato.',
      error: err.message 
    });
  }
});

export default router;
