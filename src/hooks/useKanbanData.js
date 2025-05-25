// Hook principal para carregar e gerenciar dados do Kanban dinâmico
import { useEffect, useState } from 'react';
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
  const [columns, setColumns] = useState([]);
  const [attribute, setAttribute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para selecionar o atributo correto para o Kanban
  const selectKanbanAttribute = (attrs, param) => {
    // Se o parâmetro da URL for string, tenta encontrar pelo attribute_key
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
    // Se não encontrou pelo parâmetro, seleciona o primeiro atributo do tipo lista (kbw_)
    const listAttrs = attrs.filter(
      a => a.attribute_display_type === 'list' && a.attribute_key.startsWith('kbw_')
    );
    if (listAttrs.length > 0) {
      console.info('[Kanban] Atributo padrão selecionado:', listAttrs[0].attribute_key);
      return listAttrs[0];
    }
    // Se ainda não encontrou, seleciona qualquer atributo do tipo lista
    const anyListAttr = attrs.find(a => a.attribute_display_type === 'list');
    if (anyListAttr) {
      console.info('[Kanban] Selecionado primeiro atributo do tipo lista:', anyListAttr.attribute_key);
      return anyListAttr;
    }
    // Se não encontrou nenhum atributo válido, mostra aviso
    if (attrs.length > 0) {
      console.warn('[Kanban] Nenhum atributo do tipo lista (kbw_) encontrado. Atributos válidos para Kanban:');
      attrs.filter(a => a.attribute_display_type === 'list').forEach(a => {
        console.info(`- attribute_key: ${a.attribute_key} | display_name: ${a.attribute_display_name}`);
      });
    }
    return null;
  };

  useEffect(() => {
    console.group('useDynamicKanbanData: ciclo de carregamento');
    const searchParams = new URLSearchParams(location.search);
    const param = searchParams.get('kbw');
    console.info('[Kanban] Parâmetro da URL (kbw):', param);

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        let attrs = [];
        let selectedAttr = null;
        // Se o parâmetro da URL for um número, busca direto pelo ID
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
        // Debug dos retornos brutos das APIs
        console.debug('[Kanban][DEBUG] getCustomAttributes() retorno:', attrs);
        console.debug('[Kanban][DEBUG] getContacts() retorno:', contactsData);
        console.info('[Kanban] Resposta bruta dos atributos customizados:', attrs);
        console.info('[Kanban] Atributos customizados recebidos:', attrs?.length);
        // Se não encontrou pelo ID, segue o fluxo normal de seleção
        if (!selectedAttr) {
          selectedAttr = selectKanbanAttribute(attrs, param);
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

  // Função para atualizar o estágio do contato (coluna do Kanban)
  const updateContactStage = async (contactId, value) => {
    await updateContactCustomAttribute(contactId, attribute.attribute_key, value);
  };

  // Retorna os dados e funções para uso no componente Kanban
  return { contacts, columns, attribute, loading, error, updateContactStage };
}
