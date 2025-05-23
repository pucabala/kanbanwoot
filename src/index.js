import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { debugLog } from './debug';



const root = ReactDOM.createRoot(document.getElementById('root'));
debugLog('index.js: ReactDOM root criado');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
debugLog('index.js: App renderizado');
