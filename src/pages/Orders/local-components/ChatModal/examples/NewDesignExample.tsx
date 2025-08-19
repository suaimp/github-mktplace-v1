/**
 * Exemplo de uso do novo design do Chat Modal
 * Responsabilidade única: Demonstrar como utilizar o novo componente
 */

import { useState } from 'react';
import { NewChatModalWebSocket } from '../components/NewChatModalWebSocket';

export function NewDesignExample() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Dados de exemplo para teste
  const exampleData = {
    orderId: "example-order-123",
    orderItemId: "example-item-456", 
    entryId: "example-entry-789",
    orderItemData: {
      product_name: "Produto Exemplo",
      product_url: "https://example.com"
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Novo Design do Chat Modal</h1>
      
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          Este é um exemplo do novo design do chat modal implementado seguindo os princípios SOLID.
        </p>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Características do novo design:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Layout moderno com bordas arredondadas</li>
            <li>Header com avatar e status de presença</li>
            <li>Mensagens com design diferenciado para envio/recebimento</li>
            <li>Input area com botão de envio estilizado</li>
            <li>Suporte completo a modo escuro</li>
            <li>Estados de loading e erro</li>
            <li>Responsivo e acessível</li>
          </ul>
        </div>
        
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-brand-500 text-white px-6 py-2 rounded-lg hover:bg-brand-600 transition-colors"
        >
          Abrir Chat com Novo Design
        </button>
      </div>

      <NewChatModalWebSocket
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        orderId={exampleData.orderId}
        orderItemId={exampleData.orderItemId}
        entryId={exampleData.entryId}
        orderItemData={exampleData.orderItemData}
      />
    </div>
  );
}

// Componente para comparação lado a lado (opcional)
export function DesignComparison() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const exampleData = {
    orderId: "comparison-order-123",
    orderItemId: "comparison-item-456", 
    entryId: "comparison-entry-789",
    orderItemData: {
      product_name: "Produto Comparação",
      product_url: "https://example.com"
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Comparação de Designs</h1>
      
      <div className="flex gap-4">
        <button
          onClick={() => setShowOld(true)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Design Antigo ({showOld ? 'Aberto' : 'Fechado'})
        </button>
        
        <button
          onClick={() => setShowNew(true)}
          className="bg-brand-500 text-white px-4 py-2 rounded hover:bg-brand-600"
        >
          Novo Design
        </button>
      </div>

      {/* Chat com novo design */}
      <NewChatModalWebSocket
        isOpen={showNew}
        onClose={() => setShowNew(false)}
        orderId={exampleData.orderId}
        orderItemId={exampleData.orderItemId}
        entryId={exampleData.entryId}
        orderItemData={exampleData.orderItemData}
      />
    </div>
  );
}
