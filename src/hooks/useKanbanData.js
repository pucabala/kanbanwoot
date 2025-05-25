import { useEffect, useMemo, useState } from 'react';
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

  const param = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('kbw');
  }, [location.search]);

  const columns = useMemo(() => attribute?.attribute_values || [], [attribute]);

  useEffect(() => {
    console.group('useDynamicKanbanData: ciclo de carregamento');
    console.info('[Kanban] Parâmetro da URL (kbw):', param);

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        let attrs = [];
        let selectedAttr = null;

        if (param && /^\d+$/.test(param)) {
          const attr = await getCustomAttributeById(param);
          if (attr) {
            selectedAttr = attr;
            attrs = [attr];
            console.info('[Kanban] Atributo carregado por ID:', attr);
          }
        } else {
          attrs = await getCustomAttributes();
        }

        const contactsData = await getContacts();

        console.debug('[Kanban][DEBUG] Atributos recebidos:', attrs);
        console.debug('[Kanban][DEBUG] Contatos recebidos:', contactsData);

        if (!selectedAttr) {
          selectedAttr = attrs.find(
            a => a.attribute_display_type === 'list' && a.attribute_key === param
          );
        }

        if (!selectedAttr) {
          selectedAttr = attrs.find(
            a => a.attribute_display_type === 'list' && a.attribute_key.startsWith('kbw_')
          );
        }

        if (!selectedAttr) {
          selectedAttr = attrs.find(a => a.attribute_display_type === 'list');
        }

        if (!selectedAttr) {
          console.error('[Kanban] Nenhum atributo do tipo lista encontrado.');
          throw new Error('Nenhum atributo customizado do tipo lista encontrado.');
        }

        const filteredContacts = contactsData.filter(contact =>
          Object.entries(contact.custom_attributes || {}).some(
            ([key, value]) => key.startsWith('kbw_') && value !== null
          )
        );

        setAttribute(selectedAttr);
        setContacts(filteredContacts);

        console.info('[Kanban] Atributo selecionado:', selectedAttr.attribute_key);
        console.info('[Kanban] Contatos filtrados:', filteredContacts.length);
        console.info('[Kanban] Colunas:', selectedAttr.attribute_values?.map(v => v.value));
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn('[Kanban] Atributo não encontrado no servidor.');
        }
        console.error('[Kanban] Erro ao carregar dados:', err);
        setError(err);
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    }

    fetchData();
  }, [param]);

  const updateContactStage = async (contactId, value) => {
    if (!attribute) return;
    await updateContactCustomAttribute(contactId, attribute.attribute_key, value);
  };

  const isReady = !loading && !error && attribute;

  return {
    contacts,
    columns,
    attribute,
    loading,
    error,
    isReady,
    updateContactStage
  };
}
