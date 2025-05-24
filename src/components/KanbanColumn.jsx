// KanbanColumn.jsx
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';

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
              <KanbanCard key={contact.id} contact={contact} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
