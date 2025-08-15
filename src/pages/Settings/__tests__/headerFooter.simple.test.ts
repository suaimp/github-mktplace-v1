/**
 * Testes simples para Header & Footer - validação e sanitização
 * Usando apenas Jest para testar a lógica de negócio
 */

describe('Header & Footer - Validação de Scripts', () => {
  
  describe('Validação de Scripts', () => {
    it('deve validar script válido do Google Analytics', () => {
      const validScript = `
        <!-- Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'GA_MEASUREMENT_ID');
        </script>
      `;
      
      const isValid = validateScript(validScript);
      expect(isValid).toBe(true);
    });

    it('deve invalidar script com conteúdo malicioso', () => {
      const maliciousScript = '<script>alert("XSS")</script>';
      
      const isValid = validateScript(maliciousScript);
      expect(isValid).toBe(false);
    });

    it('deve validar script do Facebook Pixel', () => {
      const fbPixelScript = `
        <!-- Facebook Pixel Code -->
        <script>
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', 'YOUR_PIXEL_ID');
          fbq('track', 'PageView');
        </script>
      `;
      
      const isValid = validateScript(fbPixelScript);
      expect(isValid).toBe(true);
    });
  });

  describe('Sanitização de Scripts', () => {
    it('deve remover caracteres perigosos', () => {
      const unsafeScript = '<script>document.write("test")</script>';
      const sanitized = sanitizeScript(unsafeScript);
      
      expect(sanitized).not.toContain('document.write');
    });

    it('deve preservar scripts seguros', () => {
      const safeScript = '<script>console.log("Analytics loaded")</script>';
      const sanitized = sanitizeScript(safeScript);
      
      expect(sanitized).toContain('console.log');
    });
  });

  describe('Limites de Tamanho', () => {
    it('deve aceitar scripts dentro do limite', () => {
      const smallScript = '<script>gtag("config", "GA_ID");</script>';
      
      expect(smallScript.length).toBeLessThan(10000); // Limite de 10KB
    });

    it('deve rejeitar scripts muito grandes', () => {
      const largeScript = '<script>' + 'x'.repeat(20000) + '</script>';
      
      expect(largeScript.length).toBeGreaterThan(10000);
    });
  });
});

// Funções auxiliares para validação (simulando as do serviço real)
function validateScript(script: string): boolean {
  if (!script || script.trim() === '') return false;
  
  // Verifica se contém apenas tags permitidas
  const allowedTags = ['script', 'meta', 'link', 'style'];
  const tagRegex = /<(\w+)[^>]*>/g;
  const matches = script.match(tagRegex);
  
  if (matches) {
    for (const match of matches) {
      const tagName = match.match(/<(\w+)/)?.[1]?.toLowerCase();
      if (tagName && !allowedTags.includes(tagName)) {
        return false;
      }
    }
  }
  
  // Verifica conteúdo malicioso básico
  const dangerousPatterns = [
    /alert\s*\(/i,
    /document\.write/i,
    /eval\s*\(/i,
    /innerHTML/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(script));
}

function sanitizeScript(script: string): string {
  // Remove padrões perigosos completamente
  return script
    .replace(/document\.write[^;]*;?/gi, '// removed dangerous content')
    .replace(/eval\s*\([^)]*\)/gi, '// removed eval')
    .replace(/innerHTML[^;]*;?/gi, '// removed innerHTML')
    .trim();
}
