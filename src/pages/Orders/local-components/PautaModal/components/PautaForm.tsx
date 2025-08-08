/**
 * Formulário para envio de pauta
 */

import { PautaInputField } from './PautaInputField';
import { PautaTextareaField } from './PautaTextareaField';
import { usePautaForm } from '../hooks/usePautaForm';
import { PautaFormData } from '../types';

interface PautaFormProps {
  onSubmit: (data: PautaFormData) => Promise<void>;
  loading?: boolean;
  onCancel: () => void;
}

export function PautaForm({ onSubmit, loading = false, onCancel }: PautaFormProps) {
  const {
    formData,
    errors,
    updateField,
    touchField,
    validateForm,
    shouldShowError
  } = usePautaForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PautaInputField
        label="Palavra-chave alvo para criar o artigo"
        description="Qual é a palavra-chave alvo ou o tópico do artigo que você deseja classificar?"
        value={formData.palavraChave}
        onChange={(value) => updateField('palavraChave', value)}
        onBlur={() => touchField('palavraChave')}
        error={shouldShowError('palavraChave') ? errors.palavraChave : undefined}
        required
        placeholder="Ex: marketing digital, SEO, vendas online..."
      />

      <PautaInputField
        label="URL do Site"
        description="Insira a URL que você deseja incluir no seu conteúdo."
        value={formData.urlSite}
        onChange={(value) => updateField('urlSite', value)}
        onBlur={() => touchField('urlSite')}
        error={shouldShowError('urlSite') ? errors.urlSite : undefined}
        required
        type="url"
        placeholder="https://exemplo.com"
      />

      <PautaInputField
        label="Texto âncora"
        description="Insira o texto âncora que você deseja inserir no link de saída do seu conteúdo."
        value={formData.textoAncora}
        onChange={(value) => updateField('textoAncora', value)}
        onBlur={() => touchField('textoAncora')}
        error={shouldShowError('textoAncora') ? errors.textoAncora : undefined}
        required
        placeholder="Ex: clique aqui, saiba mais, confira nossos serviços..."
      />

      <PautaTextareaField
        label="Requisitos especiais"
        description="Se necessário, você pode escrever requisitos de tarefas adicionais aqui, por exemplo, link de artigos de referência, necessidade de divulgação, preferências quanto ao posicionamento do conteúdo, etc."
        value={formData.requisitosEspeciais}
        onChange={(value) => updateField('requisitosEspeciais', value)}
        onBlur={() => touchField('requisitosEspeciais')}
        error={shouldShowError('requisitosEspeciais') ? errors.requisitosEspeciais : undefined}
        required
        placeholder="Descreva aqui requisitos específicos, links de referência, preferências de posicionamento, etc..."
        rows={5}
      />

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand-500 border border-transparent rounded-md hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          Enviar Pauta
        </button>
      </div>
    </form>
  );
}
