import { useEffect, useState, useRef, useMemo } from 'react';
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

  const lastParamRef = useRef(null);

  // Derivado do atributo selecionado
  const columns = useMemo(() => attribute?.attribute_values || [], [attribute]);

  const selectKanbanAttribute = (attrs, param) => {
    if (param) {
      const attrByKey = attrs.find(
        a => a.attribute_display_type === 'list' && a.attribute_key === param
      );
      if (attrByKey) {
        console.info('[Kanban] Atributo selecionado via URL:', attrByKey.attribute_key);
        return attrByKey;
      }
      console.warn('[Kanban] Atributo encontrado com a chave da URL:', param);
    }

    const kbwList = attrs.filter(
      a => a.attribute_display_type === 'list' && a.attribute_key.startsWith('kbw_')
    );
    if (kbwList.length > 0) {
      console.info('[Kanban] Atributo padrão (kbw_) selecionado:', kbwList[0].attribute_key);
      return kbwList[0];
    }

    const anyListAttr = attrs.find(a => a.attribute_display_type === 'list');
    if (anyListAttr) {
      console.info('[Kanban] Primeiro atributo do tipo lista selecionado:', anyListAttr.attribute_key);
      return anyListAttr;
    }

    console.warn('[Kanban] Nenhum atributo do tipo lista encontrado.');
    return null;
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const param = searchParams.get('kbw');

    if (lastParamRef.current === param) return;
    lastParamRef.current = param;

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

        let contactsData = await getContacts();

        console.debug('[Kanban][DEBUG] Atributos:', attrs);
        console.debug('[Kanban][DEBUG] Contatos:', contactsData);

        if (!selectedAttr) {
          selectedAttr = selectKanbanAttribute(attrs, param);
        }

        if (!selectedAttr) {
          throw new Error('Nenhum atributo customizado do tipo lista encontrado.');
        }

        setAttribute(selectedAttr);

        // Filtro: somente contatos com algum atributo "kbw_" diferente de null
        contactsData = contactsData.filter(contact => {
          return Object.entries(contact.custom_attributes || {}).some(
            ([key, value]) => key.startsWith('kbw_') && value !== null
          );
        });

        setContacts(contactsData);
        console.info('[Kanban] Contatos filtrados:', contactsData.length);
        console.info('[Kanban] Colunas do atributo selecionado:', selectedAttr.attribute_values?.map(v => v.value));
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

  const updateContactStage = async (contactId, value) => {
    await updateContactCustomAttribute(contactId, attribute.attribute_key, value);
  };

  const isReady = !loading && !error && attribute;

  return { contacts, columns, attribute, loading, error, isReady, updateContactStage };
}
