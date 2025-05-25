// KanbanBoard.jsx
// Componente principal do Kanban dinâmico
import React, { useEffect, useReducer, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { kanbanReducer } from '../reducers/kanbanReducer';
import Notification from './Notification';
import ErrorMessage from './ErrorMessage';
import { useDynamicKanbanData } from '../hooks/useKanbanData';
import KanbanColumn from './KanbanColumn';

function KanbanBoard() {
  // Hook customizado para buscar contatos, colunas e atributo selecionado
  const { contacts, columns, attribute, loading, error, updateContactStage } = useDynamicKanbanData();
  // Estado local para o board (colunas e cards)
  const [board, dispatch] = useReducer(kanbanReducer, {});
  // Estado para notificações de erro/sucesso
  const [notification, setNotification] = useState(null);

  // Organiza os contatos nas colunas sempre que dados mudam
  useEffect(() => {
    if (!loading && contacts.length && columns.length) {
      // Cria objeto com as colunas vazias
      const organized = columns.reduce((acc, col) => {
        acc[col] = [];
        return acc;
      }, {});
      // Distribui contatos nas colunas conforme valor do atributo customizado
      contacts.forEach(contact => {
        const value = contact.custom_attributes?.[attribute.attribute_key] || columns[0];
        if (!organized[value]) organized[value] = [];
        organized[value].push(contact);
      });
      // Atualiza o estado do board
      dispatch({ type: 'INIT', payload: organized });
    }
  }, [contacts, columns, attribute, loading]);

  /**
   * Handler do drag-and-drop: move o card e atualiza o valor do atributo no backend
   */
  const onDragEnd = async ({ source, destination }) => {
    if (!destination) return;
    // Remove o card da coluna de origem
    const sourceList = Array.from(board[source.droppableId]);
    const [moved] = sourceList.splice(source.index, 1);
    // Adiciona o card na coluna de destino
    const destList = Array.from(board[destination.droppableId] || []);
    destList.splice(destination.index, 0, moved);
    // Salva o estado anterior para rollback em caso de erro
    const prevBoard = JSON.parse(JSON.stringify(board));
    // Atualiza o estado local
    dispatch({
      type: 'MOVE_CARD',
      payload: {
        source: source.droppableId,
        destination: destination.droppableId,
        contact: moved
      }
    });
    try {
      // Atualiza o valor do atributo customizado do contato
      await updateContactStage(moved.id, destination.droppableId);
    } catch (err) {
      // Em caso de erro, exibe notificação e faz rollback
      setNotification({ type: 'error', message: 'Erro ao atualizar estágio.' });
      dispatch({ type: 'INIT', payload: prevBoard });
    }
  };

  // Exibe loading, erro ou o board
  if (loading) return <div className="p-4">Carregando Kanban...</div>;
  if (error) return <ErrorMessage message={`Erro ao carregar dados: ${error.message}`} />;
  if (!attribute) return <ErrorMessage message="Nenhum atributo customizado do tipo lista encontrado." />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Notificação de erro/sucesso */}
      {notification && <Notification type={notification.type} message={notification.message} />}
      {/* Título do Kanban: nome amigável do atributo */}
      <h1 className="text-xl font-bold mb-4">{attribute.attribute_display_name || attribute.attribute_key}</h1>
      {/* Área de drag-and-drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto">
          {/* Renderiza cada coluna do Kanban */}
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
