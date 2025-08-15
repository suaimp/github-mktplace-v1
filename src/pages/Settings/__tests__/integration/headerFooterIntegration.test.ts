/**
 * Testes de integração para funcionalidade Header & Footer
 * Testa fluxo completo sem dependências externas
 */

import { HeaderFooterScriptsService } from '../../../../services/db-services/settings-services/headerFooterScriptsService';

describe('Header & Footer Integration Tests', () => {
  describe('Fluxo completo de validação', () => {
    it('deve processar scripts válidos do Google Analytics', () => {
      const googleAnalyticsScript = `
        <!-- Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'GA_TRACKING_ID');
        </script>
      `;

      const scripts = {
        header_scripts: googleAnalyticsScript,
        footer_scripts: '',
      };

      // Validação
      const validation = HeaderFooterScriptsService.validateScripts(scripts);
      expect(validation.isValid).toBe(true);

      // Sanitização
      const sanitized = HeaderFooterScriptsService.sanitizeScript(googleAnalyticsScript);
      expect(sanitized).not.toContain('<!--');
      expect(sanitized).toContain('gtag');

      // Formato válido
      const isValidFormat = HeaderFooterScriptsService.isValidScriptFormat(sanitized);
      expect(isValidFormat).toBe(true);
    });

    it('deve rejeitar scripts maliciosos', () => {
      const maliciousScript = `
        <script>
          document.write('<script src="http://evil.com/malware.js"></script>');
          eval('malicious code');
        </script>
      `;

      const scripts = {
        header_scripts: maliciousScript,
        footer_scripts: '',
      };

      const validation = HeaderFooterScriptsService.validateScripts(scripts);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.header_scripts).toContain('padrões potencialmente perigosos');
    });

    it('deve processar múltiplos tipos de tags', () => {
      const complexScript = `
        <meta name="description" content="Teste">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto">
        <script async src="https://www.googletagmanager.com/gtag/js"></script>
        <script>
          gtag('config', 'GA_TRACKING_ID');
        </script>
        <style>
          .custom-analytics { display: none; }
        </style>
      `;

      const scripts = {
        header_scripts: complexScript,
        footer_scripts: '',
      };

      const validation = HeaderFooterScriptsService.validateScripts(scripts);
      expect(validation.isValid).toBe(true);

      const isValidFormat = HeaderFooterScriptsService.isValidScriptFormat(complexScript);
      expect(isValidFormat).toBe(true);
    });
  });

  describe('Cenários de uso real', () => {
    it('deve suportar Facebook Pixel', () => {
      const facebookPixel = `
        <script>
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', 'PIXEL_ID');
          fbq('track', 'PageView');
        </script>
      `;

      const scripts = {
        header_scripts: facebookPixel,
        footer_scripts: '',
      };

      const validation = HeaderFooterScriptsService.validateScripts(scripts);
      expect(validation.isValid).toBe(true);

      const isValidFormat = HeaderFooterScriptsService.isValidScriptFormat(facebookPixel);
      expect(isValidFormat).toBe(true);
    });

    it('deve suportar Hotjar', () => {
      const hotjarScript = `
        <script>
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:1234567,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        </script>
      `;

      const scripts = {
        header_scripts: '',
        footer_scripts: hotjarScript,
      };

      const validation = HeaderFooterScriptsService.validateScripts(scripts);
      expect(validation.isValid).toBe(true);
    });

    it('deve suportar chat widgets', () => {
      const chatWidget = `
        <script>
          window.chatSettings = {
            apiKey: 'test-key',
            position: 'bottom-right'
          };
        </script>
        <script src="https://widget.chat.com/widget.js" async></script>
      `;

      const scripts = {
        header_scripts: '',
        footer_scripts: chatWidget,
      };

      const validation = HeaderFooterScriptsService.validateScripts(scripts);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Limites e edge cases', () => {
    it('deve rejeitar scripts muito grandes', () => {
      const largeScript = '<script>' + 'x'.repeat(15000) + '</script>';

      const scripts = {
        header_scripts: largeScript,
        footer_scripts: '',
      };

      const validation = HeaderFooterScriptsService.validateScripts(scripts);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.header_scripts).toContain('não podem exceder 10.000 caracteres');
    });

    it('deve aceitar scripts no limite', () => {
      const limitScript = '<script>' + 'x'.repeat(9950) + '</script>';

      const scripts = {
        header_scripts: limitScript,
        footer_scripts: '',
      };

      const validation = HeaderFooterScriptsService.validateScripts(scripts);
      expect(validation.isValid).toBe(true);
    });

    it('deve aceitar strings vazias', () => {
      const scripts = {
        header_scripts: '',
        footer_scripts: '   ',
      };

      const validation = HeaderFooterScriptsService.validateScripts(scripts);
      expect(validation.isValid).toBe(true);
    });

    it('deve aceitar apenas um campo preenchido', () => {
      const scripts = {
        header_scripts: '<script>gtag("config", "GA_ID");</script>',
        footer_scripts: '',
      };

      const validation = HeaderFooterScriptsService.validateScripts(scripts);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Sanitização avançada', () => {
    it('deve remover comentários preservando código', () => {
      const scriptWithComments = `
        <!-- Google Analytics Start -->
        <script>
          gtag('config', 'GA_ID');
        </script>
        <!-- Google Analytics End -->
        <meta name="description" content="test">
      `;

      const sanitized = HeaderFooterScriptsService.sanitizeScript(scriptWithComments);
      
      expect(sanitized).not.toContain('<!-- Google Analytics Start -->');
      expect(sanitized).not.toContain('<!-- Google Analytics End -->');
      expect(sanitized).toContain('gtag(\'config\', \'GA_ID\');');
      expect(sanitized).toContain('<meta name="description"');
    });

    it('deve preservar formatação de código', () => {
      const formattedScript = `
        <script>
          function trackEvent() {
            gtag('event', 'click', {
              event_category: 'Button',
              event_label: 'Header'
            });
          }
        </script>
      `;

      const sanitized = HeaderFooterScriptsService.sanitizeScript(formattedScript);
      
      expect(sanitized).toContain('function trackEvent()');
      expect(sanitized).toContain('event_category: \'Button\'');
    });
  });
});
