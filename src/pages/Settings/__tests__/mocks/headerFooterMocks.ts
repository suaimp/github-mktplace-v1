/**
 * Mocks para testes do HeaderFooterScriptsService
 * Isolamento de dependências seguindo princípio de responsabilidade única
 */

export const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

export const mockSuccessResponse = {
  data: {
    header_scripts: '<script>console.log("test header");</script>',
    footer_scripts: '<script>console.log("test footer");</script>',
  },
  error: null,
};

export const mockErrorResponse = {
  data: null,
  error: { message: 'Database error', code: 'PGRST301' },
};

export const mockEmptyResponse = {
  data: {
    header_scripts: null,
    footer_scripts: null,
  },
  error: null,
};

export const mockValidScripts = {
  header_scripts: `
    <script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_TRACKING_ID');
    </script>
  `,
  footer_scripts: `
    <script>
      console.log('Footer script loaded');
    </script>
  `,
};

export const mockInvalidScripts = {
  header_scripts: '<script>document.write("dangerous");</script>',
  footer_scripts: '<script>eval("malicious code");</script>',
};

export const mockLargeScripts = {
  header_scripts: 'x'.repeat(15000), // Excede limite de 10.000
  footer_scripts: 'y'.repeat(15000),
};

export const mockSettingsId = 'test-settings-id-123';

/**
 * Mock do console para capturar logs
 */
export const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

/**
 * Reset function para limpar mocks entre testes
 */
export const resetMocks = () => {
  jest.clearAllMocks();
  mockSupabaseClient.from.mockReturnThis();
  mockSupabaseClient.select.mockReturnThis();
  mockSupabaseClient.update.mockReturnThis();
  mockSupabaseClient.eq.mockReturnThis();
  mockConsole.log.mockClear();
  mockConsole.error.mockClear();
  mockConsole.warn.mockClear();
};
