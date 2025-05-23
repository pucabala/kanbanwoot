import React from 'react';
import KanbanBoard from './components/KanbanBoard';
import { debugLog } from './debug';

function App() {
  debugLog('App.jsx: App renderizado');
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
