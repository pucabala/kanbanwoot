import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getContacts, updateKanbanStage } from '../api';

// Define os estágios do Kanban
const stages = ['Novo', 'Em Progresso', 'Concluído'];

function KanbanBoard() {
  // Estado para armazenar os contatos organizados por estágio
  const [columns, setColumns] = useState({});

  // Busca os contatos ao montar o componente
  useEffect(() => {
    const fetchContacts = async () => {
      const contacts = await getContacts();
      // Organiza os contatos por estágio
      const organized = stages.reduce((acc, stage) => {
        acc[stage] = contacts.filter(
          c => c.custom_attributes?.kanban === stage
        );
        return acc;
      }, {});
      setColumns(organized);
    };
    fetchContacts();
  }, []);

  // Função chamada ao finalizar o drag and drop
  const onDragEnd = async ({ source, destination }) => {
    if (!destination) return; // Se não houver destino, não faz nada

    // Remove o item da lista de origem
    const sourceList = Array.from(columns[source.droppableId]);
    const [moved] = sourceList.splice(source.index, 1);
    // Adiciona o item na lista de destino
    const destList = Array.from(columns[destination.droppableId] || []);
    destList.splice(destination.index, 0, moved);

    // Atualiza o estado localmente (otimista)
    const updatedColumns = {
      ...columns,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList
    };

    const prevColumns = columns; // Salva o estado anterior para rollback

    setColumns(updatedColumns);

    try {
      // Atualiza o estágio no backend (Chatwoot)
      await updateKanbanStage(moved.id, destination.droppableId);
    } catch (err) {
      setColumns(prevColumns); // Rollback em caso de erro
      alert("Erro ao atualizar estágio no Chatwoot.");
    }
  };

  return (
    // Contexto do drag and drop
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 p-4 overflow-x-auto">
        {/* Renderiza cada coluna do Kanban */}
        {stages.map(stage => (
          <Droppable key={stage} droppableId={stage}>
            {(provided) => (
              <div
                className="bg-gray-100 p-4 rounded w-80 min-h-[300px]"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h2 className="text-lg font-bold mb-2">{stage}</h2>
                {/* Renderiza os contatos dentro da coluna */}
                {columns[stage]?.map((contact, index) => (
                  <Draggable key={contact.id} draggableId={String(contact.id)} index={index}>
                    {(provided) => (
                      <div
                        className="bg-white p-3 mb-2 rounded shadow"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {/* Exibe nome, email ou id do contato */}
                        {contact.name || contact.email || `Contato #${contact.id}`}
                      </div>
                    )}
                  </Draggable>
                ))}
                {/* Placeholder necessário para o drag and drop */}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}

export default KanbanBoard;
