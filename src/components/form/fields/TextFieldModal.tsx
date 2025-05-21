interface TextFieldModalProps {
  field: any;
  value: string;
  onClose: () => void;
}

export default function TextFieldModal({
  field,
  value,
  onClose
}: TextFieldModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {field.label || "Detalhes do Campo"}
        </h2>
        <div className="mb-6">
          <div className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
            {value || <span className="text-gray-400">(vazio)</span>}
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-2 px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
