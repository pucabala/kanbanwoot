import React from 'react';
import KanbanBoard from './components/KanbanBoard';
import TesteContacts from './components/TesteContacts';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { debugLog } from './debug';

function App() {
  debugLog('App.jsx: App renderizado');
  return (
    <Router>
      <div>
        <header>
          <h1 className="text-center text-2xl font-bold mt-4">Kanban - Chatwoot</h1>
        </header>
        <main>
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
