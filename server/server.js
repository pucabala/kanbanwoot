import express from 'express';
import apiRouter from './chatwootApi.js';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});