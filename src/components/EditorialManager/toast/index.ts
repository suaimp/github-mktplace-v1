/**
 * Sistema de Toast para EditorialManager
 * Substitui o ToastMessage personalizado pelo sistema global showToast
 */

// Hooks
export { useEntryToast } from "./hooks/useEntryToast";

// Services
export { EntryToastService } from "./services/EntryToastService";

// Types
export type { 
  ToastType, 
  EntryToastMessages, 
  ToastConfig 
} from "./types/toastTypes";
