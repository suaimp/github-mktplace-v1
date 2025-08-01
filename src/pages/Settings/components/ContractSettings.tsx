import { TabNavigation, useTabNavigation } from '../../../components/tables/TabNavigation';
import { Tab } from '../../../components/tables/TabNavigation/types';
import ContractTabContent from './ContractTabContent';

const contractTabs: Tab[] = [
  { id: 'terms', label: 'Termos e Condições' },
  { id: 'contract_pf', label: 'Contrato PF' },
  { id: 'contract_cnpj', label: 'Contrato CNPJ' },
];

export default function ContractSettings() {
  const { activeTabId, handleTabChange } = useTabNavigation(contractTabs);

  const renderTabContent = () => {
    switch (activeTabId) {
      case 'terms':
        return <ContractTabContent contractType="terms" />;
      case 'contract_pf':
        return <ContractTabContent contractType="contract_pf" />;
      case 'contract_cnpj':
        return <ContractTabContent contractType="contract_cnpj" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Tab Navigation */}
      <div className="mb-6">
        <TabNavigation
          tabs={contractTabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
        />
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}
