import React, { useEffect, useReducer, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { updateKanbanStage } from '../api';
import { kanbanReducer } from '../reducers/kanbanReducer';
import Notification from './Notification';
import ErrorMessage from './ErrorMessage';  // Importa o novo componente
import { useKanbanData } from '../hooks/useKanbanData';
import KanbanColumn from './KanbanColumn';

function KanbanBoard() {
  const { contacts, stages, loading, error } = useKanbanData();
  const [columns, dispatch] = useReducer(kanbanReducer, {});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!loading && contacts.length && stages.length) {
      // Filtra contatos que tenham algum atributo cujo id comece com "kbw_" e valor diferente de null
      const filteredContacts = contacts.filter(contact => {
        if (!contact.custom_attributes) return false;
        return Object.entries(contact.custom_attributes).some(
          ([key, value]) => key.startsWith('kbw_') && value !== null
        );
      });
      const organized = stages.reduce((acc, stage) => {
        acc[stage] = [];
        return acc;
      }, {});

      filteredContacts.forEach(contact => {
        const stage = contact.custom_attributes?.kanban || stages[0];
        if (!organized[stage]) organized[stage] = [];
        organized[stage].push(contact);
      });

      dispatch({ type: 'INIT', payload: organized });
    }
  }, [contacts, stages, loading]);

  const onDragEnd = async ({ source, destination }) => {
    if (!destination) return;

    const sourceList = Array.from(columns[source.droppableId]);
    const [moved] = sourceList.splice(source.index, 1);
    const destList = Array.from(columns[destination.droppableId] || []);
    destList.splice(destination.index, 0, moved);

    const prevColumns = JSON.parse(JSON.stringify(columns));

    dispatch({
      type: 'MOVE_CARD',
      payload: {
        source: source.droppableId,
        destination: destination.droppableId,
        contact: moved
      }
    });

    try {
      await updateKanbanStage(moved.id, destination.droppableId);
    } catch (err) {
      setNotification({ type: 'error', message: 'Erro ao atualizar estágio no Chatwoot.' });
      dispatch({ type: 'INIT', payload: prevColumns });
    }
  };

  if (loading) return <div className="p-4">Carregando Kanban...</div>;
  if (error) return <ErrorMessage message={`Erro ao carregar dados: ${error.message}`} />;  // Usando ErrorMessage

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {notification && <Notification type={notification.type} message={notification.message} />}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto">
          {stages.map(stage => (
            <KanbanColumn
              key={stage}
              stage={stage}
              contacts={columns[stage] || []}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default KanbanBoard;
