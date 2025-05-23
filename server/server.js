import express from 'express';
import apiRouter from './chatwootApi.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());

// Serve arquivos estáticos do React build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../build')));

// Rotas da API
app.use('/api', apiRouter);

// Fallback para SPA React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
  console.log('[DEBUG] Servidor iniciado');
});