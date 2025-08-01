import { useState } from 'react';
import TabNavigation from '../../components/tables/TabNavigation/components/TabNavigation';
import EnhancedContractEditor from './contracts/components/EnhancedContractEditor';
import { LegacyContractType } from './contracts/types';
import { Tab } from '../../components/tables/TabNavigation/types';

/**
 * Configurações de contratos com 4 abas: Termos e Condições, Contrato PF, Contrato CNPJ, Política de Privacidade
 * Atualizado para usar EnhancedContractEditor com integração ao banco de dados
 */
export default function ContractSettings() {
  const [activeTab, setActiveTab] = useState<LegacyContractType>('terms');

  // Definição das abas
  const tabs: Tab[] = [
    {
      id: 'terms',
      label: 'Termos e Condições'
    },
    {
      id: 'contract_pf',
      label: 'Contrato PF'
    },
    {
      id: 'contract_cnpj',
      label: 'Contrato CNPJ'
    },
    {
      id: 'privacy_policy',
      label: 'Política de Privacidade'
    }
  ];

  // Configuração de títulos para cada aba
  const tabTitles: Record<LegacyContractType, string> = {
    terms: 'Termos e Condições',
    contract_pf: 'Contrato para Pessoa Física',
    contract_cnpj: 'Contrato para Pessoa Jurídica (CNPJ)',
    privacy_policy: 'Política de Privacidade'
  };

  const handleTabChange = (tabId: string) => {
    console.log('🔄 [ContractSettings] Mudando aba para:', tabId);
    setActiveTab(tabId as LegacyContractType);
  };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Navegação por abas */}
      <div className="w-full max-w-md">
        <TabNavigation
          tabs={tabs}
          activeTabId={activeTab}
          onTabChange={handleTabChange}
          className="w-full"
        />
      </div>

      {/* Conteúdo da aba ativa */}
      <div className="mt-6">
        <EnhancedContractEditor
          type={activeTab}
          title={tabTitles[activeTab]}
          key={activeTab} // Force re-mount when tab changes to load correct contract
        />
      </div>
    </div>
  );
}
