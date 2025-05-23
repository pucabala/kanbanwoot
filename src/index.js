import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { debugLog } from './debug';

debugLog('index.js iniciado');
const root = ReactDOM.createRoot(document.getElementById('root'));
debugLog('React root criado');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
debugLog('App renderizado no root');
