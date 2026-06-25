import { createContext, useState, useContext } from 'react';

const ImportContext = createContext();

export function ImportProvider({ children }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  return (
    <ImportContext.Provider value={{ progress, setProgress, status, setStatus }}>
      {children}
    </ImportContext.Provider>
  );
}

export const useImport = () => useContext(ImportContext);