/**
 * Serviço para cores de classificação com suporte ao dark mode
 * Responsabilidade: Centralizar a lógica de cores para classificações de DA
 */

export interface ClassificationColors {
  light: {
    backgroundColor: string;
    textColor: string;
  };
  dark: {
    backgroundColor: string;
    textColor: string;
  };
}

export interface ClassificationColorScheme {
  A: ClassificationColors;
  B: ClassificationColors;
  C: ClassificationColors;
  D: ClassificationColors;
  F: ClassificationColors;
}

export class ClassificationColorService {
  
  /**
   * Esquema de cores para classificações com suporte ao dark mode
   */
  private static readonly colorScheme: ClassificationColorScheme = {
    A: {
      light: {
        backgroundColor: '#9EF2C9',
        textColor: '#007C65'
      },
      dark: {
        backgroundColor: '#065f46', // Verde escuro
        textColor: '#a7f3d0'       // Verde claro
      }
    },
    B: {
      light: {
        backgroundColor: '#C4E5FE',
        textColor: '#006DCA'
      },
      dark: {
        backgroundColor: '#1e3a8a', // Azul escuro
        textColor: '#93c5fd'       // Azul claro
      }
    },
    C: {
      light: {
        backgroundColor: '#EDD9FF',
        textColor: '#8649E1'
      },
      dark: {
        backgroundColor: '#581c87', // Roxo escuro
        textColor: '#d8b4fe'       // Roxo claro
      }
    },
    D: {
      light: {
        backgroundColor: '#FCE081',
        textColor: '#A75800'
      },
      dark: {
        backgroundColor: '#92400e', // Amarelo/laranja escuro
        textColor: '#fcd34d'       // Amarelo claro
      }
    },
    F: {
      light: {
        backgroundColor: '#f9b4b4',
        textColor: '#b84f53'
      },
      dark: {
        backgroundColor: '#991b1b', // Vermelho escuro
        textColor: '#fca5a5'       // Vermelho claro
      }
    }
  };

  /**
   * Obter cores para uma classificação específica
   */
  static getColorsForClassification(
    classification: 'A' | 'B' | 'C' | 'D' | 'F',
    isDarkMode: boolean = false
  ): { backgroundColor: string; textColor: string } {
    const scheme = this.colorScheme[classification];
    return isDarkMode ? scheme.dark : scheme.light;
  }

  /**
   * Obter cores baseadas no valor numérico
   */
  static getColorsByValue(
    value: number,
    isDarkMode: boolean = false
  ): { letter: string; backgroundColor: string; textColor: string } {
    let classification: 'A' | 'B' | 'C' | 'D' | 'F';
    
    if (value >= 80) {
      classification = 'A';
    } else if (value >= 60) {
      classification = 'B';
    } else if (value >= 40) {
      classification = 'C';
    } else if (value >= 20) {
      classification = 'D';
    } else {
      classification = 'F';
    }

    const colors = this.getColorsForClassification(classification, isDarkMode);
    
    return {
      letter: classification,
      backgroundColor: colors.backgroundColor,
      textColor: colors.textColor
    };
  }

  /**
   * Gerar classes CSS para Tailwind baseadas no valor
   */
  static getTailwindClasses(
    classification: 'A' | 'B' | 'C' | 'D' | 'F'
  ): { backgroundClass: string; textClass: string } {
    const classMap = {
      A: {
        backgroundClass: 'bg-green-100 dark:bg-green-800',
        textClass: 'text-green-800 dark:text-green-200'
      },
      B: {
        backgroundClass: 'bg-blue-100 dark:bg-blue-800',
        textClass: 'text-blue-800 dark:text-blue-200'
      },
      C: {
        backgroundClass: 'bg-purple-100 dark:bg-purple-800',
        textClass: 'text-purple-800 dark:text-purple-200'
      },
      D: {
        backgroundClass: 'bg-yellow-100 dark:bg-yellow-800',
        textClass: 'text-yellow-800 dark:text-yellow-200'
      },
      F: {
        backgroundClass: 'bg-red-100 dark:bg-red-800',
        textClass: 'text-red-800 dark:text-red-200'
      }
    };

    return classMap[classification];
  }

  /**
   * Detectar se está em dark mode baseado na classe do documento
   */
  static isDarkMode(): boolean {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  }

  /**
   * Obter todas as classificações com suas cores
   */
  static getAllClassifications(isDarkMode: boolean = false): Array<{
    id: 'A' | 'B' | 'C' | 'D' | 'F';
    label: string;
    minValue: number;
    maxValue: number;
    backgroundColor: string;
    textColor: string;
    description: string;
  }> {
    const classifications = [
      { id: 'A' as const, label: 'Autoridade Elevada', minValue: 80, maxValue: 100 },
      { id: 'B' as const, label: 'Autoridade Relevante', minValue: 60, maxValue: 79 },
      { id: 'C' as const, label: 'Autoridade Média', minValue: 40, maxValue: 59 },
      { id: 'D' as const, label: 'Autoridade Moderada', minValue: 20, maxValue: 39 },
      { id: 'F' as const, label: 'Autoridade Inicial', minValue: 0, maxValue: 19 }
    ];

    return classifications.map(item => {
      const colors = this.getColorsForClassification(item.id, isDarkMode);
      return {
        ...item,
        backgroundColor: colors.backgroundColor,
        textColor: colors.textColor,
        description: `${item.minValue}-${item.maxValue}`
      };
    });
  }
}
