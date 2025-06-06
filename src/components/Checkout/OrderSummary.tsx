import { formatCurrency } from "../marketplace/utils";

interface OrderSummaryProps {
  items: any[];
  totalProductPrice: number;
  totalContentPrice: number;
}

export default function OrderSummary({
  items,
  totalProductPrice,
  totalContentPrice
}: OrderSummaryProps) {
  const total = totalProductPrice + totalContentPrice;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 sticky top-24">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
        Resumo do pedido
      </h3>
      
      {items.length > 0 ? (
        <div className="mb-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between mb-2">
              <div className="font-bold">
                {item.quantity} x {item.product_url || "Produto"}
              </div>
              <div>
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
          
          <ul className="space-y-2 py-2 text-gray-500 dark:text-gray-400">
            {items.map((item, index) => {
              let nicheText = "";
              if (item.niche_selected && Array.isArray(item.niche_selected) && item.niche_selected.length > 0) {
                nicheText = item.niche_selected[0].niche || "";
              } else if (typeof item.niche === "string") {
                try {
                  const nicheData = JSON.parse(item.niche);
                  if (Array.isArray(nicheData) && nicheData.length > 0) {
                    nicheText = nicheData[0].niche || "";
                  }
                } catch (e) {
                  // If parsing fails, use the niche string directly
                  nicheText = item.niche;
                }
              }
              
              return nicheText ? (
                <li key={`niche-${index}`} className="flex items-center">
                  <svg 
                    className="w-4 h-4 mr-2 text-brand-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{nicheText}</span>
                </li>
              ) : null;
            })}
          </ul>
        </div>
      ) : (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold">
              Carregando itens...
            </div>
          </div>
        </div>
      )}
      
      <div className="my-4 border-t border-b border-t-gray-300 border-b-gray-300 dark:border-t-gray-700 dark:border-b-gray-700 py-4">
        <div className="flex items-center justify-between mb-2">
          <div>Valor</div>
          <div>{formatCurrency(totalProductPrice)}</div>
        </div>
        <div className="flex items-center justify-between">
          <div>Conteúdo</div>
          <div>{formatCurrency(totalContentPrice)}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="font-medium">Total</div>
        <div>
          <span className="font-bold">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}