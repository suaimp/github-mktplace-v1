/**
 * Test page demonstrating the enhanced contract editor with database integration
 * Shows how to use the new contract system with real database operations
 */

import { useState } from 'react';
import EnhancedContractEditor from './components/EnhancedContractEditor';

const CONTRACT_TYPES = [
  { value: 'terms' as const, label: 'Termos e Condições' },
  { value: 'contract_pf' as const, label: 'Contrato Pessoa Física' },
  { value: 'contract_cnpj' as const, label: 'Contrato Pessoa Jurídica' }
] as const;

type ContractTypeValue = typeof CONTRACT_TYPES[number]['value'];

export default function ContractEditorTestPage() {
  const [selectedType, setSelectedType] = useState<ContractTypeValue>('terms');

  const selectedContract = CONTRACT_TYPES.find(type => type.value === selectedType);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Editor de Contratos - Teste
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sistema integrado com banco de dados - Suporte apenas para administradores
          </p>
        </div>

        {/* Contract Type Selector */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Selecionar Tipo de Contrato
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CONTRACT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedType === type.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="text-sm font-medium">{type.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {type.value}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Contract Editor */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <EnhancedContractEditor
            type={selectedType}
            title={selectedContract?.label || 'Contrato'}
            onSave={(content) => {
              console.log('Legacy callback called with content:', content.slice(0, 100) + '...');
            }}
          />
        </div>

        {/* Info Panel */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Funcionalidades do Sistema
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-disc pl-5 space-y-1">
                  <li>✅ Autenticação automática de usuários administradores</li>
                  <li>✅ Salvamento automático de contratos no banco de dados</li>
                  <li>✅ Carregamento de contratos existentes por admin e tipo</li>
                  <li>✅ Validação de permissões (apenas admins podem editar)</li>
                  <li>✅ Editor de texto rico com Tiptap</li>
                  <li>✅ Tratamento de erros e estados de loading</li>
                  <li>✅ Interface responsiva com suporte a dark mode</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Detalhes Técnicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Banco de Dados</h4>
              <ul className="mt-1 space-y-1">
                <li>• Tabela: contracts</li>
                <li>• RLS: Admin-only access</li>
                <li>• Foreign Key: admins.id</li>
                <li>• Unique constraint: admin_id + contract_type</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Arquitetura</h4>
              <ul className="mt-1 space-y-1">
                <li>• Service Layer: contractDbService.ts</li>
                <li>• Hook: useContracts.ts</li>
                <li>• Types: contract.types.ts</li>
                <li>• Component: EnhancedContractEditor.tsx</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
