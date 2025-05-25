import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getContacts, getCustomAttributes, updateContactCustomAttribute } from '../api';

export function useDynamicKanbanData() {
  const location = useLocation();

  const [contacts, setContacts] = useState([]);
  const [columns, setColumns] = useState([]);
  const [attribute, setAttribute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.group('useDynamicKanbanData: ciclo de carregamento');
    const searchParams = new URLSearchParams(location.search);
    const param = searchParams.get('kbw');
    console.info('[Kanban] Parâmetro da URL (kbw):', param);

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        console.info('[Kanban] Buscando atributos customizados e contatos...');
        const [attrs, contactsData] = await Promise.all([
          getCustomAttributes(),
          getContacts()
        ]);
        console.info('[Kanban] Resposta bruta dos atributos customizados:', attrs);
        console.info('[Kanban] Atributos customizados recebidos:', attrs?.length);
        let listAttrs = (attrs || []).filter(a => a.attribute_display_type === 6 && a.attribute_key.startsWith('kbw_'));
        console.info('[Kanban] Atributos do tipo lista (kbw_):', listAttrs.map(a => a.attribute_key));
        let selectedAttr = null;

        if (param) {
          selectedAttr = (attrs || []).find(a => a.attribute_display_type === 6 && a.attribute_key === param);
          if (selectedAttr) {
            console.info('[Kanban] Atributo selecionado via URL:', selectedAttr.attribute_key);
          } else {
            console.warn('[Kanban] Nenhum atributo encontrado com a chave da URL:', param);
          }
        }
        if (!selectedAttr && listAttrs.length > 0) {
          selectedAttr = listAttrs[0];
          console.info('[Kanban] Atributo padrão selecionado:', selectedAttr.attribute_key);
        }
        if (!selectedAttr) {
          const anyListAttr = (attrs || []).find(a => a.attribute_display_type === 6);
          if (anyListAttr) {
            selectedAttr = anyListAttr;
            console.info('[Kanban] Selecionado primeiro atributo do tipo lista:', selectedAttr.attribute_key);
          }
        }
        if (!selectedAttr) {
          console.error('[Kanban] Nenhum atributo customizado do tipo lista encontrado.');
          throw new Error('Nenhum atributo customizado do tipo lista encontrado.');
        }
        setAttribute(selectedAttr);
        setColumns(selectedAttr.attribute_values || []);
        setContacts(contactsData);
        console.info('[Kanban] Contatos carregados:', contactsData?.length);
        console.info('[Kanban] Colunas:', selectedAttr.attribute_values?.map(v => v.value));
        console.info('[Kanban] Estado pronto para renderização.');
      } catch (err) {
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

  return { contacts, columns, attribute, loading, error, updateContactStage };
}
