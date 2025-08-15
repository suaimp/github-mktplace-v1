/**
 * Testes unitários para HeaderFooterSettings component
 * Testa renderização e interações do usuário seguindo responsabilidade única
 */

 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HeaderFooterSettings from '../../components/HeaderFooterSettings';
import { useHeaderFooterScripts } from '../../hooks/useHeaderFooterScripts';

// Mock do hook personalizado
jest.mock('../../hooks/useHeaderFooterScripts');
const mockUseHeaderFooterScripts = useHeaderFooterScripts as jest.MockedFunction<typeof useHeaderFooterScripts>;

// Mock dos componentes UI
jest.mock('../../../../components/ui/button/Button', () => {
  return function MockButton({ children, onClick, disabled, variant }: any) {
    return (
      <button 
        onClick={onClick} 
        disabled={disabled}
        data-testid={`button-${variant || 'default'}`}
      >
        {children}
      </button>
    );
  };
});

jest.mock('../../../../components/form/Label', () => {
  return function MockLabel({ children, htmlFor, className }: any) {
    return <label htmlFor={htmlFor} className={className}>{children}</label>;
  };
});

describe('HeaderFooterSettings', () => {
  const mockUpdateField = jest.fn();
  const mockSaveScripts = jest.fn();
  const mockClearStatus = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnError = jest.fn();

  const defaultFormState = {
    header_scripts: '',
    footer_scripts: '',
    loading: false,
    success: false,
    error: null,
  };

  const defaultHookReturn = {
    formState: defaultFormState,
    validationErrors: {},
    updateField: mockUpdateField,
    saveScripts: mockSaveScripts,
    clearStatus: mockClearStatus,
    resetForm: jest.fn(),
    loadScripts: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHeaderFooterScripts.mockReturnValue(defaultHookReturn);
  });

  describe('Renderização', () => {
    it('deve renderizar formulário completo', () => {
      render(<HeaderFooterSettings />);

      expect(screen.getByLabelText(/Scripts dentro do <head>/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Scripts antes do <\/body>/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Salvar Configurações/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Limpar Status/ })).toBeInTheDocument();
    });

    it('deve renderizar placeholders nos campos', () => {
      render(<HeaderFooterSettings />);

      const headerField = screen.getByPlaceholderText(/Exemplo: Google Analytics/);
      const footerField = screen.getByPlaceholderText(/Exemplo: Chat Widget/);

      expect(headerField).toBeInTheDocument();
      expect(footerField).toBeInTheDocument();
    });

    it('deve renderizar avisos de segurança', () => {
      render(<HeaderFooterSettings />);

      expect(screen.getByText(/Avisos de Segurança/)).toBeInTheDocument();
      expect(screen.getByText(/Apenas administradores podem modificar/)).toBeInTheDocument();
    });

    it('deve renderizar contadores de caracteres', () => {
      render(<HeaderFooterSettings />);

      expect(screen.getByText('Caracteres: 0/10.000')).toBeInTheDocument();
    });
  });

  describe('Estados do formulário', () => {
    it('deve exibir mensagem de sucesso', () => {
      mockUseHeaderFooterScripts.mockReturnValue({
        ...defaultHookReturn,
        formState: { ...defaultFormState, success: true },
      });

      render(<HeaderFooterSettings />);

      expect(screen.getByText(/Scripts de Header e Footer salvos com sucesso/)).toBeInTheDocument();
    });

    it('deve exibir mensagem de erro', () => {
      const errorMessage = 'Erro de teste';
      mockUseHeaderFooterScripts.mockReturnValue({
        ...defaultHookReturn,
        formState: { ...defaultFormState, error: errorMessage },
      });

      render(<HeaderFooterSettings />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('deve desabilitar campos durante loading', () => {
      mockUseHeaderFooterScripts.mockReturnValue({
        ...defaultHookReturn,
        formState: { ...defaultFormState, loading: true },
      });

      render(<HeaderFooterSettings />);

      const headerField = screen.getByDisplayValue('');
      const footerField = screen.getByDisplayValue('');

      expect(headerField).toBeDisabled();
      expect(footerField).toBeDisabled();
    });

    it('deve mostrar texto de carregamento no botão', () => {
      mockUseHeaderFooterScripts.mockReturnValue({
        ...defaultHookReturn,
        formState: { ...defaultFormState, loading: true },
      });

      render(<HeaderFooterSettings />);

      expect(screen.getByText('Salvando...')).toBeInTheDocument();
    });
  });

  describe('Validação', () => {
    it('deve exibir erros de validação', () => {
      const validationErrors = {
        header_scripts: 'Erro no header',
        footer_scripts: 'Erro no footer',
      };

      mockUseHeaderFooterScripts.mockReturnValue({
        ...defaultHookReturn,
        validationErrors,
      });

      render(<HeaderFooterSettings />);

      expect(screen.getByText('Erro no header')).toBeInTheDocument();
      expect(screen.getByText('Erro no footer')).toBeInTheDocument();
    });

    it('deve aplicar classes de erro nos campos', () => {
      const validationErrors = {
        header_scripts: 'Erro no header',
      };

      mockUseHeaderFooterScripts.mockReturnValue({
        ...defaultHookReturn,
        validationErrors,
      });

      render(<HeaderFooterSettings />);

      const headerField = screen.getByLabelText(/Scripts dentro do <head>/);
      expect(headerField).toHaveClass('border-error-500');
    });
  });

  describe('Interações do usuário', () => {
    it('deve chamar updateField ao digitar no campo header', () => {
      render(<HeaderFooterSettings />);

      const headerField = screen.getByLabelText(/Scripts dentro do <head>/);
      fireEvent.change(headerField, { target: { value: '<script>test</script>' } });

      expect(mockUpdateField).toHaveBeenCalledWith('header_scripts', '<script>test</script>');
    });

    it('deve chamar updateField ao digitar no campo footer', () => {
      render(<HeaderFooterSettings />);

      const footerField = screen.getByLabelText(/Scripts antes do <\/body>/);
      fireEvent.change(footerField, { target: { value: '<script>footer</script>' } });

      expect(mockUpdateField).toHaveBeenCalledWith('footer_scripts', '<script>footer</script>');
    });

    it('deve chamar saveScripts ao submeter formulário', async () => {
      mockSaveScripts.mockResolvedValue({ success: true, message: 'Sucesso' });

      render(<HeaderFooterSettings onSave={mockOnSave} />);

      const form = screen.getByRole('form') || screen.getByTestId('header-footer-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockSaveScripts).toHaveBeenCalled();
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('deve chamar onError quando salvamento falha', async () => {
      const errorMessage = 'Falha no salvamento';
      mockSaveScripts.mockResolvedValue({ success: false, message: errorMessage });

      render(<HeaderFooterSettings onError={mockOnError} />);

      const form = screen.getByRole('form') || screen.getByTestId('header-footer-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      });
    });

    it('deve chamar clearStatus ao clicar em Limpar Status', () => {
      render(<HeaderFooterSettings />);

      const clearButton = screen.getByRole('button', { name: /Limpar Status/ });
      fireEvent.click(clearButton);

      expect(mockClearStatus).toHaveBeenCalled();
    });
  });

  describe('Contadores de caracteres', () => {
    it('deve atualizar contador de caracteres para header', () => {
      const formStateWithText = {
        ...defaultFormState,
        header_scripts: 'test script',
      };

      mockUseHeaderFooterScripts.mockReturnValue({
        ...defaultHookReturn,
        formState: formStateWithText,
      });

      render(<HeaderFooterSettings />);

      expect(screen.getByText('Caracteres: 11/10.000')).toBeInTheDocument();
    });

    it('deve atualizar contador de caracteres para footer', () => {
      const formStateWithText = {
        ...defaultFormState,
        footer_scripts: 'footer test script',
      };

      mockUseHeaderFooterScripts.mockReturnValue({
        ...defaultHookReturn,
        formState: formStateWithText,
      });

      render(<HeaderFooterSettings />);

      expect(screen.getByText('Caracteres: 18/10.000')).toBeInTheDocument();
    });
  });

  describe('Valores dos campos', () => {
    it('deve exibir valores dos campos do estado', () => {
      const formStateWithValues = {
        ...defaultFormState,
        header_scripts: '<script>header content</script>',
        footer_scripts: '<script>footer content</script>',
      };

      mockUseHeaderFooterScripts.mockReturnValue({
        ...defaultHookReturn,
        formState: formStateWithValues,
      });

      render(<HeaderFooterSettings />);

      expect(screen.getByDisplayValue('<script>header content</script>')).toBeInTheDocument();
      expect(screen.getByDisplayValue('<script>footer content</script>')).toBeInTheDocument();
    });
  });
});
