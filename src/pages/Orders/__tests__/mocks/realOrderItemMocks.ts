/**
 * Teste REAL para o fluxo da tabela OrderItemsTable
 * Baseado na implementação real em /orders/:id
 * 
 * Testa especificamente o comportamento quando service_content é "nenhum"
 * ou quando não há pacote selecionado (sem benefits)
 */

import { SERVICE_OPTIONS } from '../../../../components/Checkout/constants/options';

// Interface real do OrderItem conforme usado na OrderItemsTable
interface RealOrderItem {
  id: string;
  product_name: string;
  product_url: string;
  quantity: number;
  total_price: number;
  article_document_path?: string;
  article_doc?: string;
  article_url?: string;
  publication_status?: string;
  service_content?: any;
  outline?: any;
}

/**
 * Mock para item SEM pacote selecionado - case 1: service_content com "nenhum"
 */
export const mockItemWithNoneOption: RealOrderItem = {
  id: 'item-none-option',
  product_name: 'Site com opção "nenhum" selecionada',
  product_url: 'https://exemplo-sem-pacote.com',
  quantity: 1,
  total_price: 50.00,
  // Simula quando cliente seleciona "Nenhum - eu vou fornecer o conteúdo"
  service_content: JSON.stringify({
    title: SERVICE_OPTIONS.NONE,
    description: "Cliente fornecerá o próprio conteúdo",
    price: 0,
    benefits: [] // Array vazio = sem pacote real selecionado
  }),
  article_document_path: undefined,
  article_doc: undefined,
  article_url: undefined,
  publication_status: 'pending',
  outline: undefined
};

/**
 * Mock para item SEM pacote selecionado - case 2: service_content legacy
 */
export const mockItemWithLegacyNone: RealOrderItem = {
  id: 'item-legacy-none',
  product_name: 'Site com opção legacy "nenhum"',
  product_url: 'https://exemplo-legacy.com',
  quantity: 1,
  total_price: 50.00,
  // Simula dados antigos no sistema
  service_content: JSON.stringify({
    title: SERVICE_OPTIONS.LEGACY_NONE,
    description: "Compatibilidade com dados antigos",
    price: 0,
    benefits: [] // Array vazio = sem pacote real selecionado
  }),
  article_document_path: undefined,
  article_doc: undefined,
  article_url: undefined,
  publication_status: 'pending',
  outline: undefined
};

/**
 * Mock para item SEM pacote selecionado - case 3: service_content null/undefined
 */
export const mockItemWithNullServiceContent: RealOrderItem = {
  id: 'item-null-service',
  product_name: 'Site sem service_content definido',
  product_url: 'https://exemplo-null.com',
  quantity: 1,
  total_price: 50.00,
  // Simula quando não há service_content no banco
  service_content: null,
  article_document_path: undefined,
  article_doc: undefined,
  article_url: undefined,
  publication_status: 'pending',
  outline: undefined
};

/**
 * Mock para item COM pacote selecionado (para comparação)
 */
export const mockItemWithPackage: RealOrderItem = {
  id: 'item-with-package',
  product_name: 'Site com pacote selecionado',
  product_url: 'https://exemplo-com-pacote.com',
  quantity: 1,
  total_price: 150.00,
  service_content: JSON.stringify({
    title: "Pacote Premium",
    description: "Conteúdo completo com benefícios",
    price: 100,
    benefits: [
      "Pesquisa de palavras-chave",
      "Otimização SEO",
      "Revisão profissional"
    ]
  }),
  article_document_path: undefined,
  article_doc: undefined,
  article_url: undefined,
  publication_status: 'pending',
  outline: undefined
};

export const allTestItems = [
  mockItemWithNoneOption,
  mockItemWithLegacyNone,
  mockItemWithNullServiceContent,
  mockItemWithPackage
];
