import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderWithUrls } from '../db-service/ordersTableService';
import { NonClickableUrlsDisplay } from './marketplace-favicon';
import { getTranslatedStatus } from '../utils/statusTranslation';

interface OrderTableRowUpdatedProps {
  order: OrderWithUrls;
}

export const OrderTableRowUpdated: React.FC<OrderTableRowUpdatedProps> = ({ order }) => {
  const navigate = useNavigate();

  const handleRowClick = () => {
    if (order.id) {
      navigate(`/orders/${order.id}`);
    }
  };

  return (
    <tr 
      className="recent-orders-table-row cursor-pointer transition-all duration-200 ease-in-out hover:shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRowClick();
        }
      }}
    >
      {/* Coluna ID */}
      <td className="id-cell text-xs text-gray-500 font-mono" style={{ maxHeight: 'max-content', paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px' }}>
        {order.id?.slice(0, 6)}
      </td>

      {/* Coluna URLs com Favicons - não clicável */}
      <td 
        className="url-cell" 
        style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px' }}
      >
        <NonClickableUrlsDisplay urls={order.urls} />
      </td>

      {/* Coluna Status */}
      <td className="status-cell text-xs text-gray-800 dark:text-white/90" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px' }}>
        {getTranslatedStatus(order.status || 'Indefinido')}
      </td>
    </tr>
  );
};
