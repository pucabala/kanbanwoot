// KanbanCard.jsx
import React, { useEffect, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { getCustomAttributes } from '../api';

/**
 * @param {{
 *  contact: { id: number | string, name: string, email?: string },
 *  index: number
 * }} props
 */
export default function KanbanCard({ contact, index }) {
  // Suporte para thumbnail e telefone
  const thumbnail = contact.thumbnail || contact.avatar_url || contact.profile_picture_url;
  const phone = contact.phone || contact.telefone || contact.mobile;

  // Novo: buscar e mapear display_name dos atributos kbw_
  const [attrDisplayNames, setAttrDisplayNames] = useState({});
  useEffect(() => {
    let mounted = true;
    async function fetchDisplayNames() {
      const defs = await getCustomAttributes();
      // Cria um map: { attribute_key: attribute_display_name }
      const map = {};
      defs.forEach(def => {
        if (def.attribute_key && def.attribute_key.startsWith('kbw_')) {
          map[def.attribute_key] = def.attribute_display_name || def.attribute_key;
        }
      });
      if (mounted) setAttrDisplayNames(map);
    }
    fetchDisplayNames();
    return () => { mounted = false; };
  }, []);

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
          <div className="flex items-center gap-2">
            {thumbnail && (
              <img
                src={thumbnail}
                alt={contact.name}
                className="w-6 h-6 rounded-full object-cover"
                style={{ minWidth: 24, minHeight: 24 }}
              />
            )}
            <div className="font-medium">{contact.name}</div>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {phone && <span>{phone}</span>}
            {contact.email && phone && <span className="mx-2">·</span>}
            {contact.email && <span>{contact.email}</span>}
          </div>
          {/* Mostra atributos que começam com kbw_ usando display_name */}
          {contact.custom_attributes && (
            <div className="mt-2 text-xs text-gray-500">
              {Object.entries(contact.custom_attributes)
                .filter(([key, value]) => key.startsWith('kbw_') && value !== null && value !== undefined && value !== '')
                .map(([key, value]) => (
                  <div key={key} className="truncate">
                    <span className="font-semibold">{attrDisplayNames[key] || key.replace('kbw_', '')}: </span>
                    <span>{String(value)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
