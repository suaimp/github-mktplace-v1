// Componentes principais
import FeedbackFormComponent from "./FeedbackForm";
export { default as FeedbackForm } from "./FeedbackForm";
export { default as FeedbackManager } from "./FeedbackManager";
export { default as FeedbackExample } from "./FeedbackExample";

// Export padrão para compatibilidade
export default FeedbackFormComponent;

// Types e constantes
export * from "./types/feedback";

// Actions e helpers
export * from "./actions/feedbackActions";
