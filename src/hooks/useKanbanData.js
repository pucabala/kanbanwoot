// Hook principal para carregar e gerenciar dados do Kanban dinâmico
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getContacts, getCustomAttributes, updateContactCustomAttribute } from '../api';

// Hook customizado para fornecer dados do Kanban de acordo com atributos customizados
export function useDynamicKanbanData() {
  const location = useLocation(); // Hook do React Router para acessar a URL

  // Estados locais para contatos, colunas, atributo selecionado, loading e erro
  const [contacts, setContacts] = useState([]);
  const [columns, setColumns] = useState([]);
  const [attribute, setAttribute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efeito para buscar dados sempre que a URL mudar
  useEffect(() => {
    console.group('useDynamicKanbanData: ciclo de carregamento');
    const searchParams = new URLSearchParams(location.search); // Pega parâmetros da URL
    const param = searchParams.get('kbw'); // Pega parâmetro específico para o Kanban
    console.info('[Kanban] Parâmetro da URL (kbw):', param);

    // Função assíncrona para buscar dados
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        console.info('[Kanban] Buscando atributos customizados e contatos...');
        // Busca atributos customizados e contatos em paralelo
        const [attrs, contactsData] = await Promise.all([
          getCustomAttributes(),
          getContacts()
        ]);
        // Debug dos retornos brutos das APIs
        console.debug('[Kanban][DEBUG] getCustomAttributes() retorno:', attrs);
        console.debug('[Kanban][DEBUG] getContacts() retorno:', contactsData);
        console.info('[Kanban] Resposta bruta dos atributos customizados:', attrs);
        console.info('[Kanban] Atributos customizados recebidos:', attrs?.length);
        // Filtra atributos do tipo lista e que começam com 'kbw_'
        let listAttrs = (attrs || []).filter(a => a.attribute_display_type === 'list' && a.attribute_key.startsWith('kbw_'));
        console.info('[Kanban] Atributos do tipo lista (kbw_):', listAttrs.map(a => a.attribute_key));
        let selectedAttr = null;

        // Se houver parâmetro na URL, tenta selecionar o atributo correspondente
        if (param) {
          // Permite tanto atributo_display_type === 6 quanto 'list' (compatibilidade)
          selectedAttr = (attrs || []).find(a => (a.attribute_display_type === 'list') && a.attribute_key === param);
          if (selectedAttr) {
            console.info('[Kanban] Atributo selecionado via URL:', selectedAttr.attribute_key);
          } else {
            console.warn('[Kanban] Atributo encontrado com a chave da URL:', param);
          }
        }
        // Se não encontrou pelo parâmetro, seleciona o primeiro atributo do tipo lista (kbw_)
        if (!selectedAttr && listAttrs.length > 0) {
          selectedAttr = listAttrs[0];
          console.info('[Kanban] Atributo padrão selecionado:', selectedAttr.attribute_key);
        }
        // Se ainda não encontrou, seleciona qualquer atributo do tipo lista
        if (!selectedAttr) {
          const anyListAttr = (attrs || []).find(a => a.attribute_display_type === 'list');
          if (anyListAttr) {
            selectedAttr = anyListAttr;
            console.info('[Kanban] Selecionado primeiro atributo do tipo lista:', selectedAttr.attribute_key);
          }
        }
        // Se não encontrou nenhum atributo válido, mostra aviso
        if (!selectedAttr && listAttrs.length === 0) {
          console.warn('[Kanban] Nenhum atributo do tipo lista (kbw_) encontrado. Atributos válidos para Kanban:');
          const validAttrs = (attrs || []).filter(a => a.attribute_display_type === 'list');
          validAttrs.forEach(a => {
            console.info(`- attribute_key: ${a.attribute_key} | display_name: ${a.attribute_display_name}`);
          });
        }
        // Se não encontrou nenhum atributo do tipo lista, lança erro
        if (!selectedAttr) {
          console.error('[Kanban] Nenhum atributo customizado do tipo lista encontrado.');
          throw new Error('Nenhum atributo customizado do tipo lista encontrado.');
        }
        // Atualiza estados com os dados carregados
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

    fetchData(); // Executa a busca de dados
  }, [location.search]); // Executa sempre que a URL mudar

  // Função para atualizar o estágio do contato (coluna do Kanban)
  const updateContactStage = async (contactId, value) => {
    await updateContactCustomAttribute(contactId, attribute.attribute_key, value);
  };

  // Retorna os dados e funções para uso no componente Kanban
  return { contacts, columns, attribute, loading, error, updateContactStage };
}
