/**
 * Setup global para testes Jest
 */

import '@testing-library/jest-dom';

// Polyfills necessários para testes
if (typeof global.TextEncoder === 'undefined') {
  const util = require('util');
  global.TextEncoder = util.TextEncoder;
  global.TextDecoder = util.TextDecoder;
}

// Mock do console para testes
global.console = {
  ...console,
  // Silenciar logs durante testes
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock do fetch global
global.fetch = jest.fn();

// Configurações globais para testes
jest.setTimeout(10000);

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
