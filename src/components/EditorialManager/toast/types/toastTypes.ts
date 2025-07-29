/**
 * Tipos para o sistema de toast do EditorialManager
 */

export type ToastType = "success" | "error";

export interface EntryToastMessages {
  success: {
    updated: string;
    saved: string;
  };
  error: {
    updateFailed: string;
    unexpectedError: string;
    validationError: string;
  };
}

export interface ToastConfig {
  message: string;
  type: ToastType;
}
