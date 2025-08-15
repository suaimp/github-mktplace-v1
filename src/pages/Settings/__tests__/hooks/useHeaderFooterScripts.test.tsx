/**
 * Testes unitários para useHeaderFooterScripts hook
 * Testa o comportamento do hook seguindo princípio de responsabilidade única
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useHeaderFooterScripts } from '../../hooks/useHeaderFooterScripts';
import { HeaderFooterScriptsService } from '../../../../services/db-services/settings-services/headerFooterScriptsService';
import { SiteSettingsService } from '../../../../services/db-services/settings-services/siteSettingsService';

// Mocks dos serviços
jest.mock('../../../../services/db-services/settings-services/headerFooterScriptsService');
jest.mock('../../../../services/db-services/settings-services/siteSettingsService');

const mockHeaderFooterScriptsService = HeaderFooterScriptsService as jest.Mocked<typeof HeaderFooterScriptsService>;
const mockSiteSettingsService = SiteSettingsService as jest.Mocked<typeof SiteSettingsService>;

describe('useHeaderFooterScripts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Inicialização', () => {
    it('deve inicializar com estado padrão', async () => {
      mockHeaderFooterScriptsService.getHeaderFooterScripts.mockResolvedValue({
        header_scripts: '',
        footer_scripts: '',
      });

      const { result } = renderHook(() => useHeaderFooterScripts());

      expect(result.current.formState.header_scripts).toBe('');
      expect(result.current.formState.footer_scripts).toBe('');
      expect(result.current.formState.loading).toBe(false);
      expect(result.current.formState.success).toBe(false);
      expect(result.current.formState.error).toBeNull();
    });

    it('deve carregar scripts existentes na inicialização', async () => {
      const mockScripts = {
        header_scripts: '<script>header test</script>',
        footer_scripts: '<script>footer test</script>',
      };

      mockHeaderFooterScriptsService.getHeaderFooterScripts.mockResolvedValue(mockScripts);

      const { result } = renderHook(() => useHeaderFooterScripts());

      await waitFor(() => {
        expect(result.current.formState.header_scripts).toBe(mockScripts.header_scripts);
        expect(result.current.formState.footer_scripts).toBe(mockScripts.footer_scripts);
      });
    });

    it('deve tratar erro ao carregar scripts', async () => {
      mockHeaderFooterScriptsService.getHeaderFooterScripts.mockResolvedValue(null);

      const { result } = renderHook(() => useHeaderFooterScripts());

      await waitFor(() => {
        expect(result.current.formState.header_scripts).toBe('');
        expect(result.current.formState.footer_scripts).toBe('');
      });
    });
  });

  describe('updateField', () => {
    it('deve atualizar campo header_scripts', async () => {
      mockHeaderFooterScriptsService.getHeaderFooterScripts.mockResolvedValue({
        header_scripts: '',
        footer_scripts: '',
      });

      const { result } = renderHook(() => useHeaderFooterScripts());

      await waitFor(() => {
        expect(result.current.formState.loading).toBe(false);
      });

      act(() => {
        result.current.updateField('header_scripts', '<script>new header</script>');
      });

      expect(result.current.formState.header_scripts).toBe('<script>new header</script>');
      expect(result.current.formState.success).toBe(false);
      expect(result.current.formState.error).toBeNull();
    });

    it('deve atualizar campo footer_scripts', async () => {
      mockHeaderFooterScriptsService.getHeaderFooterScripts.mockResolvedValue({
        header_scripts: '',
        footer_scripts: '',
      });

      const { result } = renderHook(() => useHeaderFooterScripts());

      await waitFor(() => {
        expect(result.current.formState.loading).toBe(false);
      });

      act(() => {
        result.current.updateField('footer_scripts', '<script>new footer</script>');
      });

      expect(result.current.formState.footer_scripts).toBe('<script>new footer</script>');
    });

    it('deve limpar erros de validação ao atualizar campo', async () => {
      mockHeaderFooterScriptsService.getHeaderFooterScripts.mockResolvedValue({
        header_scripts: '',
        footer_scripts: '',
      });

      const { result } = renderHook(() => useHeaderFooterScripts());

      await waitFor(() => {
        expect(result.current.formState.loading).toBe(false);
      });

      // Simular erro de validação
      act(() => {
        result.current.updateField('header_scripts', '<script>test</script>');
      });

      expect(result.current.validationErrors.header_scripts).toBeUndefined();
    });
  });

  describe('saveScripts', () => {
    beforeEach(() => {
      mockSiteSettingsService.getSiteSettings.mockResolvedValue({
        id: 'test-id',
        site_title: 'Test',
        site_description: 'Test',
        light_logo: null,
        dark_logo: null,
        platform_icon: null,
        smtp_host: null,
        smtp_port: null,
        smtp_user: null,
        smtp_pass: null,
        smtp_from_email: null,
        smtp_from_name: null,
        header_scripts: null,
        footer_scripts: null,
      });
    });

    it('deve salvar scripts com sucesso', async () => {
      mockHeaderFooterScriptsService.getHeaderFooterScripts.mockResolvedValue({
        header_scripts: '',
        footer_scripts: '',
      });
      mockHeaderFooterScriptsService.validateScripts.mockReturnValue({
        isValid: true,
        errors: {},
      });
      mockHeaderFooterScriptsService.updateHeaderFooterScripts.mockResolvedValue(true);
      mockHeaderFooterScriptsService.sanitizeScript
        .mockReturnValueOnce('<script>clean header</script>')
        .mockReturnValueOnce('<script>clean footer</script>');

      const { result } = renderHook(() => useHeaderFooterScripts());

      await waitFor(() => {
        expect(result.current.formState.loading).toBe(false);
      });

      act(() => {
        result.current.updateField('header_scripts', '<script>test header</script>');
        result.current.updateField('footer_scripts', '<script>test footer</script>');
      });

      let saveResult;
      await act(async () => {
        saveResult = await result.current.saveScripts();
      });

      expect(saveResult?.success).toBe(true);
      expect(saveResult?.message).toBe('Scripts salvos com sucesso!');
      expect(result.current.formState.success).toBe(true);
      expect(result.current.formState.loading).toBe(false);
    });

    it('deve falhar quando validação é inválida', async () => {
      mockHeaderFooterScriptsService.getHeaderFooterScripts.mockResolvedValue({
        header_scripts: '',
        footer_scripts: '',
      });
      mockHeaderFooterScriptsService.validateScripts.mockReturnValue({
        isValid: false,
        errors: { header_scripts: 'Script inválido' },
      });

      const { result } = renderHook(() => useHeaderFooterScripts());

      await waitFor(() => {
        expect(result.current.formState.loading).toBe(false);
      });

      let saveResult;
      await act(async () => {
        saveResult = await result.current.saveScripts();
      });

      expect(saveResult?.success).toBe(false);
      expect(saveResult?.message).toContain('Dados inválidos');
      expect(result.current.validationErrors.header_scripts).toBe('Script inválido');
    });

    it('deve tratar erro quando settings ID não encontrado', async () => {
      mockHeaderFooterScriptsService.getHeaderFooterScripts.mockResolvedValue({
        header_scripts: '',
        footer_scripts: '',
      });
      mockSiteSettingsService.getSiteSettings.mockResolvedValue(null);

      const { result } = renderHook(() => useHeaderFooterScripts());

      await waitFor(() => {
        expect(result.current.formState.loading).toBe(false);
      });

      let saveResult;
      await act(async () => {
        saveResult = await result.current.saveScripts();
      });

      expect(saveResult?.success).toBe(false);
      expect(result.current.formState.error).toContain('ID das configurações não encontrado');
    });

    it('deve tratar erro de falha ao salvar', async () => {
      mockHeaderFooterScriptsService.getHeaderFooterScripts.mockResolvedValue({
        header_scripts: '',
        footer_scripts: '',
      });
      mockHeaderFooterScriptsService.validateScripts.mockReturnValue({
        isValid: true,
        errors: {},
      });
      mockHeaderFooterScriptsService.updateHeaderFooterScripts.mockResolvedValue(false);

      const { result } = renderHook(() => useHeaderFooterScripts());

      await waitFor(() => {
        expect(result.current.formState.loading).toBe(false);
      });

      let saveResult;
      await act(async () => {
        saveResult = await result.current.saveScripts();
      });

      expect(saveResult?.success).toBe(false);
      expect(result.current.formState.error).toContain('Falha ao salvar scripts');
    });
  });

  describe('resetForm', () => {
    it('deve resetar formulário para estado inicial', async () => {
      mockHeaderFooterScriptsService.getHeaderFooterScripts.mockResolvedValue({
        header_scripts: 'test',
        footer_scripts: 'test',
      });

      const { result } = renderHook(() => useHeaderFooterScripts());

      await waitFor(() => {
        expect(result.current.formState.header_scripts).toBe('test');
      });

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formState.header_scripts).toBe('');
      expect(result.current.formState.footer_scripts).toBe('');
      expect(result.current.formState.loading).toBe(false);
      expect(result.current.formState.success).toBe(false);
      expect(result.current.formState.error).toBeNull();
      expect(Object.keys(result.current.validationErrors)).toHaveLength(0);
    });
  });

  describe('clearStatus', () => {
    it('deve limpar mensagens de status', async () => {
      mockHeaderFooterScriptsService.getHeaderFooterScripts.mockResolvedValue({
        header_scripts: '',
        footer_scripts: '',
      });

      const { result } = renderHook(() => useHeaderFooterScripts());

      // Simular estado com success e error
      act(() => {
        result.current.updateField('header_scripts', 'test');
      });

      await waitFor(() => {
        expect(result.current.formState.loading).toBe(false);
      });

      act(() => {
        result.current.clearStatus();
      });

      expect(result.current.formState.success).toBe(false);
      expect(result.current.formState.error).toBeNull();
    });
  });
});
