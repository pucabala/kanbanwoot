import React from 'react';
import { debugLog } from './debug';
import KanbanBoard from './components/KanbanBoard';

function App() {
  debugLog('App.jsx montado');
  return (
    <div>
      <header>
        <h1 className="text-center text-2xl font-bold mt-4">Kanban - Chatwoot</h1>
      </header>
      <main>
        <KanbanBoard />
      </main>
    </div>
  );
}

export default App;
