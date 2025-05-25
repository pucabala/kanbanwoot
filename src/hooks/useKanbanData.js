// useKanbanData.js
// Hook para Kanban dinâmico baseado em atributo customizado do tipo lista (prefixo kbw_)
import { useEffect, useState } from 'react';
import { getContacts, getCustomAttributes, updateContactCustomAttribute } from '../api';
import { useLocation } from 'react-router-dom';

export function useDynamicKanbanData() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const param = searchParams.get('kbw');

  const [contacts, setContacts] = useState([]);
  const [columns, setColumns] = useState([]);
  const [attribute, setAttribute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [attrs, contactsData] = await Promise.all([
          getCustomAttributes(),
          getContacts()
        ]);
        console.log('DEBUG: custom attributes recebidos:', attrs, 'param:', param);
        let listAttrs = (attrs || []).filter(a => a.attribute_display_type === 6 && a.attribute_key.startsWith('kbw_'));
        let selectedAttr = null;
        if (param) {
          selectedAttr = (attrs || []).find(a => a.attribute_display_type === 6 && a.attribute_key === param);
        }
        if (!selectedAttr && listAttrs.length > 0) {
          selectedAttr = listAttrs[0];
        }
        if (!selectedAttr) {
          const anyListAttr = (attrs || []).find(a => a.attribute_display_type === 6);
          if (anyListAttr) selectedAttr = anyListAttr;
        }
        if (!selectedAttr) throw new Error('Nenhum atributo customizado do tipo lista encontrado.');
        setAttribute(selectedAttr);
        setColumns(selectedAttr.attribute_values || []);
        setContacts(contactsData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [param]);

  const updateContactStage = async (contactId, value) => {
    await updateContactCustomAttribute(contactId, attribute.attribute_key, value);
  };

  return { contacts, columns, attribute, loading, error, updateContactStage };
}
