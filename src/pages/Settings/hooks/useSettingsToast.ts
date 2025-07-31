import { showToast } from "../../../utils/toast";

export interface UseSettingsToastReturn {
  showSuccessToast: (message?: string) => void;
  showErrorToast: (message?: string) => void;
}

export function useSettingsToast(): UseSettingsToastReturn {
  const showSuccessToast = (message?: string) => {
    const defaultMessage = "Todas as configurações foram salvas com sucesso!";
    showToast(message || defaultMessage, "success");
  };

  const showErrorToast = (message?: string) => {
    const defaultMessage = "Erro ao salvar configurações. Tente novamente.";
    showToast(message || defaultMessage, "error");
  };

  return {
    showSuccessToast,
    showErrorToast
  };
}
