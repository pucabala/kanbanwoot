// useKanbanData.js
// Hook para Kanban dinâmico baseado em atributo customizado do tipo lista (prefixo kbw_)
import { useEffect, useState } from 'react';
import { getContacts, getCustomAttributes, updateContactCustomAttribute } from '../api';

/**
 * Retorna o valor de um parâmetro da query string da URL
 * @param {string} param - Nome do parâmetro
 * @returns {string|null}
 */
function getQueryParam(param) {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

/**
 * Hook React para carregar contatos e colunas do Kanban de forma dinâmica.
 * - Busca todos os atributos customizados do tipo lista com prefixo "kbw_"
 * - Seleciona o atributo correto via query string (?kbw=...) ou o primeiro disponível
 * - Usa os valores desse atributo como colunas do Kanban
 * - Organiza os contatos conforme o valor desse atributo
 * - Permite atualizar o valor do atributo customizado do contato (drag-and-drop)
 *
 * @returns {{
 *   contacts: any[], // Lista de contatos
 *   columns: string[], // Valores possíveis do atributo (colunas)
 *   attribute: object, // Objeto do atributo customizado selecionado
 *   loading: boolean, // Indica se está carregando
 *   error: Error|null, // Erro, se houver
 *   updateContactStage: function // Função para atualizar o valor do atributo do contato
 * }}
 */
export function useDynamicKanbanData() {
  const [contacts, setContacts] = useState([]); // Lista de contatos
  const [columns, setColumns] = useState([]); // Valores possíveis do atributo (colunas)
  const [attribute, setAttribute] = useState(null); // Objeto do atributo customizado selecionado
  const [loading, setLoading] = useState(true); // Estado de loading
  const [error, setError] = useState(null); // Estado de erro

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
        console.log('DEBUG: custom attributes recebidos:', attrs);
        // Filtra atributos do tipo lista e prefixo kbw_
        let listAttrs = (attrs || []).filter(a => a.attribute_type === 'list' && a.attribute_key.startsWith('kbw_'));
        let selectedAttr = null;
        // Lê parâmetro da query string (?kbw=...)
        const param = getQueryParam('kbw');
        if (param) {
          selectedAttr = (attrs || []).find(a => a.attribute_type === 'list' && a.attribute_key === param);
        }
        // Se não houver parâmetro ou não encontrar, usa o primeiro atributo kbw_
        if (!selectedAttr && listAttrs.length > 0) {
          selectedAttr = listAttrs[0];
        }
        // Se ainda não encontrar, usa o primeiro atributo do tipo lista (sem prefixo)
        if (!selectedAttr) {
          const anyListAttr = (attrs || []).find(a => a.attribute_type === 'list');
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
  }, []);

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
