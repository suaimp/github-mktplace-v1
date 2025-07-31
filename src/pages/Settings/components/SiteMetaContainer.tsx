import { useSiteMeta } from '../hooks/useSiteMeta';
import SiteMetaForm from './SiteMetaForm';
import { SiteMetaFormData } from '../types';

interface SiteMetaContainerProps {
  onDataChange?: (data: SiteMetaFormData) => void;
  hideSubmitButton?: boolean;
  externalLoading?: boolean;
}

export default function SiteMetaContainer({ 
  onDataChange,
  hideSubmitButton = false,
  externalLoading = false
}: SiteMetaContainerProps = {}) {
  const { metaData, loading, error, success, updateMetaData } = useSiteMeta();

  const handleSubmit = async (data: SiteMetaFormData) => {
    if (!hideSubmitButton) {
      await updateMetaData(data);
    }
  };

  const handleFormChange = (data: SiteMetaFormData) => {
    if (onDataChange) {
      onDataChange(data);
    }
  };

  const displayLoading = hideSubmitButton ? externalLoading : loading;
  const displayError = hideSubmitButton ? null : error;
  const displaySuccess = hideSubmitButton ? false : success;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-2">
          Metadados do Site
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure o título e descrição que aparecerão nos resultados de busca e redes sociais.
        </p>
      </div>

      {displayError && (
        <div className="p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
          {displayError}
        </div>
      )}

      {displaySuccess && (
        <div className="p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
          Configurações salvas com sucesso!
        </div>
      )}

      <SiteMetaForm
        initialData={metaData}
        onSubmit={handleSubmit}
        onChange={handleFormChange}
        loading={displayLoading}
        hideSubmitButton={hideSubmitButton}
      />
    </div>
  );
}
