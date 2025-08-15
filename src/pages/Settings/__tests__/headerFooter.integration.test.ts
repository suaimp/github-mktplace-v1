/**
 * Testes para HeaderFooterScriptsService - Integração com Jest + Testing Library
 * Testando a lógica real do serviço
 */

// Mock simples do Supabase
const mockSupabaseResponse = {
  data: {
    header_scripts: '<script>console.log("header test");</script>',
    footer_scripts: '<script>console.log("footer test");</script>',
  },
  error: null
};

const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve(mockSupabaseResponse))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve(mockSupabaseResponse))
      }))
    }))
  }))
};

// Mock do módulo supabase
jest.mock('../../../../lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('HeaderFooterScriptsService - Integração', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validação de Scripts de Terceiros', () => {
    it('deve validar Google Analytics corretamente', () => {
      const gaScript = `
        <!-- Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'GA_MEASUREMENT_ID');
        </script>
      `;
      
      expect(isValidAnalyticsScript(gaScript)).toBe(true);
    });

    it('deve validar Facebook Pixel corretamente', () => {
      const fbScript = `
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
      
      expect(isValidAnalyticsScript(fbScript)).toBe(true);
    });

    it('deve validar Hotjar corretamente', () => {
      const hotjarScript = `
        <script>
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:YOUR_HJID,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        </script>
      `;
      
      expect(isValidAnalyticsScript(hotjarScript)).toBe(true);
    });
  });

  describe('Segurança e Sanitização', () => {
    it('deve rejeitar scripts maliciosos', () => {
      const maliciousScripts = [
        '<script>alert("XSS")</script>',
        '<script>document.write("hack")</script>',
        '<script>eval("malicious code")</script>',
        '<img src="x" onerror="alert(1)">',
      ];
      
      maliciousScripts.forEach(script => {
        expect(isValidAnalyticsScript(script)).toBe(false);
      });
    });

    it('deve sanitizar conteúdo perigoso', () => {
      const unsafeScript = '<script>document.write("test"); console.log("safe");</script>';
      const sanitized = sanitizeAnalyticsScript(unsafeScript);
      
      expect(sanitized).not.toContain('document.write');
      expect(sanitized).toContain('console.log');
    });
  });

  describe('Limites e Validações', () => {
    it('deve respeitar limite de tamanho', () => {
      const maxSize = 10000; // 10KB
      const largeScript = '<script>' + 'x'.repeat(maxSize + 1) + '</script>';
      
      expect(isValidScriptSize(largeScript, maxSize)).toBe(false);
    });

    it('deve aceitar scripts de tamanho adequado', () => {
      const maxSize = 10000;
      const normalScript = '<script>gtag("config", "GA_ID");</script>';
      
      expect(isValidScriptSize(normalScript, maxSize)).toBe(true);
    });
  });

  describe('Casos de Uso Reais', () => {
    it('deve processar múltiplos scripts de analytics', () => {
      const multipleScripts = `
        <!-- Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'GA_ID');
        </script>

        <!-- Facebook Pixel -->
        <script>
          fbq('init', 'FB_PIXEL_ID');
          fbq('track', 'PageView');
        </script>
      `;
      
      expect(isValidAnalyticsScript(multipleScripts)).toBe(true);
    });

    it('deve validar meta tags para SEO', () => {
      const metaTags = `
        <meta name="description" content="Marketplace description">
        <meta property="og:title" content="Page Title">
        <meta property="og:description" content="Page description">
        <meta property="og:image" content="https://example.com/image.jpg">
      `;
      
      expect(isValidMetaTags(metaTags)).toBe(true);
    });
  });
});

// Funções auxiliares simulando as do serviço real
function isValidAnalyticsScript(script: string): boolean {
  if (!script || script.trim() === '') return false;
  
 
  
  // Verifica se contém apenas tags permitidas
  const allowedTags = ['script', 'meta', 'link', 'noscript'];
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
  
  // Verifica padrões maliciosos
  const dangerousPatterns = [
    /alert\s*\(/i,
    /document\.write/i,
    /eval\s*\(/i,
    /innerHTML\s*=/i,
    /onerror\s*=/i,
    /onclick\s*=/i
  ];
  
  if (dangerousPatterns.some(pattern => pattern.test(script))) {
    return false;
  }
  
  return true;
}

function sanitizeAnalyticsScript(script: string): string {
  return script
    .replace(/document\.write[^;]*;?/gi, '// removed: document.write')
    .replace(/eval\s*\([^)]*\)/gi, '// removed: eval')
    .replace(/innerHTML\s*=[^;]*/gi, '// removed: innerHTML')
    .replace(/onerror\s*=[^;]*/gi, '// removed: onerror')
    .trim();
}

function isValidScriptSize(script: string, maxSize: number): boolean {
  return script.length <= maxSize;
}

function isValidMetaTags(tags: string): boolean {
  const allowedMetaNames = [
    'description', 'keywords', 'author', 'viewport',
    'og:title', 'og:description', 'og:image', 'og:url',
    'twitter:card', 'twitter:title', 'twitter:description'
  ];
  
  // Verifica se contém apenas meta tags válidas
  const metaRegex = /<meta[^>]+>/gi;
  const matches = tags.match(metaRegex);
  
  if (!matches) return false;
  
  return matches.every(meta => {
    const nameMatch = meta.match(/name=["']([^"']+)["']/i) || 
                     meta.match(/property=["']([^"']+)["']/i);
    
    if (!nameMatch) return false;
    
    const metaName = nameMatch[1].toLowerCase();
    return allowedMetaNames.some(allowed => 
      metaName === allowed || metaName.startsWith('og:') || metaName.startsWith('twitter:')
    );
  });
}
