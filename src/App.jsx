import React from 'react';
import KanbanBoard from './components/KanbanBoard';

function App() {
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
