import { OrderItem } from '../../../../services/db-services/marketplace-services/order/OrderService';
import { getFaviconUrl } from '../../../form/utils/formatters';

interface OrderTableRowProps {
  item: OrderItem;
}

export function OrderTableRow({ item }: OrderTableRowProps) {
  return (
    <tr className="recent-orders-table-row h-8">
      <td className="product-cell font-medium text-gray-800 text-start text-sm dark:text-white/90">
        <div className="product-content flex items-center gap-1.5 h-full">
          <img 
            src={getFaviconUrl(item.product_url || '')} 
            alt="favicon" 
            className="favicon-image w-4 h-4 rounded flex-shrink-0" 
            onError={e => (e.currentTarget.style.display = 'none')} 
          />
          <span className="product-name truncate text-sm leading-tight">{item.product_name}</span>
        </div>
      </td>
      <td className="price-cell text-sm text-start text-success-600">
        <div className="price-content flex items-center h-full">
          <span className="text-sm leading-tight">
            {item.total_price?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
      </td>
    </tr>
  );
}
