import { OrderItem } from '../../../../services/db-services/marketplace-services/order/OrderService';
import { getDomainFromUrl } from '../utils/domain.ts';

interface OrderTableRowProps {
  item: OrderItem;
}

export function OrderTableRow({ item }: OrderTableRowProps) {
  return (
    <tr className="recent-orders-table-row">
      {/* Coluna ID */}
      <td className="id-cell text-xs text-gray-500 font-mono" style={{ maxHeight: 'max-content', paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px' }}>
        {item.id?.slice(0, 6)}
      </td>
      {/* Coluna Produto */}
      <td className="product-cell font-medium text-gray-800 text-start text-sm dark:text-white/90" style={{ maxHeight: 'max-content', paddingTop: '12px', paddingBottom: '12px' }}>
        <div className="product-content flex items-center gap-1.5" style={{ maxHeight: 'max-content' }}>
          <span className="product-name truncate text-sm leading-tight">
            {getDomainFromUrl(item.product_url || '')}
          </span>
        </div>
      </td>
      {/* Coluna Status */}
      <td className="status-cell text-xs text-start" style={{ paddingTop: '12px', paddingBottom: '12px', paddingRight: '12px' }}>
        {item.publication_status || 'Indefinido'}
      </td>
    </tr>
  );
}
