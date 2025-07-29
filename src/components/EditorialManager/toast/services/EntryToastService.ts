import { showToast } from "../../../../utils/toast";
import { EntryToastMessages, ToastType } from "../types/toastTypes";

/**
 * Serviço de toast específico para operações do EditorialManager
 * Centraliza as mensagens e usa o sistema de toast global do projeto
 */
export class EntryToastService {
  private static messages: EntryToastMessages = {
    success: {
      updated: "Entrada atualizada com sucesso!",
      saved: "Alterações salvas com sucesso!"
    },
    error: {
      updateFailed: "Erro ao atualizar entrada",
      unexpectedError: "Erro inesperado ao atualizar entrada",
      validationError: "Erro de validação nos dados"
    }
  };

  /**
   * Mostra toast de sucesso para entrada atualizada
   */
  static showEntryUpdated(): void {
    showToast(this.messages.success.updated, "success");
  }

  /**
   * Mostra toast de sucesso para alterações salvas
   */
  static showEntrySaved(): void {
    showToast(this.messages.success.saved, "success");
  }

  /**
   * Mostra toast de erro para falha na atualização
   */
  static showUpdateFailed(customMessage?: string): void {
    const message = customMessage || this.messages.error.updateFailed;
    showToast(message, "error");
  }

  /**
   * Mostra toast de erro inesperado
   */
  static showUnexpectedError(): void {
    showToast(this.messages.error.unexpectedError, "error");
  }

  /**
   * Mostra toast de erro de validação
   */
  static showValidationError(customMessage?: string): void {
    const message = customMessage || this.messages.error.validationError;
    showToast(message, "error");
  }

  /**
   * Mostra toast customizado
   */
  static showCustom(message: string, type: ToastType): void {
    showToast(message, type);
  }
}
