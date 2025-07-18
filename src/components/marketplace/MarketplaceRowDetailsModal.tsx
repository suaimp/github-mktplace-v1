import { formatMarketplaceValue } from "./MarketplaceValueFormatter";
import { useEffect, useState } from "react";

interface MarketplaceRowDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any;
  fields: any[];
  productNameField: any;
}

export default function MarketplaceRowDetailsModal({
  isOpen,
  onClose,
  entry,
  fields,
  productNameField
}: MarketplaceRowDetailsModalProps) {
  // Novo estado para controlar montagem/desmontagem
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [lastEntry, setLastEntry] = useState(entry);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen && entry) {
      setShouldRender(true);
      setLastEntry(entry);
      // Garante que a animação de entrada ocorra após montagem
      setTimeout(() => setIsVisible(true), 10);
    } else if (!isOpen && shouldRender) {
      // Espera a animação terminar antes de desmontar
      const timeout = setTimeout(() => setShouldRender(false), 300);
      setIsVisible(false);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, entry]);

  // Só desmonta após animação
  if (!shouldRender) return null;
  const modalEntry = lastEntry;
  if (!modalEntry) return null;

  // Filtrar os campos que não são essenciais (Site, categorias, preço, comprar)
  const essentialFields = ["url", "site_url", "categories", "category", "product", "button_buy"];
  const detailFields = fields.filter(field => !essentialFields.includes(field.field_type));

  // Nome do produto para o título
  const productName = productNameField 
    ? modalEntry.values[productNameField.id] || "Produto"
    : "Detalhes do Produto";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[999999] bg-black transition-opacity duration-300 ${
          isOpen ? 'bg-opacity-50 visible' : 'bg-opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 max-w-md bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-[999999] transform transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              {productName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors hover:rotate-90 transition-transform duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {detailFields.map((field) => {
                const settings = field.form_field_settings || {};
                const displayName = settings.marketplace_label || field.label;
                const value = modalEntry.values[field.id];

                // Pular campos vazios
                if (value === null || value === undefined || value === "") {
                  return null;
                }

                return (
                  <div key={field.id} className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {displayName}
                    </h4>
                    <div className="text-gray-800 dark:text-white text-sm">
                      {formatMarketplaceValue(value, field.field_type, true)}
                    </div>
                  </div>
                );
              })}
              {detailFields.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhuma informação adicional disponível
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
