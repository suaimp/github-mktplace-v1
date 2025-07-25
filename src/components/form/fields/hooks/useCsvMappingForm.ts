import { useCallback } from "react";

export function useCsvMappingForm(mapping: Record<string, string>) {
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("Valores do mapeamento:", mapping);
  }, [mapping]);

  return { handleSubmit };
}
