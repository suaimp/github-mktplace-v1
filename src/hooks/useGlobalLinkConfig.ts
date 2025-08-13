import { useEffect } from 'react';

interface UseGlobalLinkConfigOptions {
  enforceNofollow?: boolean;
  excludeInternalLinks?: boolean;
  addSecurityAttributes?: boolean;
}

/**
 * Hook para configurar globalmente os atributos de links no DOM
 * Este hook adiciona automaticamente rel="nofollow" para links externos
 */
export const useGlobalLinkConfig = (options: UseGlobalLinkConfigOptions = {}) => {
  const {
    enforceNofollow = true,
    excludeInternalLinks = true,
    addSecurityAttributes = true,
  } = options;

  useEffect(() => {
    if (!enforceNofollow) return;

    // Função para processar links
    const processLinks = () => {
      const links = document.querySelectorAll('a[href]');
      
      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;

        const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);

        // Se é link externo ou não queremos excluir links internos
        if (isExternal || !excludeInternalLinks) {
          const currentRel = link.getAttribute('rel') || '';
          
          // Só adiciona nofollow se não tiver dofollow explícito
          if (!currentRel.includes('dofollow') && !currentRel.includes('nofollow')) {
            const newRel = currentRel ? `${currentRel} nofollow` : 'nofollow';
            link.setAttribute('rel', newRel.trim());
          }

          // Adiciona atributos de segurança para links que abrem em nova aba
          if (addSecurityAttributes && link.getAttribute('target') === '_blank') {
            const currentRel = link.getAttribute('rel') || '';
            const securityAttrs = ['noopener', 'noreferrer'];
            
            securityAttrs.forEach(attr => {
              if (!currentRel.includes(attr)) {
                const newRel = currentRel ? `${currentRel} ${attr}` : attr;
                link.setAttribute('rel', newRel.trim());
              }
            });
          }
        }
      });
    };

    // Processa links existentes
    processLinks();

    // Observer para processar novos links adicionados dinamicamente
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Se o nó adicionado é um link
              if (element.tagName === 'A') {
                processLinks();
              }
              
              // Se o nó contém links
              if (element.querySelectorAll) {
                const newLinks = element.querySelectorAll('a[href]');
                if (newLinks.length > 0) {
                  processLinks();
                }
              }
            }
          });
        }
      });
    });

    // Observa mudanças no DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [enforceNofollow, excludeInternalLinks, addSecurityAttributes]);
};

export default useGlobalLinkConfig;
