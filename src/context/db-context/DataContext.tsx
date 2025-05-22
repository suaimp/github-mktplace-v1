import React, { createContext, useContext, useState, useEffect } from "react";
import { getForms } from "./services/formsService";

export type Form = {
  id: string;
  // adicione outros campos conforme o schema da tabela forms
};

type DataContextType = {
  forms: Form[];
  loading: boolean;
  fetchForms: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchForms = async () => {
    setLoading(true);
    const data = await getForms();
    setForms(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchForms();
  }, []);

  return (
    <DataContext.Provider value={{ forms, loading, fetchForms }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context)
    throw new Error("useDataContext must be used within a DataProvider");
  return context;
};

export { DataContext };
