import { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function useDynamicKanbanData() {
  const location = useLocation();
  const [contacts, setContacts] = useState([]);
  const [attribute, setAttribute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastParamRef = useRef(null);
  const lastAttributeKeyRef = useRef(null);

  // Memoiza colunas para evitar re-render desnecessário
  const columns = useMemo(() => {
    if (!attribute) return [];
    return attribute.attribute_values || [];
  }, [attribute]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const param = searchParams.get('kbw');

    console.group('[DEBUG] useDynamicKanbanData: Efeito disparado');
    console.log('[DEBUG] Parâmetro atual da URL (kbw):', param);
    console.log('[DEBUG] Parâmetro anterior:', lastParamRef.current);

    // Evita recarregar se o param não mudou
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

        // Buscando atributos customizados
        attrs = await getCustomAttributes();
        console.log('[DEBUG] Atributos carregados:', attrs.map(a => a.attribute_key));

        // Seleciona atributo conforme parâmetro (exato)
        if (param) {
          selectedAttr = attrs.find(a => a.attribute_display_type === 'list' && a.attribute_key === param);
          console.log('[DEBUG] Atributo selecionado via parâmetro:', selectedAttr?.attribute_key);
        }
        // Caso não tenha selecionado ainda, pega primeiro atributo do tipo lista começando com kbw_
        if (!selectedAttr) {
          selectedAttr = attrs.find(a => a.attribute_display_type === 'list' && a.attribute_key.startsWith('kbw_'));
          console.log('[DEBUG] Atributo selecionado por fallback (kbw_):', selectedAttr?.attribute_key);
        }
        // Caso não tenha ainda, pega o primeiro atributo do tipo lista
        if (!selectedAttr) {
          selectedAttr = attrs.find(a => a.attribute_display_type === 'list');
          console.log('[DEBUG] Atributo selecionado por fallback (qualquer lista):', selectedAttr?.attribute_key);
        }
        if (!selectedAttr) throw new Error('Nenhum atributo tipo lista encontrado.');

        const contactsData = await getContacts();

        // Debug antes de setar o estado
        console.log('[DEBUG] Contatos carregados:', contactsData.length);
        console.log('[DEBUG] Último atributo no estado:', lastAttributeKeyRef.current);
        console.log('[DEBUG] Novo atributo para setar:', selectedAttr.attribute_key);

        // Só atualiza o estado se o atributo mudou (compara attribute_key)
        if (lastAttributeKeyRef.current !== selectedAttr.attribute_key) {
          setAttribute({ ...selectedAttr });  // cria novo objeto para garantir atualização
          lastAttributeKeyRef.current = selectedAttr.attribute_key;
          setContacts(contactsData);
          console.log('[DEBUG] Estado attribute atualizado!');
        } else {
          console.log('[DEBUG] Atributo igual ao anterior, estado não atualizado.');
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

  return { contacts, columns, attribute, loading, error };
}
