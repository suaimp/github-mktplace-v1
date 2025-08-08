/**
 * Hook para gerenciar o formulário de pauta
 */

import { useState } from 'react';
import { PautaFormData, PautaFormErrors } from '../types';
import { validatePautaForm, hasFormErrors } from '../utils/validation';

const initialFormData: PautaFormData = {
  palavraChave: '',
  urlSite: '',
  textoAncora: '',
  requisitosEspeciais: ''
};

export function usePautaForm() {
  const [formData, setFormData] = useState<PautaFormData>(initialFormData);
  const [errors, setErrors] = useState<PautaFormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  /**
   * Atualiza um campo do formulário
   */
  const updateField = (field: keyof PautaFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  /**
   * Marca um campo como tocado
   */
  const touchField = (field: keyof PautaFormData) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  /**
   * Valida o formulário
   */
  const validateForm = (): boolean => {
    const formErrors = validatePautaForm(formData);
    setErrors(formErrors);
    return !hasFormErrors(formErrors);
  };

  /**
   * Reseta o formulário
   */
  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
  };

  /**
   * Verifica se um campo deve mostrar erro
   */
  const shouldShowError = (field: keyof PautaFormData): boolean => {
    return touched[field] && !!errors[field];
  };

  return {
    formData,
    errors,
    touched,
    updateField,
    touchField,
    validateForm,
    resetForm,
    shouldShowError,
    isFormValid: !hasFormErrors(errors) && Object.keys(touched).length > 0
  };
}
