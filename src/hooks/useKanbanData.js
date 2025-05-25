// useKanbanData.js
// Hook para Kanban dinâmico baseado em atributo customizado do tipo lista (prefixo kbw_)
import { useEffect, useState } from 'react';
import { getContacts, getCustomAttributes, updateContactCustomAttribute } from '../api';
import { useLocation } from 'react-router-dom';

/**
 * Hook para obter o valor de um parâmetro da query string usando React Router
 * @param {string} param - Nome do parâmetro
 * @returns {string|null}
 */
function useQueryParam(param) {
  // Tenta pegar do React Router
  const location = useLocation();
  const [value, setValue] = useState(() => new URLSearchParams(location.search).get(param) || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get(param) : null));

  useEffect(() => {
    // Sempre tenta pegar do React Router, mas faz fallback para window.location.search
    const routerValue = new URLSearchParams(location.search).get(param);
    const winValue = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get(param) : null;
    setValue(routerValue || winValue);
  }, [location.search, param]);

  return value;
}

export function useDynamicKanbanData() {
  const [contacts, setContacts] = useState([]); // Lista de contatos
  const [columns, setColumns] = useState([]); // Valores possíveis do atributo (colunas)
  const [attribute, setAttribute] = useState(null); // Objeto do atributo customizado selecionado
  const [loading, setLoading] = useState(true); // Estado de loading
  const [error, setError] = useState(null); // Estado de erro
  const param = useQueryParam('kbw'); // Usa o hook para ler o parâmetro sempre atualizado

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Busca atributos customizados e contatos em paralelo
        const [attrs, contactsData] = await Promise.all([
          getCustomAttributes(),
          getContacts()
        ]);
        console.log('DEBUG: custom attributes recebidos:', attrs, 'param:', param);
        // Filtra atributos do tipo lista e prefixo kbw_
        let listAttrs = (attrs || []).filter(a => a.attribute_display_type === 6 && a.attribute_key.startsWith('kbw_'));
        let selectedAttr = null;
        // Usa o parâmetro da query string (?kbw=...)
        if (param) {
          selectedAttr = (attrs || []).find(a => a.attribute_display_type === 6 && a.attribute_key === param);
        }
        // Se não houver parâmetro ou não encontrar, usa o primeiro atributo kbw_
        if (!selectedAttr && listAttrs.length > 0) {
          selectedAttr = listAttrs[0];
        }
        // Se ainda não encontrar, usa o primeiro atributo do tipo lista (sem prefixo)
        if (!selectedAttr) {
          const anyListAttr = (attrs || []).find(a => a.attribute_display_type === 6);
          if (anyListAttr) selectedAttr = anyListAttr;
        }
        // Se não encontrar nenhum atributo válido, lança erro
        if (!selectedAttr) throw new Error('Nenhum atributo customizado do tipo lista encontrado.');
        setAttribute(selectedAttr); // Seta o atributo selecionado
        setColumns(selectedAttr.attribute_values || []); // Seta as colunas possíveis
        setContacts(contactsData); // Seta os contatos
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [param]); // Atualiza sempre que o parâmetro mudar

  /**
   * Atualiza o valor do atributo customizado do contato (usado no drag-and-drop)
   * @param {string|number} contactId - ID do contato
   * @param {string} value - Novo valor do atributo
   */
  const updateContactStage = async (contactId, value) => {
    await updateContactCustomAttribute(contactId, attribute.attribute_key, value);
  };

  // Retorna os dados e funções para uso no Kanban
  return { contacts, columns, attribute, loading, error, updateContactStage };
}
