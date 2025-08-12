/**
 * Testes unitários para EmailTemplateService
 * Responsabilidade: Testar a geração correta de templates HTML
 */

import { EmailTemplateService } from '../../templates';
import {
  mockPautaEmailData,
  mockArticleDocEmailData,
  mockArticleLinkEmailData,
  mockArticleUrlEmailData
} from '../../../../__tests__/mocks/data/notificationData.mock';

describe('EmailTemplateService', () => {
  describe('generatePautaTemplate', () => {
    it('deve gerar template para cliente com mensagem correta', () => {
      // Act
      const result = EmailTemplateService.generatePautaTemplate(mockPautaEmailData, false);

      // Assert
      expect(result.subject).toBe('Nova Pauta Enviada');
      expect(result.html).toContain('Por favor, aguarde a produção do artigo.');
      expect(result.html).not.toContain('Por favor, revise a pauta e proceda com a produção do artigo.');
      expect(result.html).toContain(mockPautaEmailData.userName);
      expect(result.html).toContain(mockPautaEmailData.shortOrderId);
      expect(result.html).toContain(mockPautaEmailData.pautaData.palavraChave);
    });

    it('deve gerar template para admin com mensagem correta', () => {
      // Act
      const result = EmailTemplateService.generatePautaTemplate(mockPautaEmailData, true);

      // Assert
      expect(result.subject).toBe('Nova Pauta Enviada');
      expect(result.html).toContain('Por favor, revise a pauta e proceda com a produção do artigo.');
      expect(result.html).not.toContain('Por favor, aguarde a produção do artigo.');
      expect(result.html).toContain(mockPautaEmailData.userName);
      expect(result.html).toContain(mockPautaEmailData.shortOrderId);
    });

    it('deve incluir todas as informações da pauta', () => {
      // Act
      const result = EmailTemplateService.generatePautaTemplate(mockPautaEmailData, false);

      // Assert
      expect(result.html).toContain(mockPautaEmailData.pautaData.palavraChave);
      expect(result.html).toContain(mockPautaEmailData.pautaData.urlSite);
      expect(result.html).toContain(mockPautaEmailData.pautaData.textoAncora);
      expect(result.html).toContain(mockPautaEmailData.pautaData.requisitosEspeciais);
    });

    it('deve incluir cor padrão #d30000', () => {
      // Act
      const result = EmailTemplateService.generatePautaTemplate(mockPautaEmailData, false);

      // Assert
      expect(result.html).toContain('#d30000');
      expect(result.html).toContain('color: white !important');
      expect(result.html).toContain('font-weight: bold');
    });

    it('deve incluir botão Acessar Pedido com link correto', () => {
      // Act
      const result = EmailTemplateService.generatePautaTemplate(mockPautaEmailData, false);

      // Assert
      expect(result.html).toContain('Acessar Pedido');
      expect(result.html).toContain(`http://cp.suaimprensa.com.br/orders/${mockPautaEmailData.orderId}`);
      expect(result.html).toContain('📋'); // Ícone presente nas informações do pedido
    });
  });

  describe('generateArticleDocTemplate', () => {
    it('deve gerar template para cliente com mensagem correta', () => {
      // Act
      const result = EmailTemplateService.generateArticleDocTemplate(mockArticleDocEmailData, false);

      // Assert
      expect(result.subject).toBe('Novo Artigo Enviado');
      expect(result.html).toContain('Aguarde a revisão do artigo');
      expect(result.html).not.toContain('Por favor, revise o artigo e proceda com a publicação');
    });

    it('deve gerar template para admin com mensagem correta', () => {
      // Act
      const result = EmailTemplateService.generateArticleDocTemplate(mockArticleDocEmailData, true);

      // Assert
      expect(result.subject).toBe('Novo Artigo Enviado');
      expect(result.html).toContain('Por favor, revise o artigo e proceda com a publicação');
      expect(result.html).not.toContain('Aguarde a revisão do artigo');
    });

    it('deve mostrar informações do arquivo para upload', () => {
      // Act
      const result = EmailTemplateService.generateArticleDocTemplate(mockArticleDocEmailData, false);

      // Assert
      expect(result.html).toContain(mockArticleDocEmailData.articleData?.fileName);
      expect(result.html).not.toContain('📁 Baixar Arquivo'); // Botão removido
    });

    it('deve mostrar informações do link para artigo via link', () => {
      // Act
      const result = EmailTemplateService.generateArticleDocTemplate(mockArticleLinkEmailData, false);

      // Assert
      expect(result.html).toContain(mockArticleLinkEmailData.articleData?.articleUrl);
      expect(result.html).toContain('Link do Artigo:');
    });

    it('deve incluir cor padrão e não ter botão download', () => {
      // Act
      const result = EmailTemplateService.generateArticleDocTemplate(mockArticleDocEmailData, false);

      // Assert
      expect(result.html).toContain('#d30000');
      expect(result.html).toContain('download-btn'); // CSS class presente
      expect(result.html).not.toContain('Baixar Arquivo');
    });
  });

  describe('generateArticleUrlTemplate', () => {
    it('deve gerar template com informações de publicação', () => {
      // Act
      const result = EmailTemplateService.generateArticleUrlTemplate(mockArticleUrlEmailData);

      // Assert
      expect(result.subject).toBe('Novo Artigo Publicado');
      expect(result.html).toContain('Novo Artigo Publicado');
      expect(result.html).toContain(mockArticleUrlEmailData.publishedUrl);
      expect(result.html).toContain('Seu artigo foi publicado e está disponível online');
    });

    it('deve não ter botão Visualizar Artigo', () => {
      // Act
      const result = EmailTemplateService.generateArticleUrlTemplate(mockArticleUrlEmailData);

      // Assert
      expect(result.html).not.toContain('Visualizar Artigo');
      expect(result.html).toContain(mockArticleUrlEmailData.publishedUrl); // URL deve estar visível
    });

    it('deve incluir informações básicas do pedido', () => {
      // Act
      const result = EmailTemplateService.generateArticleUrlTemplate(mockArticleUrlEmailData);

      // Assert
      expect(result.html).toContain(mockArticleUrlEmailData.userName);
      expect(result.html).toContain(mockArticleUrlEmailData.shortOrderId);
      expect(result.html).toContain(mockArticleUrlEmailData.productName);
    });

    it('deve incluir design system correto', () => {
      // Act
      const result = EmailTemplateService.generateArticleUrlTemplate(mockArticleUrlEmailData);

      // Assert
      expect(result.html).toContain('#d30000');
      expect(result.html).toContain('color: white !important');
      expect(result.html).toContain('font-weight: bold');
      expect(result.html).toContain('#a82020'); // Hover
    });
  });

  describe('Template Consistency', () => {
    it('todos os templates devem ter estrutura HTML válida', () => {
      // Arrange
      const templates = [
        EmailTemplateService.generatePautaTemplate(mockPautaEmailData, false),
        EmailTemplateService.generateArticleDocTemplate(mockArticleDocEmailData, false),
        EmailTemplateService.generateArticleUrlTemplate(mockArticleUrlEmailData)
      ];

      // Act & Assert
      templates.forEach(template => {
        expect(template.html).toContain('<!DOCTYPE html>');
        expect(template.html).toContain('<html>');
        expect(template.html).toContain('</html>');
        expect(template.html).toContain('<head>');
        expect(template.html).toContain('<body>');
        expect(template.subject).toBeTruthy();
      });
    });

    it('todos os templates devem ter cores consistentes', () => {
      // Arrange
      const templates = [
        EmailTemplateService.generatePautaTemplate(mockPautaEmailData, false),
        EmailTemplateService.generateArticleDocTemplate(mockArticleDocEmailData, false),
        EmailTemplateService.generateArticleUrlTemplate(mockArticleUrlEmailData)
      ];

      // Act & Assert
      templates.forEach(template => {
        expect(template.html).toContain('#d30000'); // Cor principal
        expect(template.html).toContain('color: white !important'); // Texto do botão
        expect(template.html).toContain('#a82020'); // Hover
      });
    });

    it('todos os templates devem ter botão Acessar Pedido', () => {
      // Arrange
      const templates = [
        EmailTemplateService.generatePautaTemplate(mockPautaEmailData, false),
        EmailTemplateService.generateArticleDocTemplate(mockArticleDocEmailData, false),
        EmailTemplateService.generateArticleUrlTemplate(mockArticleUrlEmailData)
      ];

      // Act & Assert
      templates.forEach(template => {
        expect(template.html).toContain('Acessar Pedido');
        expect(template.html).toContain('http://cp.suaimprensa.com.br/orders/');
        expect(template.html).toContain('📋'); // Ícone presente nas informações do pedido
      });
    });
  });
});
