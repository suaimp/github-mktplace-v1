import React from 'react';
import Button from '../../../components/ui/button/Button';
import Label from '../../../components/form/Label';
import { useHeaderFooterScripts } from '../hooks/useHeaderFooterScripts';
import { useHeaderFooterToast } from '../hooks/useHeaderFooterToast';
import { HeaderFooterSettingsProps } from '../types/headerFooterTypes';

/**
 * Componente para configurações de Header e Footer Scripts
 * Segue o princípio de responsabilidade única
 */
const HeaderFooterSettings: React.FC<HeaderFooterSettingsProps> = ({
  onSave,
  onError,
}) => {
  const {
    formState,
    validationErrors,
    updateField,
    saveScripts,
    clearStatus,
  } = useHeaderFooterScripts();

  const {
    toast,
    showSuccessToast,
    showErrorToast,
    hideToast,
  } = useHeaderFooterToast();

  /**
   * Manipula o envio do formulário
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    const result = await saveScripts();
    
    if (result.success) {
      showSuccessToast(result.message);
      onSave?.();
    } else {
      showErrorToast(result.message);
      onError?.(result.message);
    }
  };

  /**
   * Manipula mudanças nos campos de texto
   */
  const handleInputChange = (field: 'header_scripts' | 'footer_scripts') => 
    (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      updateField(field, e.target.value);
    };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Toast Personalizado */}
      {toast.show && (
        <div className={`p-4 rounded-lg border flex items-center justify-between ${
          toast.type === 'success' 
            ? 'bg-success-50 border-success-200 text-success-800 dark:bg-success-500/15 dark:border-success-800 dark:text-success-400'
            : toast.type === 'error'
            ? 'bg-error-50 border-error-200 text-error-800 dark:bg-error-500/15 dark:border-error-800 dark:text-error-400'
            : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/15 dark:border-amber-800 dark:text-amber-400'
        }`}>
          <span className="text-sm font-medium">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : '⚠️'} {toast.message}
          </span>
          <button
            onClick={hideToast}
            className="ml-4 text-current hover:opacity-70 transition-opacity"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mensagens de Status Alternativas */}
        {formState.error && !toast.show && (
          <div className="mb-6 p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
            {formState.error}
          </div>
        )}

        {formState.success && !toast.show && (
          <div className="mb-6 p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
            Scripts de Header e Footer salvos com sucesso!
          </div>
        )}

      {/* Seção Header Scripts */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="header_scripts" className="text-base font-semibold">
            Scripts dentro do &lt;head&gt;
          </Label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Códigos que serão inseridos na seção &lt;head&gt; do HTML. 
            Ideal para Google Analytics, Google Tag Manager, Meta tags personalizadas, etc.
          </p>
        </div>
        
        <div className="space-y-2">
          <textarea
            id="header_scripts"
            name="header_scripts"
            value={formState.header_scripts}
            onChange={handleInputChange('header_scripts')}
            placeholder="<!-- Exemplo: Google Analytics -->
<script async src='https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID'></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>"
            className={`w-full h-40 px-3 py-2 border rounded-lg font-mono text-sm 
              dark:bg-gray-800 dark:border-gray-700 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
              ${validationErrors.header_scripts 
                ? 'border-error-500 focus:ring-error-500' 
                : 'border-gray-300'
              }`}
            disabled={formState.loading}
          />
          
          {validationErrors.header_scripts && (
            <p className="text-sm text-error-600 dark:text-error-400">
              {validationErrors.header_scripts}
            </p>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Caracteres: {formState.header_scripts.length}/10.000
          </p>
        </div>
      </div>

      {/* Seção Footer Scripts */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="footer_scripts" className="text-base font-semibold">
            Scripts antes do &lt;/body&gt;
          </Label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Códigos que serão inseridos antes do fechamento do &lt;/body&gt;. 
            Ideal para Chat widgets, scripts de remarketing, códigos de conversão, etc.
          </p>
        </div>
        
        <div className="space-y-2">
          <textarea
            id="footer_scripts"
            name="footer_scripts"
            value={formState.footer_scripts}
            onChange={handleInputChange('footer_scripts')}
            placeholder="<!-- Exemplo: Chat Widget -->
<script>
  // Código do chat widget
  (function() {
    var widget = document.createElement('script');
    widget.src = 'https://widget.chat.com/widget.js';
    document.body.appendChild(widget);
  })();
</script>"
            className={`w-full h-40 px-3 py-2 border rounded-lg font-mono text-sm 
              dark:bg-gray-800 dark:border-gray-700 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
              ${validationErrors.footer_scripts 
                ? 'border-error-500 focus:ring-error-500' 
                : 'border-gray-300'
              }`}
            disabled={formState.loading}
          />
          
          {validationErrors.footer_scripts && (
            <p className="text-sm text-error-600 dark:text-error-400">
              {validationErrors.footer_scripts}
            </p>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Caracteres: {formState.footer_scripts.length}/10.000
          </p>
        </div>
      </div>

      {/* Avisos de Segurança */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
          ⚠️ Avisos de Segurança
        </h4>
        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
          <li>• Apenas administradores podem modificar estes scripts</li>
          <li>• Verifique sempre a procedência dos códigos antes de inserir</li>
          <li>• Scripts maliciosos podem comprometer a segurança do sistema</li>
          <li>• Teste em ambiente de desenvolvimento antes de aplicar em produção</li>
        </ul>
      </div>

        {/* Botões de Ação */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={formState.loading}
            className="px-5 py-3.5 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {formState.loading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
          
          <Button
            variant="outline"
            onClick={clearStatus}
            disabled={formState.loading}
          >
            Limpar Status
          </Button>
        </div>
      </form>
    </div>
  );
};

export default HeaderFooterSettings;
