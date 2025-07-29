import { EntryToastService } from "../services/EntryToastService";
import { ToastType } from "../types/toastTypes";

/**
 * Hook personalizado para toasts no contexto do EditorialManager
 * Encapsula o uso do EntryToastService e fornece uma API simples
 */
export function useEntryToast() {
  
  const showEntryUpdated = () => {
    EntryToastService.showEntryUpdated();
  };

  const showEntrySaved = () => {
    EntryToastService.showEntrySaved();
  };

  const showUpdateFailed = (customMessage?: string) => {
    EntryToastService.showUpdateFailed(customMessage);
  };

  const showUnexpectedError = () => {
    EntryToastService.showUnexpectedError();
  };

  const showValidationError = (customMessage?: string) => {
    EntryToastService.showValidationError(customMessage);
  };

  const showCustomToast = (message: string, type: ToastType) => {
    EntryToastService.showCustom(message, type);
  };

  return {
    showEntryUpdated,
    showEntrySaved,
    showUpdateFailed,
    showUnexpectedError,
    showValidationError,
    showCustomToast
  };
}
