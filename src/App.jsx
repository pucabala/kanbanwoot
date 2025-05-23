import React from 'react';
import KanbanBoard from './components/KanbanBoard';
import TesteContacts from './components/TesteContacts';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { debugLog } from './debug';

function App() {
  debugLog('App.jsx: App renderizado');
  // Captura as variáveis de ambiente
  const envVars = {
    REACT_APP_CHATWOOT_URL: process.env.REACT_APP_CHATWOOT_URL,
    REACT_APP_ACCOUNT_ID: process.env.REACT_APP_ACCOUNT_ID,
    REACT_APP_CHATWOOT_TOKEN: process.env.REACT_APP_CHATWOOT_TOKEN,
    REACT_APP_DEBUG: process.env.REACT_APP_DEBUG,
  };
  return (
    <Router>
      <div>
        <header>
          <h1 className="text-center text-2xl font-bold mt-4">Kanban - Chatwoot</h1>
        </header>
        <main>
          <pre style={{background:'#eee',padding:'1em',margin:'1em 0'}}>
          oi {JSON.stringify(envVars, null, 2)}ola
          </pre>
          <Routes>
            <Route path="/" element={<KanbanBoard />} />
            <Route path="/teste" element={<TesteContacts />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
