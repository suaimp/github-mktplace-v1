import { useState, useCallback } from 'react';
import { ContentProcessor, ProcessedContent } from '../utils/contentProcessor';

export interface UseContractEditorReturn {
  content: string;
  processedContent: ProcessedContent | null;
  setContent: (content: string) => void;
  handlePaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  clearContent: () => void;
}

/**
 * Hook para gerenciar o editor de contratos com processamento automático
 */
export function useContractEditor(initialContent: string = ''): UseContractEditorReturn {
  const [content, setContentState] = useState<string>(initialContent);
  const [processedContent, setProcessedContent] = useState<ProcessedContent | null>(null);

  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Não prevenir o comportamento padrão inicialmente
    
    try {
      const clipboardData = event.clipboardData;
      if (!clipboardData) return;

      // Processar o conteúdo colado
      const processed = ContentProcessor.processClipboardContent(clipboardData);
      
      // Prevenir comportamento padrão apenas se conseguimos processar
      event.preventDefault();
      
      // Atualizar estados diretamente
      setContentState(processed.plainText);
      setProcessedContent(processed);
      
      console.log('Conteúdo processado:', {
        original: clipboardData.getData('text/plain'),
        processed: processed,
        plainText: processed.plainText
      });
      
    } catch (error) {
      console.error('Erro ao processar conteúdo colado:', error);
      // Deixar o comportamento padrão acontecer em caso de erro
    }
  }, []);

  const setContent = useCallback((newContent: string) => {
    setContentState(newContent);
    
    // Se o conteúdo foi alterado manualmente, limpar o conteúdo processado
    if (processedContent && newContent !== processedContent.plainText) {
      setProcessedContent(null);
    }
  }, [processedContent]);

  const clearContent = useCallback(() => {
    setContentState('');
    setProcessedContent(null);
  }, []);

  return {
    content,
    processedContent,
    setContent,
    handlePaste,
    clearContent
  };
}
