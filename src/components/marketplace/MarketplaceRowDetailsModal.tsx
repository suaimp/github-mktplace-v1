import { formatMarketplaceValue } from "./MarketplaceValueFormatter";

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
  if (!entry) return null;

  // Filtrar os campos que não são essenciais (Site, categorias, preço, comprar)
  const essentialFields = ["url", "site_url", "categories", "category", "product", "button_buy"];
  const detailFields = fields.filter(field => !essentialFields.includes(field.field_type));

  // Nome do produto para o título
  const productName = productNameField 
    ? entry.values[productNameField.id] || "Produto"
    : "Detalhes do Produto";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-[999999] transition-all duration-500 ease-out ${
          isOpen ? "bg-opacity-50 visible" : "bg-opacity-0 invisible"
        }`}
        onClick={onClose}
      />
      
      {/* Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-[999999] transition-all duration-500 ease-out transform ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div 
            className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 transition-all duration-700 delay-200 ${
              isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
            }`}
          >
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
          <div 
            className={`flex-1 overflow-y-auto p-6 transition-all duration-700 delay-300 ${
              isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="space-y-4">
              {detailFields.map((field, index) => {
                const settings = field.form_field_settings || {};
                const displayName = settings.marketplace_label || field.label;
                const value = entry.values[field.id];

                // Pular campos vazios
                if (value === null || value === undefined || value === "") {
                  return null;
                }

                return (
                  <div 
                    key={field.id} 
                    className={`space-y-1 transition-all duration-500 ${
                      isOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                    }`}
                    style={{
                      transitionDelay: `${400 + index * 50}ms`
                    }}
                  >
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
