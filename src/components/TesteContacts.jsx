import React, { useEffect, useState } from 'react';
import { getContacts } from '../api';

export default function TesteContacts() {
  const [contacts, setContacts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getContacts()
      .then(setContacts)
      .catch(setError);
  }, []);

  if (error) return <div>Erro: {error.message}</div>;
  if (!contacts) return <div>Carregando contatos...</div>;
  return (
    <div>
      <h2>Contatos</h2>
      <pre style={{textAlign: 'left', background: '#eee', padding: 10, borderRadius: 4}}>
        {JSON.stringify(contacts, null, 2)}
      </pre>
    </div>
  );
}
