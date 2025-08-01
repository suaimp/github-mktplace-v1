import { useState, useEffect } from 'react';
import { ContractEditorProps } from '../types';
import Button from '../../../../components/ui/button/Button';
import TiptapEditor from './TiptapEditor';

/**
 * Componente editor de contratos usando Tiptap - suporte nativo ao Google Docs
 */
export default function ContractEditor({
  type: _type,
  title,
  initialContent = '',
  onSave,
  loading = false
}: ContractEditorProps) {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [content, setContent] = useState<string>(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleContentChange = (html: string) => {
    setContent(html);
  };

  const handleSave = async () => {
    if (!content.trim() || content === '<p></p>') {
      alert('Por favor, insira algum conteúdo antes de salvar.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(content);
      alert('Contrato salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar contrato. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearContent = () => {
    setContent('');
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Cabeçalho */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>

      {/* Editor Tiptap */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            {content && content !== '<p></p>' && (
              <button
                type="button"
                onClick={handleClearContent}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-auto"
              >
                Limpar conteúdo
              </button>
            )}
          </div>
          
          <TiptapEditor
            content={content}
            onChange={handleContentChange}
            placeholder="Cole aqui o texto do seu contrato..."
            disabled={loading || isSaving}
          />
        </div>

        {/* Botão de salvar */}
        <div className="flex justify-end gap-3 pt-4">
          {content && content !== '<p></p>' && (
            <button
              type="button"
              onClick={handleClearContent}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 transition duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              disabled={loading || isSaving}
            >
              Limpar
            </button>
          )}
          <Button
            onClick={handleSave}
            disabled={loading || isSaving || !content.trim() || content === '<p></p>'}
            className="min-w-32"
          >
            {isSaving ? 'Salvando...' : 'Salvar Contrato'}
          </Button>
        </div>
      </div>
    </div>
  );
}
