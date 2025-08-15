/**
 * Setup de testes para funcionalidade Header & Footer
 * Configurações específicas seguindo princípio de responsabilidade única
 */

import '@testing-library/jest-dom';

// Mock global do console para testes
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock do window.location
delete (window as any).location;
window.location = {
  ...window.location,
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/settings',
};

// Mock do document para testes de injeção de scripts
const originalCreateElement = document.createElement;
document.createElement = jest.fn().mockImplementation((tagName: string) => {
  const element = originalCreateElement.call(document, tagName);
  
  // Mock específico para elementos script
  if (tagName === 'script') {
    Object.defineProperty(element, 'src', {
      set: jest.fn(),
      get: jest.fn(() => ''),
      configurable: true,
    });
  }
  
  return element;
});

// Mock do document.head e document.body
Object.defineProperty(document, 'head', {
  value: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
  },
  configurable: true,
});

Object.defineProperty(document, 'body', {
  value: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
  },
  configurable: true,
});

// Mock da função fetch para testes de API
global.fetch = jest.fn();

// Função utilitária para resetar mocks entre testes
export const resetAllMocks = () => {
  jest.clearAllMocks();
  (console.log as jest.Mock).mockClear();
  (console.error as jest.Mock).mockClear();
  (console.warn as jest.Mock).mockClear();
  (document.createElement as jest.Mock).mockClear();
  (fetch as jest.Mock).mockClear();
};

// Mock de matchMedia para testes responsivos
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Timeout padrão para testes assíncronos
jest.setTimeout(10000);

// Mock de setTimeout e setInterval para testes de timing
jest.useFakeTimers();
