/**
 * Testes unitários para HeaderFooterScriptsService
 * Segue princípio de responsabilidade única - testa apenas a lógica do serviço
 */

import { HeaderFooterScriptsService } from '../../../../services/db-services/settings-services/headerFooterScriptsService';
import {
  mockSupabaseClient,
  mockSuccessResponse,
  mockErrorResponse,
  mockEmptyResponse,
  mockValidScripts,
  mockInvalidScripts,
  mockLargeScripts,
  mockSettingsId,
  resetMocks,
} from '../mocks/headerFooterMocks';

// Mock do supabase
jest.mock('../../../../lib/supabase', () => ({
  supabase: mockSupabaseClient,
}));

describe('HeaderFooterScriptsService', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('getHeaderFooterScripts', () => {
    it('deve retornar scripts quando dados existem', async () => {
      mockSupabaseClient.single.mockResolvedValue(mockSuccessResponse);

      const result = await HeaderFooterScriptsService.getHeaderFooterScripts();

      expect(result).toEqual(mockSuccessResponse.data);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('settings');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('header_scripts, footer_scripts');
    });

    it('deve retornar null quando há erro no banco', async () => {
      mockSupabaseClient.single.mockResolvedValue(mockErrorResponse);

      const result = await HeaderFooterScriptsService.getHeaderFooterScripts();

      expect(result).toBeNull();
    });

    it('deve retornar dados vazios quando não há scripts configurados', async () => {
      mockSupabaseClient.single.mockResolvedValue(mockEmptyResponse);

      const result = await HeaderFooterScriptsService.getHeaderFooterScripts();

      expect(result).toEqual(mockEmptyResponse.data);
    });

    it('deve capturar e logar erros inesperados', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.single.mockRejectedValue(new Error('Network error'));

      const result = await HeaderFooterScriptsService.getHeaderFooterScripts();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erro inesperado ao buscar scripts:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateHeaderFooterScripts', () => {
    it('deve atualizar scripts com sucesso', async () => {
      mockSupabaseClient.eq.mockResolvedValue({ error: null });

      const result = await HeaderFooterScriptsService.updateHeaderFooterScripts(
        mockSettingsId,
        mockValidScripts
      );

      expect(result).toBe(true);
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        header_scripts: mockValidScripts.header_scripts.trim(),
        footer_scripts: mockValidScripts.footer_scripts.trim(),
      });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', mockSettingsId);
    });

    it('deve falhar quando scripts são inválidos', async () => {
      const result = await HeaderFooterScriptsService.updateHeaderFooterScripts(
        mockSettingsId,
        mockInvalidScripts
      );

      expect(result).toBe(false);
      expect(mockSupabaseClient.update).not.toHaveBeenCalled();
    });

    it('deve retornar false quando há erro no banco', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.eq.mockResolvedValue({ error: { message: 'Update failed' } });

      const result = await HeaderFooterScriptsService.updateHeaderFooterScripts(
        mockSettingsId,
        mockValidScripts
      );

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('deve trimar strings vazias para null', async () => {
      mockSupabaseClient.eq.mockResolvedValue({ error: null });

      const emptyScripts = {
        header_scripts: '   ',
        footer_scripts: '',
      };

      await HeaderFooterScriptsService.updateHeaderFooterScripts(
        mockSettingsId,
        emptyScripts
      );

      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        header_scripts: null,
        footer_scripts: null,
      });
    });
  });

  describe('validateScripts', () => {
    it('deve validar scripts válidos', () => {
      const result = HeaderFooterScriptsService.validateScripts(mockValidScripts);

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('deve invalidar scripts muito longos', () => {
      const result = HeaderFooterScriptsService.validateScripts(mockLargeScripts);

      expect(result.isValid).toBe(false);
      expect(result.errors.header_scripts).toContain('não podem exceder 10.000 caracteres');
      expect(result.errors.footer_scripts).toContain('não podem exceder 10.000 caracteres');
    });

    it('deve detectar padrões perigosos', () => {
      const result = HeaderFooterScriptsService.validateScripts(mockInvalidScripts);

      expect(result.isValid).toBe(false);
      expect(result.errors.header_scripts).toContain('padrões potencialmente perigosos');
      expect(result.errors.footer_scripts).toContain('padrões potencialmente perigosos');
    });

    it('deve validar scripts vazios como válidos', () => {
      const emptyScripts = {
        header_scripts: '',
        footer_scripts: '',
      };

      const result = HeaderFooterScriptsService.validateScripts(emptyScripts);

      expect(result.isValid).toBe(true);
    });

    it('deve detectar todos os padrões perigosos', () => {
      const dangerousPatterns = [
        'document.write("test")',
        'eval("test")',
        'innerHTML = "test"',
        'javascript: void(0)',
        'onclick="test"',
        'onload="test"',
      ];

      dangerousPatterns.forEach(pattern => {
        const testScript = {
          header_scripts: pattern,
          footer_scripts: '',
        };

        const result = HeaderFooterScriptsService.validateScripts(testScript);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('sanitizeScript', () => {
    it('deve remover comentários HTML maliciosos', () => {
      const maliciousScript = `
        <script>console.log('test');</script>
        <!-- This is a malicious comment -->
        <script>alert('clean');</script>
      `;

      const result = HeaderFooterScriptsService.sanitizeScript(maliciousScript);

      expect(result).not.toContain('<!-- This is a malicious comment -->');
      expect(result).toContain('<script>console.log(\'test\');</script>');
    });

    it('deve trimar espaços em branco', () => {
      const scriptWithSpaces = '   \n  <script>test</script>  \n  ';

      const result = HeaderFooterScriptsService.sanitizeScript(scriptWithSpaces);

      expect(result).toBe('<script>test</script>');
    });

    it('deve retornar string vazia para input vazio', () => {
      expect(HeaderFooterScriptsService.sanitizeScript('')).toBe('');
      expect(HeaderFooterScriptsService.sanitizeScript(null as any)).toBe('');
      expect(HeaderFooterScriptsService.sanitizeScript(undefined as any)).toBe('');
    });
  });

  describe('isValidScriptFormat', () => {
    it('deve aceitar scripts válidos', () => {
      const validFormats = [
        '<script>console.log("test");</script>',
        '<meta name="description" content="test">',
        '<link rel="stylesheet" href="test.css">',
        '<style>body { color: red; }</style>',
        'gtag("config", "GA_TRACKING_ID");',
        'ga("send", "pageview");',
        'fbq("track", "PageView");',
      ];

      validFormats.forEach(script => {
        expect(HeaderFooterScriptsService.isValidScriptFormat(script)).toBe(true);
      });
    });

    it('deve aceitar strings vazias como válidas', () => {
      expect(HeaderFooterScriptsService.isValidScriptFormat('')).toBe(true);
      expect(HeaderFooterScriptsService.isValidScriptFormat('   ')).toBe(true);
    });

    it('deve rejeitar formatos inválidos', () => {
      const invalidFormats = [
        'just plain text',
        'console.log("no tags");',
        'alert("suspicious");',
      ];

      invalidFormats.forEach(script => {
        expect(HeaderFooterScriptsService.isValidScriptFormat(script)).toBe(false);
      });
    });
  });
});
