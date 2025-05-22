import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getContacts, updateKanbanStage } from '../api';

const stages = ['Novo', 'Em Progresso', 'Concluído'];

function KanbanBoard() {
  const [columns, setColumns] = useState({});

  useEffect(() => {
    const fetchContacts = async () => {
      const contacts = await getContacts();
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

  const onDragEnd = async ({ source, destination }) => {
    if (!destination) return;

    const sourceList = Array.from(columns[source.droppableId]);
    const [moved] = sourceList.splice(source.index, 1);
    const destList = Array.from(columns[destination.droppableId] || []);
    destList.splice(destination.index, 0, moved);

    const updatedColumns = {
      ...columns,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList
    };

    const prevColumns = columns; // Salva o estado anterior

    setColumns(updatedColumns);

    try {
      await updateKanbanStage(moved.id, destination.droppableId);
    } catch (err) {
      setColumns(prevColumns); // Rollback em caso de erro
      alert("Erro ao atualizar estágio no Chatwoot.");
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 p-4 overflow-x-auto">
        {stages.map(stage => (
          <Droppable key={stage} droppableId={stage}>
            {(provided) => (
              <div
                className="bg-gray-100 p-4 rounded w-80 min-h-[300px]"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h2 className="text-lg font-bold mb-2">{stage}</h2>
                {columns[stage]?.map((contact, index) => (
                  <Draggable key={contact.id} draggableId={String(contact.id)} index={index}>
                    {(provided) => (
                      <div
                        className="bg-white p-3 mb-2 rounded shadow"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {contact.name || contact.email || `Contato #${contact.id}`}
                      </div>
                    )}
                  </Draggable>
                ))}
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
