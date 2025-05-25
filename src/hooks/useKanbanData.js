export function useDynamicKanbanData() {
  const location = useLocation();

  const [contacts, setContacts] = useState([]);
  const [columns, setColumns] = useState([]);
  const [attribute, setAttribute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const param = searchParams.get('kbw');
    console.log('DEBUG: param =', param);

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [attrs, contactsData] = await Promise.all([
          getCustomAttributes(),
          getContacts()
        ]);

        let listAttrs = (attrs || []).filter(a => a.attribute_display_type === 6 && a.attribute_key.startsWith('kbw_'));
        let selectedAttr = null;

        if (param) {
          selectedAttr = (attrs || []).find(a => a.attribute_display_type === 6 && a.attribute_key === param);
        }
        if (!selectedAttr && listAttrs.length > 0) {
          selectedAttr = listAttrs[0];
        }
        if (!selectedAttr) {
          const anyListAttr = (attrs || []).find(a => a.attribute_display_type === 6);
          if (anyListAttr) selectedAttr = anyListAttr;
        }
        if (!selectedAttr) throw new Error('Nenhum atributo customizado do tipo lista encontrado.');
        setAttribute(selectedAttr);
        setColumns(selectedAttr.attribute_values || []);
        setContacts(contactsData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [location.search]);

  const updateContactStage = async (contactId, value) => {
    await updateContactCustomAttribute(contactId, attribute.attribute_key, value);
  };

  return { contacts, columns, attribute, loading, error, updateContactStage };
}
