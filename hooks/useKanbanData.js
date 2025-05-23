// useKanbanData.js
import { useEffect, useState } from 'react';
import { getContacts, getKanbanStages } from '../api';

/**
 * Hook personalizado para carregar estágios e contatos do Chatwoot.
 * @returns {{ contacts: any[], stages: string[], loading: boolean, error: Error | null }}
 */
export function useKanbanData() {
  const [contacts, setContacts] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedStages, fetchedContacts] = await Promise.all([
          getKanbanStages(),
          getContacts()
        ]);
        setStages(fetchedStages);
        setContacts(fetchedContacts);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { contacts, stages, loading, error };
}
