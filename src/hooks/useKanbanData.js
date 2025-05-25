import { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getContacts,
  getCustomAttributes,
  updateContactCustomAttribute,
  getCustomAttributeById
} from '../api';

export function useDynamicKanbanData() {
  const location = useLocation();

  const [contacts, setContacts] = useState([]);
  const [attribute, setAttribute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref para controlar última query e evitar chamadas desnecessárias
  const lastParamRef = useRef(null);

  // Colunas derivadas do atributo selecionado, memoizadas para não recalcular sem necessidade
  const columns = useMemo(() => attribute?.attribute_values || [], [attribute]);

  // Contatos filtrados: só aqueles que tenham algum atributo que começa com "kbw_" e valor diferente de null
  const filteredContacts = useMemo(() => {
    if (!contacts.length) return [];

    return contacts.filter(contact => {
      return Object.entries(contact.custom_attributes || {}).some(
        ([key, value]) => key.startsWith('kbw_') && value != null
      );
    });
  }, [contacts]);

  useEffect(() => {
    console.group('useDynamicKanbanData: ciclo de carregamento');
    const searchParams = new URLSearchParams(location.search);
    const param = searchParams.get('kbw');
    console.info('[Kanban] Parâmetro da URL (kbw):', param);

    // Evita recarregar se o parâmetro não mudou
    if (lastParamRef.current === param) {
      console.info('[Kanban] Parâmetro repetido, evitando reload.');
      setLoading(false);
      console.groupEnd();
      return;
    }
    lastParamRef.current = param;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        let attrs = [];
        let selectedAttr = null;

        if (param) {
          if (/^\d+$/.test(param)) {
            // Se param for um ID numérico, busca direto pelo ID
            selectedAttr = await getCustomAttributeById(param);
            if (selectedAttr) attrs = [selectedAttr];
            console.info('[Kanban] Atributo carregado por ID:', selectedAttr);
          } else {
            // param é uma string: busca todos e seleciona pelo attribute_key
            attrs = await getCustomAttributes();
            selectedAttr = attrs.find(
              a => a.attribute_display_type === 'list' && a.attribute_key === param
            );
            console.info('[Kanban] Atributo selecionado por chave:', selectedAttr?.attribute_key);
          }
        } else {
          attrs = await getCustomAttributes();
        }

        // Fallbacks para atributo caso não encontrado pelo param
        if (!selectedAttr) {
          selectedAttr = attrs.find(
            a => a.attribute_display_type === 'list' && a.attribute_key.startsWith('kbw_')
          );
          if (!selectedAttr) {
            selectedAttr = attrs.find(a => a.attribute_display_type === 'list');
          }
        }

        if (!selectedAttr) {
          throw new Error('Nenhum atributo customizado do tipo lista encontrado.');
        }

        const contactsData = await getContacts();
        console.debug('[Kanban][DEBUG] getCustomAttributes() retorno:', attrs);
        console.debug('[Kanban][DEBUG] getContacts() retorno:', contactsData);

        setAttribute(selectedAttr);
        setContacts(contactsData);

        console.info('[Kanban] Contatos carregados:', contactsData.length);
        console.info('[Kanban] Colunas (valores do atributo):', selectedAttr.attribute_values?.map(v => v.value));
        console.info('[Kanban] Estado pronto para renderização.');
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn('[Kanban] Atributo não encontrado no servidor.');
        }
        setError(err);
        console.error('[Kanban] Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    }

    fetchData();
  }, [location.search]);

  // Atualiza o atributo customizado do contato (ex: mudar coluna)
  const updateContactStage = async (contactId, value) => {
    if (!attribute) {
      throw new Error('Atributo não carregado para atualização.');
    }
    await updateContactCustomAttribute(contactId, attribute.attribute_key, value);
  };

  // Indicador para uso no componente, sinalizando se está pronto
  const isReady = !loading && !error && attribute;

  return {
    contacts: filteredContacts,
    columns,
    attribute,
    loading,
    error,
    isReady,
    updateContactStage,
  };
}
