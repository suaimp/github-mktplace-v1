/**
 * Tipos para o componente de navegação por tabs
 */

export interface Tab {
  /** Identificador único da tab */
  id: string;
  /** Rótulo exibido na tab */
  label: string;
  /** Se a tab está desabilitada */
  disabled?: boolean;
  /** Contador de itens para exibir no badge (opcional) */
  count?: number;
}

export interface TabNavigationProps {
  /** Lista de tabs disponíveis */
  tabs: Tab[];
  /** ID da tab ativa atualmente */
  activeTabId: string;
  /** Callback executado quando uma tab é selecionada */
  onTabChange: (tabId: string) => void;
  /** Classes CSS adicionais para o container */
  className?: string;
  /** Se deve exibir como modo compacto */
  compact?: boolean;
  /** Largura mínima customizada para os botões */
  buttonMinWidth?: string;
}

export interface TabButtonProps {
  /** Dados da tab */
  tab: Tab;
  /** Se a tab está ativa */
  isActive: boolean;
  /** Callback de clique */
  onClick: (tabId: string) => void;
  /** Se deve exibir como modo compacto */
  compact?: boolean;
  /** Largura mínima customizada */
  minWidth?: string;
}
