import { InfoTooltipOptimized } from '../components/ui/InfoTooltip';

export default function TooltipDemo() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Demonstração de Tooltip Otimizado</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Comparação de Tooltips</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span>Tooltip Otimizado (só renderiza quando visível):</span>
            <InfoTooltipOptimized text="Este tooltip só é renderizado no DOM quando você passa o mouse sobre o ícone" />
          </div>
          
          <div className="border border-gray-200 p-4 rounded">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Benefícios da versão otimizada:</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Não reserva espaço invisible na tela</li>
              <li>• Melhor performance com muitos tooltips</li>
              <li>• Reduz o tamanho do DOM</li>
              <li>• Melhora a acessibilidade</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-3">Simulação de Tabela com Tooltips</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Produto
                    <InfoTooltipOptimized text="Nome do produto ou serviço" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Status
                    <InfoTooltipOptimized text="Status atual do pedido" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    URL do Artigo
                    <InfoTooltipOptimized text="A URL fica disponível após a publicação do artigo em um prazo de 3 a 5 dias" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Artigo exemplo.com
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Processando
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Aguardando publicação
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Post blog.com
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Publicado
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  https://blog.com/artigo
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <p><strong>Como testar:</strong></p>
        <p>1. Abra as ferramentas de desenvolvedor (F12)</p>
        <p>2. Vá para a aba Elements/DOM</p>
        <p>3. Passe o mouse sobre os ícones de tooltip</p>
        <p>4. Observe que os elementos de tooltip só aparecem no DOM quando estão visíveis</p>
      </div>
    </div>
  );
}
