import { OrderTableRowProps } from '../interfaces/OrderTableTypes';
import { MultipleUrlsDisplay } from './marketplace-favicon';

export function OrderTableRowNew({ item }: OrderTableRowProps) {
  return (
    <tr className="recent-orders-table-row">
      {/* Coluna ID */}
      <td className="id-cell text-xs text-gray-500 font-mono" style={{ maxHeight: 'max-content', paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px' }}>
        {item.id?.slice(0, 6)}
      </td>
      
      {/* Coluna URL - usando estratégia do marketplace */}
      <td className="product-cell font-medium text-gray-800 text-start text-sm dark:text-white/90" style={{ maxHeight: 'max-content', paddingTop: '12px', paddingBottom: '12px' }}>
        <MultipleUrlsDisplay urls={item.urls} />
      </td>
      
      {/* Coluna Status */}
      <td className="status-cell text-xs text-start text-gray-800 dark:text-white/90" style={{ paddingTop: '12px', paddingBottom: '12px', paddingRight: '12px' }}>
        {item.status || 'Indefinido'}
      </td>
    </tr>
  );
}
