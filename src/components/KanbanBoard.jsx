import React, { useEffect, useReducer, useState, useRef } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { updateKanbanStage, connectChatwootWebSocket, disconnectChatwootWebSocket } from '../api';
import { kanbanReducer } from '../reducers/kanbanReducer';
import Notification from './Notification';
import ErrorMessage from './ErrorMessage';
import { useKanbanDataWithReload } from '../hooks/useKanbanData';
import KanbanColumn from './KanbanColumn';

function KanbanBoard() {
  const { contacts, stages, loading, error, reload } = useKanbanDataWithReload();
  const [columns, dispatch] = useReducer(kanbanReducer, {});
  const [notification, setNotification] = useState(null);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const reloadRef = useRef(null);

  useEffect(() => {
    if (!loading && contacts.length && stages.length) {
      const organized = stages.reduce((acc, stage) => {
        acc[stage] = [];
        return acc;
      }, {});

      contacts.forEach(contact => {
        const stage = contact.custom_attributes?.kanban || stages[0];
        if (!organized[stage]) organized[stage] = [];
        organized[stage].push(contact);
      });

      dispatch({ type: 'INIT', payload: organized });
    }
  }, [contacts, stages, loading]);

  // Função para forçar reload dos dados do Kanban
  reloadRef.current = reload;

  useEffect(() => {
    // Handler para mensagens do WebSocket
    function handleWsMessage(data) {
      try {
        const json = JSON.parse(data);
        // Exemplo: só recarrega se vier evento de mensagem criada
        if (json.message && json.message.event === 'message.created') {
          if (reloadRef.current) reloadRef.current();
        }
      } catch (e) {
        // Ignora mensagens não JSON
      }
    }
    connectChatwootWebSocket(handleWsMessage, setWsStatus);
    return () => {
      disconnectChatwootWebSocket();
    };
  }, []);

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
  if (error) return <ErrorMessage message={`Erro ao carregar dados: ${error.message}`} />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {notification && <Notification type={notification.type} message={notification.message} />}
      <div className="mb-2 text-sm text-gray-500">WebSocket: {wsStatus}</div>
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
