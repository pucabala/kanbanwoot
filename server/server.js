import express from 'express';
import apiRouter from './chatwootApi.js';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
  console.log('[DEBUG] Servidor iniciado');
});