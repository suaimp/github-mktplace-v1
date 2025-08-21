import { useTheme } from "../../../../services/context/ThemeContext";

/**
 * Hook para gerenciar a exibição do tema atual
 * Responsabilidade: Fornecer informações sobre o estado atual do tema
 */
export const useThemeDisplay = () => {
  const { theme, toggleTheme } = useTheme();
  
  const getCurrentThemeLabel = () => {
    return theme === 'dark' ? 'Claro' : 'Escuro';
  };

  const getThemeIcon = (): 'sun' | 'moon' => {
    return theme === 'dark' ? 'sun' : 'moon';
  };

  return {
    currentTheme: theme,
    themeLabel: getCurrentThemeLabel(),
    themeIcon: getThemeIcon(),
    toggleTheme
  };
};
