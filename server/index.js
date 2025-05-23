import express from 'express';
import apiRouter from './chatwootApi.js';

const app = express();

// ...existing middleware and routes...

app.use('/api', apiRouter);

// ...existing error handling and server start...

export default app;