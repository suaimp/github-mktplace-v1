import { useEffect, useCallback } from 'react';
import { HeaderFooterScriptsService } from '../services/db-services/settings-services/headerFooterScriptsService';

/**
 * Hook para injeção dinâmica de scripts de header e footer
 * Segue o princípio de responsabilidade única para injeção de scripts
 */
export const useScriptInjection = () => {
  /**
   * Injeta scripts no head do documento de forma segura
   */
  const injectHeaderScripts = useCallback((scripts: string): void => {
    if (!scripts || scripts.trim() === '') return;

    try {
      // Remove scripts anteriores injetados dinamicamente
      const existingScripts = document.querySelectorAll('[data-dynamic-header="true"]');
      existingScripts.forEach(script => script.remove());

      // Sanitiza os scripts
      const sanitizedScripts = HeaderFooterScriptsService.sanitizeScript(scripts);

      // Cria um container temporário para parseamento seguro
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = sanitizedScripts;

      // Processa cada script encontrado
      const scriptElements = tempContainer.querySelectorAll('script');
      const metaElements = tempContainer.querySelectorAll('meta');
      const linkElements = tempContainer.querySelectorAll('link');
      const styleElements = tempContainer.querySelectorAll('style');

      // Injeta scripts
      scriptElements.forEach(originalScript => {
        const newScript = document.createElement('script');
        newScript.setAttribute('data-dynamic-header', 'true');
        
        // Copia atributos
        Array.from(originalScript.attributes).forEach(attr => {
          if (attr.name !== 'data-dynamic-header') {
            newScript.setAttribute(attr.name, attr.value);
          }
        });

        // Copia conteúdo se for script inline
        if (originalScript.textContent) {
          newScript.textContent = originalScript.textContent;
        }

        document.head.appendChild(newScript);
      });

      // Injeta meta tags
      metaElements.forEach(originalMeta => {
        const newMeta = document.createElement('meta');
        newMeta.setAttribute('data-dynamic-header', 'true');
        
        Array.from(originalMeta.attributes).forEach(attr => {
          if (attr.name !== 'data-dynamic-header') {
            newMeta.setAttribute(attr.name, attr.value);
          }
        });

        document.head.appendChild(newMeta);
      });

      // Injeta links (CSS, favicons, etc.)
      linkElements.forEach(originalLink => {
        const newLink = document.createElement('link');
        newLink.setAttribute('data-dynamic-header', 'true');
        
        Array.from(originalLink.attributes).forEach(attr => {
          if (attr.name !== 'data-dynamic-header') {
            newLink.setAttribute(attr.name, attr.value);
          }
        });

        document.head.appendChild(newLink);
      });

      // Injeta estilos
      styleElements.forEach(originalStyle => {
        const newStyle = document.createElement('style');
        newStyle.setAttribute('data-dynamic-header', 'true');
        newStyle.textContent = originalStyle.textContent;

        document.head.appendChild(newStyle);
      });

      console.log('✅ Scripts de header injetados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao injetar scripts de header:', error);
    }
  }, []);

  /**
   * Injeta scripts no final do body de forma segura
   */
  const injectFooterScripts = useCallback((scripts: string): void => {
    if (!scripts || scripts.trim() === '') return;

    try {
      // Remove scripts anteriores injetados dinamicamente
      const existingScripts = document.querySelectorAll('[data-dynamic-footer="true"]');
      existingScripts.forEach(script => script.remove());

      // Sanitiza os scripts
      const sanitizedScripts = HeaderFooterScriptsService.sanitizeScript(scripts);

      // Cria um container temporário para parseamento seguro
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = sanitizedScripts;

      // Processa cada script encontrado
      const scriptElements = tempContainer.querySelectorAll('script');

      scriptElements.forEach(originalScript => {
        const newScript = document.createElement('script');
        newScript.setAttribute('data-dynamic-footer', 'true');
        
        // Copia atributos
        Array.from(originalScript.attributes).forEach(attr => {
          if (attr.name !== 'data-dynamic-footer') {
            newScript.setAttribute(attr.name, attr.value);
          }
        });

        // Copia conteúdo se for script inline
        if (originalScript.textContent) {
          newScript.textContent = originalScript.textContent;
        }

        document.body.appendChild(newScript);
      });

      // Processa outros elementos HTML que podem ir no footer
      const otherElements = tempContainer.querySelectorAll('div, span, img, iframe');
      otherElements.forEach(originalElement => {
        const newElement = originalElement.cloneNode(true) as Element;
        newElement.setAttribute('data-dynamic-footer', 'true');
        document.body.appendChild(newElement);
      });

      console.log('✅ Scripts de footer injetados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao injetar scripts de footer:', error);
    }
  }, []);

  /**
   * Carrega e injeta scripts do banco de dados
   */
  const loadAndInjectScripts = useCallback(async (): Promise<void> => {
    try {
      const scripts = await HeaderFooterScriptsService.getHeaderFooterScripts();
      
      if (scripts) {
        if (scripts.header_scripts) {
          injectHeaderScripts(scripts.header_scripts);
        }
        
        if (scripts.footer_scripts) {
          injectFooterScripts(scripts.footer_scripts);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar scripts para injeção:', error);
    }
  }, [injectHeaderScripts, injectFooterScripts]);

  /**
   * Remove todos os scripts injetados dinamicamente
   */
  const removeInjectedScripts = useCallback((): void => {
    const headerScripts = document.querySelectorAll('[data-dynamic-header="true"]');
    const footerScripts = document.querySelectorAll('[data-dynamic-footer="true"]');
    
    headerScripts.forEach(script => script.remove());
    footerScripts.forEach(script => script.remove());
    
    console.log('🧹 Scripts dinâmicos removidos');
  }, []);

  // Injeta scripts na inicialização
  useEffect(() => {
    // Aguarda um pequeno delay para garantir que o DOM esteja totalmente carregado
    const timer = setTimeout(() => {
      loadAndInjectScripts();
    }, 100);

    // Cleanup ao desmontar
    return () => {
      clearTimeout(timer);
      removeInjectedScripts();
    };
  }, [loadAndInjectScripts, removeInjectedScripts]);

  return {
    injectHeaderScripts,
    injectFooterScripts,
    loadAndInjectScripts,
    removeInjectedScripts,
  };
};
