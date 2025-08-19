/**
 * Tema visual para o Chat Modal
 * Responsabilidade única: Definir cores e variações de tema
 */

export const chatTheme = {
  colors: {
    primary: {
      brand: "bg-brand-500",
      brandHover: "hover:bg-brand-600",
      success: "bg-success-500",
      error: "bg-red-500",
      warning: "bg-yellow-400"
    },
    text: {
      primary: "text-gray-800 dark:text-white/90",
      secondary: "text-gray-500 dark:text-gray-400",
      white: "text-white dark:text-white/90",
      muted: "text-theme-xs text-gray-500 dark:text-gray-400"
    },
    background: {
      primary: "bg-white dark:bg-white/[0.03]",
      secondary: "bg-gray-100 dark:bg-white/5",
      transparent: "bg-transparent"
    },
    border: {
      primary: "border-gray-200 dark:border-gray-800",
      white: "border-white dark:border-gray-900"
    }
  },
  spacing: {
    container: "p-5 xl:p-6",
    header: "px-5 py-4 xl:px-6",
    message: "px-3 py-2",
    input: "p-3"
  },
  borderRadius: {
    full: "rounded-full",
    lg: "rounded-lg",
    xl: "rounded-2xl",
    messageSent: "rounded-lg rounded-tr-sm",
    messageReceived: "rounded-lg rounded-tl-sm"
  }
} as const;

export type ChatTheme = typeof chatTheme;
