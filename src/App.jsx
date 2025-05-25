//App.jsx
import React from 'react';
import KanbanBoard from './components/KanbanBoard';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { debugLog } from './debug';

function App() {
  return (
    <Router>
      <div>
        <header>
          <h1 className="text-center text-2xl font-bold mt-4">Kanban - Chatwoot</h1>
        </header>
        <main> 
          <Routes>
            <Route path="/" element={<KanbanBoard />} />
            
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
