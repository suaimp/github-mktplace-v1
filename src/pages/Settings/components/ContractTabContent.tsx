import { ContractTabContentProps } from '../types';

const contractLabels = {
  terms: 'Termos e Condições',
  contract_pf: 'Contrato Pessoa Física',
  contract_cnpj: 'Contrato Pessoa Jurídica',
};

const contractDescriptions = {
  terms: 'Configure os termos e condições da sua plataforma.',
  contract_pf: 'Configure o contrato para pessoas físicas.',
  contract_cnpj: 'Configure o contrato para pessoas jurídicas (CNPJ).',
};

export default function ContractTabContent({ contractType }: ContractTabContentProps) {
  const label = contractLabels[contractType];
  const description = contractDescriptions[contractType];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            {label}
          </h4>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        {/* Future: Add edit button */}
        {/* <button 
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700"
        >
          {isEditing ? 'Cancelar' : 'Editar'}
        </button> */}
      </div>

      {/* Content area - will be developed later */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {label}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Este módulo está em desenvolvimento.
          </p>
          <div className="text-sm text-gray-400">
            Funcionalidades futuras:
            <ul className="mt-2 space-y-1">
              <li>• Editor de texto rico</li>
              <li>• Versionamento de contratos</li>
              <li>• Histórico de alterações</li>
              <li>• Status ativo/inativo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
