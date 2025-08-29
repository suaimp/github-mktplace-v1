// Função principal para auto preenchimento dos campos do formulário
import { AutoFillContext } from './types';
import { autoFillRules } from './rules';

export function autoFillFormFields(context: AutoFillContext) {
  // Cria um novo objeto para acumular todas as alterações
  const newFormValues = { ...context.formValues };
  // Função para atualizar o objeto acumulador
  const updateFormValue = (fieldId: string, value: any) => {
    newFormValues[fieldId] = value;
  };
  // Executa todas as regras usando o acumulador
  for (const rule of autoFillRules) {
    rule.apply({ ...context, updateFormValue, formValues: newFormValues });
  }
  // Atualiza cada campo individualmente usando updateFormValue
  Object.entries(newFormValues).forEach(([fieldId, value]) => {
    if (context.formValues[fieldId] !== value) {
      context.updateFormValue(fieldId, value);
    }
  });
}
