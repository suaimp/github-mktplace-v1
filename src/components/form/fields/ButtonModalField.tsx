import React, { useState } from "react";

interface ButtonModalFieldProps {
  field: any;
  settings: any;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorClear?: () => void;
}

export default function ButtonModalField({
  field,
  settings,
  value,
  onChange,
  error,
  onErrorClear
}: ButtonModalFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
      >
        {field.label || "Abrir Modal"}
      </button>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md ">
            <h2 className="text-lg font-semibold mb-4">
              {field.modalTitle || "Título do Modal"}
            </h2>
            <div className="mb-6">
              {field.modalContent || "Conteúdo do modal aqui."}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
