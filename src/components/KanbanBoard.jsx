import React, { useEffect, useReducer, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { updateKanbanStage } from '../api';
import { kanbanReducer } from '../reducers/kanbanReducer';
import Notification from './Notification';
import ErrorMessage from './ErrorMessage';  // Importa o novo componente
import { useDynamicKanbanData } from '../hooks/useKanbanData';
import KanbanColumn from './KanbanColumn';

function KanbanBoard() {
  const { contacts, columns, attribute, loading, error, updateContactStage } = useDynamicKanbanData();
  const [board, dispatch] = useReducer(kanbanReducer, {});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!loading && contacts.length && columns.length) {
      const organized = columns.reduce((acc, col) => {
        acc[col] = [];
        return acc;
      }, {});
      contacts.forEach(contact => {
        const value = contact.custom_attributes?.[attribute.attribute_key] || columns[0];
        if (!organized[value]) organized[value] = [];
        organized[value].push(contact);
      });
      dispatch({ type: 'INIT', payload: organized });
    }
  }, [contacts, columns, attribute, loading]);

  const onDragEnd = async ({ source, destination }) => {
    if (!destination) return;
    const sourceList = Array.from(board[source.droppableId]);
    const [moved] = sourceList.splice(source.index, 1);
    const destList = Array.from(board[destination.droppableId] || []);
    destList.splice(destination.index, 0, moved);
    const prevBoard = JSON.parse(JSON.stringify(board));
    dispatch({
      type: 'MOVE_CARD',
      payload: {
        source: source.droppableId,
        destination: destination.droppableId,
        contact: moved
      }
    });
    try {
      await updateContactStage(moved.id, destination.droppableId);
    } catch (err) {
      setNotification({ type: 'error', message: 'Erro ao atualizar estágio.' });
      dispatch({ type: 'INIT', payload: prevBoard });
    }
  };

  if (loading) return <div className="p-4">Carregando Kanban...</div>;
  if (error) return <ErrorMessage message={`Erro ao carregar dados: ${error.message}`} />;
  if (!attribute) return <ErrorMessage message="Nenhum atributo customizado do tipo lista encontrado." />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {notification && <Notification type={notification.type} message={notification.message} />}
      <h1 className="text-xl font-bold mb-4">{attribute.attribute_display_name || attribute.attribute_key}</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto">
          {columns.map(col => (
            <KanbanColumn
              key={col}
              stage={col}
              contacts={board[col] || []}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default KanbanBoard;
