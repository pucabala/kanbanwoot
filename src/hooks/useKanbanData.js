import { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { getContacts, getCustomAttributes, updateContactCustomAttribute } from '../api';

export function useDynamicKanbanData() {
  const location = useLocation();

  // Estado para armazenar contatos filtrados (com atributos que começam com 'kbw_' e não nulos)
  const [contacts, setContacts] = useState([]);

  // Estado para armazenar o atributo customizado atual (guardando só campos essenciais)
  const [attribute, setAttribute] = useState(null);

  // Estados para controle de carregamento e erros
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs para armazenar o último parâmetro da URL e o último atributo selecionado
  const lastParamRef = useRef(null);
  const lastAttributeKeyRef = useRef(null);

  // Memoização das colunas para evitar re-renderizações desnecessárias
  // Colunas são os valores do atributo customizado (tipo lista)
  const columns = useMemo(() => {
    if (!attribute) return [];
    return attribute.attribute_values || [];
  }, [attribute]);

  useEffect(() => {
    // Extrai o parâmetro 'kbw' da URL
    const searchParams = new URLSearchParams(location.search);
    const param = searchParams.get('kbw');

    console.group('[DEBUG] useDynamicKanbanData: Efeito disparado');
    console.log('[DEBUG] Parâmetro atual da URL (kbw):', param);
    console.log('[DEBUG] Parâmetro anterior:', lastParamRef.current);

    // Evita recarregar se o parâmetro 'kbw' não mudou
    if (lastParamRef.current === param) {
      console.log('[DEBUG] Parâmetro igual ao anterior, efeito abortado');
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

        // Busca todos os atributos customizados do tipo 'contact_attribute'
        attrs = await getCustomAttributes();
        console.log('[DEBUG] Atributos carregados:', attrs.map(a => a.attribute_key));

        // Seleciona o atributo conforme o parâmetro exato da URL, se existir
        if (param) {
          selectedAttr = attrs.find(
            a => a.attribute_display_type === 'list' && a.attribute_key === param
          );
          console.log('[DEBUG] Atributo selecionado via parâmetro:', selectedAttr?.attribute_key);
        }

        // Se não encontrou pelo parâmetro, tenta pegar o primeiro atributo do tipo lista que comece com "kbw_"
        if (!selectedAttr) {
          selectedAttr = attrs.find(
            a => a.attribute_display_type === 'list' && a.attribute_key.startsWith('kbw_')
          );
          console.log('[DEBUG] Atributo selecionado por fallback (kbw_):', selectedAttr?.attribute_key);
        }

        // Se ainda não encontrou, pega o primeiro atributo do tipo lista disponível
        if (!selectedAttr) {
          selectedAttr = attrs.find(a => a.attribute_display_type === 'list');
          console.log('[DEBUG] Atributo selecionado por fallback (qualquer lista):', selectedAttr?.attribute_key);
        }

        // Se não achou nenhum atributo do tipo lista, lança erro
        if (!selectedAttr) throw new Error('Nenhum atributo tipo lista encontrado.');

        // Busca todos os contatos
        const contactsData = await getContacts();

        // Filtra contatos para mostrar somente os que têm algum atributo customizado começando com "kbw_" e com valor diferente de null
        const filteredContacts = contactsData.filter(contact =>
          Object.entries(contact.custom_attributes || {}).some(
            ([key, value]) => key.startsWith('kbw_') && value != null
          )
        );

        console.log('[DEBUG] Contatos filtrados:', filteredContacts.length);

        // Atualiza estado dos contatos filtrados
        setContacts(filteredContacts);

        // Atualiza o estado do atributo apenas se o atributo selecionado mudou
        if (lastAttributeKeyRef.current !== selectedAttr.attribute_key) {
          // Guarda só os campos essenciais para evitar problemas e re-render desnecessário
          setAttribute({
            attribute_key: selectedAttr.attribute_key,
            attribute_values: selectedAttr.attribute_values
          });
          lastAttributeKeyRef.current = selectedAttr.attribute_key;
          console.log('[DEBUG] Estado attribute atualizado!');
        } else {
          console.log('[DEBUG] Atributo igual ao anterior, estado attribute não atualizado. Apenas contatos atualizados.');
        }

      } catch (err) {
        setError(err);
        console.error('[DEBUG] Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    }

    fetchData();
  }, [location.search]);

  // Retorna os dados e estados do hook para o componente consumir
  return { contacts, columns, attribute, loading, error };
}

// Hook para atualização de atributo customizado de contato
export function useUpdateContactAttribute() {
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Função para atualizar atributo customizado no backend
  const updateContactAttribute = async (contactId, attributeKey, value) => {
    setUpdating(true);
    setUpdateError(null);
    try {
      await updateContactCustomAttribute(contactId, attributeKey, value);
    } catch (error) {
      setUpdateError(error);
      console.error('[DEBUG] Erro ao atualizar atributo do contato:', error);
    } finally {
      setUpdating(false);
    }
  };

  return { updateContactAttribute, updating, updateError };
}

// Hook combinado para facilitar o consumo no componente
export function useKanbanData() {
  const { contacts, columns, attribute, loading, error } = useDynamicKanbanData();
  const { updateContactAttribute, updating, updateError } = useUpdateContactAttribute();

  return {
    contacts,
    columns,
    attribute,
    loading,
    error,
    updateContactAttribute,
    updating,
    updateError
  };
}
