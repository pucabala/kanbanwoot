// KanbanColumn.jsx
import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

/**
 * @param {{
 *  stage: string,
 *  contacts: Array<{ id: number | string, name: string, email?: string }>
 * }} props
 */
export default function KanbanColumn({ stage, contacts }) {
  return (
    <div className="bg-white rounded shadow-md w-80 flex flex-col">
      <h2 className="px-4 py-2 font-semibold border-b border-gray-200">{stage}</h2>

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-2 p-4 flex-grow min-h-[100px] ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
          >
            {contacts.map((contact, index) => (
              <Draggable key={contact.id} draggableId={String(contact.id)} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-gray-100 p-3 rounded shadow cursor-pointer select-none ${
                      snapshot.isDragging ? 'bg-blue-200 shadow-lg' : ''
                    }`}
                  >
                    <div className="font-medium">{contact.name}</div>
                    {contact.email && <div className="text-sm text-gray-600">{contact.email}</div>}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
