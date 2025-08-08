/**
 * Validação para formulário de pauta
 */

import { PautaFormData, PautaFormErrors } from '../types';

/**
 * Valida se uma URL é válida
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida os dados do formulário de pauta
 */
export function validatePautaForm(data: PautaFormData): PautaFormErrors {
  const errors: PautaFormErrors = {};

  // Validação da palavra-chave
  if (!data.palavraChave.trim()) {
    errors.palavraChave = 'Palavra-chave é obrigatória';
  } else if (data.palavraChave.trim().length < 2) {
    errors.palavraChave = 'Palavra-chave deve ter pelo menos 2 caracteres';
  }

  // Validação da URL
  if (!data.urlSite.trim()) {
    errors.urlSite = 'URL do site é obrigatória';
  } else if (!isValidUrl(data.urlSite)) {
    errors.urlSite = 'URL inválida. Exemplo: https://exemplo.com';
  }

  // Validação do texto âncora
  if (!data.textoAncora.trim()) {
    errors.textoAncora = 'Texto âncora é obrigatório';
  } else if (data.textoAncora.trim().length < 2) {
    errors.textoAncora = 'Texto âncora deve ter pelo menos 2 caracteres';
  }

  // Validação dos requisitos especiais
  if (!data.requisitosEspeciais.trim()) {
    errors.requisitosEspeciais = 'Requisitos especiais são obrigatórios';
  } else if (data.requisitosEspeciais.trim().length < 10) {
    errors.requisitosEspeciais = 'Requisitos especiais devem ter pelo menos 10 caracteres';
  }

  return errors;
}

/**
 * Verifica se há erros no formulário
 */
export function hasFormErrors(errors: PautaFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
