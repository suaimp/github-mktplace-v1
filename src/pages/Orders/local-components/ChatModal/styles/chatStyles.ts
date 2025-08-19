/**
 * Estilos para o Chat Modal
 * Responsabilidade única: Definir estilos visuais do chat
 */

export const chatStyles = {
  // Container principal - Modal size and background
  container: "relative flex h-[600px] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900",
  
  // Header do chat
  header: {
    wrapper: "sticky flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800 xl:px-6",
    userInfo: "flex items-center gap-3",
    avatar: {
      container: "relative h-12 w-full max-w-[48px] rounded-full",
      image: "h-full w-full overflow-hidden rounded-full object-cover object-center",
      statusIndicator: "absolute bottom-0 right-0 block h-3 w-3 rounded-full border-[1.5px] border-white bg-success-500 dark:border-gray-900"
    },
    userName: "text-sm font-medium text-gray-500 dark:text-gray-400"
  },

  // Área de mensagens
  messages: {
    container: "custom-scrollbar max-h-full flex-1 space-y-6 overflow-auto p-5 xl:space-y-8 xl:p-6",
    
    // Mensagem recebida (outro usuário)
    received: {
      wrapper: "max-w-[350px]",
      messageGroup: "flex items-start gap-4",
      avatar: {
        container: "h-10 w-full max-w-10 rounded-full",
        image: "h-full w-full overflow-hidden rounded-full object-cover object-center"
      },
      content: {
        wrapper: "div",
        bubble: "rounded-lg rounded-tl-sm bg-gray-100 px-3 py-2 dark:bg-white/5",
        text: "text-sm text-gray-800 dark:text-white/90",
        timestamp: "mt-2 text-xs text-gray-500 dark:text-gray-400"
      }
    },

    // Mensagem enviada (usuário atual)
    sent: {
      wrapper: "ml-auto max-w-[350px] text-right",
      content: {
        bubble: "ml-auto max-w-max rounded-lg rounded-tr-sm bg-brand-500 px-3 py-2 dark:bg-brand-500",
        text: "text-sm text-white dark:text-white/90",
        timestamp: "mt-2 text-xs text-gray-500 dark:text-gray-400"
      }
    }
  },

  // Área de input
  input: {
    container: "sticky bottom-0 border-t border-gray-200 p-3 dark:border-gray-800",
    form: "flex items-center justify-between",
    inputWrapper: "relative w-full",
    input: "h-9 w-full border-none bg-transparent pl-12 pr-5 text-sm text-gray-800 outline-hidden placeholder:text-gray-400 focus:border-0 focus:ring-0 dark:text-white/90",
    inputPadding: "padding: 10px",
    buttonsWrapper: "flex items-center",
    sendButton: "ml-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white hover:bg-brand-600 xl:ml-5"
  },

  // Estados visuais
  states: {
    online: "bg-success-500",
    offline: "bg-gray-400",
    connecting: "bg-yellow-400"
  }
} as const;

// Tipos para os estilos
export type ChatStyles = typeof chatStyles;
export type MessageType = 'sent' | 'received';
export type UserStatus = 'online' | 'offline' | 'connecting';
