// useKanbanData.js
import { useEffect, useState } from 'react';
import { getContacts, getCustomAttributes, updateContactCustomAttribute } from '../api';

/**
 * Hook para Kanban dinâmico baseado em atributo customizado do tipo lista (prefixo kbw_).
 * Lê o parâmetro da query string e seleciona o atributo correto.
 * @returns {{ contacts: any[], columns: string[], attribute: object, loading: boolean, error: Error | null, updateContactStage: function }}
 */
export function useDynamicKanbanData() {
  const [contacts, setContacts] = useState([]);
  const [columns, setColumns] = useState([]); // valores possíveis do atributo
  const [attribute, setAttribute] = useState(null); // objeto do atributo customizado
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
        // Filtra atributos do tipo list e prefixo kbw_
        const listAttrs = (attrs || []).filter(a => a.attribute_type === 'list' && a.attribute_key.startsWith('kbw_'));
        let selectedAttr = null;
        const param = getQueryParam('kbw');
        if (param) {
          selectedAttr = listAttrs.find(a => a.attribute_key === param);
        }
        if (!selectedAttr) {
          selectedAttr = listAttrs[0];
        }
        if (!selectedAttr) throw new Error('Nenhum atributo customizado do tipo lista com prefixo "kbw_" encontrado.');
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
  }, []);

  // Função para atualizar o valor do atributo customizado do contato
  const updateContactStage = async (contactId, value) => {
    await updateContactCustomAttribute(contactId, attribute.attribute_key, value);
  };

  return { contacts, columns, attribute, loading, error, updateContactStage };
}

function getQueryParam(param) {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}
