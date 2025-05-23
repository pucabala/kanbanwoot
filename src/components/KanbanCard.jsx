// KanbanCard.jsx
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

/**
 * @param {{
 *  contact: { id: number | string, name: string, email?: string },
 *  index: number
 * }} props
 */
export default function KanbanCard({ contact, index }) {
  return (
    <Draggable draggableId={String(contact.id)} index={index}>
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
  );
}
