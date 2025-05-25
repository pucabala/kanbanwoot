// Hook principal para carregar e gerenciar dados do Kanban dinâmico
import { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getContacts,
  getCustomAttributes,
  updateContactCustomAttribute,
  getCustomAttributeById
} from '../api';

// Hook customizado para fornecer dados do Kanban de acordo com atributos customizados
export function useDynamicKanbanData() {
  const location = useLocation();
  const [contacts, setContacts] = useState([]);
  const [attribute, setAttribute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const lastParamRef = useRef(null);

  const columns = useMemo(() => attribute?.attribute_values || [], [attribute]);

  const selectKanbanAttribute = (attrs, param) => {
    if (param) {
      const attrByKey = attrs.find(
        a => a.attribute_display_type === 'list' && a.attribute_key === param
      );
      if (attrByKey) {
        console.info('[Kanban] Atributo selecionado via URL:', attrByKey.attribute_key);
        return attrByKey;
      } else {
        console.warn('[Kanban] Nenhum atributo encontrado com a chave da URL:', param);
      }
    }

    const listAttrs = attrs.filter(
      a => a.attribute_display_type === 'list' && a.attribute_key.startsWith('kbw_')
    );
    if (listAttrs.length > 0) {
      console.info('[Kanban] Atributo padrão selecionado:', listAttrs[0].attribute_key);
      return listAttrs[0];
    }

    const anyListAttr = attrs.find(a => a.attribute_display_type === 'list');
    if (anyListAttr) {
      console.info('[Kanban] Selecionado primeiro atributo do tipo lista:', anyListAttr.attribute_key);
      return anyListAttr;
    }

    if (attrs.length > 0) {
      console.warn('[Kanban] Nenhum atributo do tipo lista (kbw_) encontrado. Atributos válidos para Kanban:');
      attrs.filter(a => a.attribute_display_type === 'list').forEach(a => {
        console.info(`- attribute_key: ${a.attribute_key} | display_name: ${a.attribute_display_name}`);
      });
    }

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

        const contactsData = await getContacts();

        console.debug('[Kanban][DEBUG] getCustomAttributes() retorno:', attrs);
        console.debug('[Kanban][DEBUG] getContacts() retorno:', contactsData);

        if (!selectedAttr) {
          selectedAttr = selectKanbanAttribute(attrs, param);
        }

        if (!selectedAttr) {
          console.error('[Kanban] Nenhum atributo customizado do tipo lista encontrado.');
          throw new Error('Nenhum atributo customizado do tipo lista encontrado.');
        }

        setAttribute(selectedAttr);
        setContacts(contactsData);

        console.info('[Kanban] Contatos carregados:', contactsData?.length);
        console.info('[Kanban] Colunas:', selectedAttr.attribute_values?.map(v => v.value));
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

  const updateContactStage = async (contactId, value) => {
    await updateContactCustomAttribute(contactId, attribute.attribute_key, value);
  };

  const isReady = !loading && !error && attribute;

  return { contacts, columns, attribute, loading, error, isReady, updateContactStage };
}
