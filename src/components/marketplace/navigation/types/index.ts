import { ReactNode } from 'react';
import { Tab } from '../../../tables/TabNavigation/types';

/**
 * Tab estendida com suporte a ícones para o marketplace
 */
export interface MarketplaceTab extends Tab {
  /** Ícone da tab (componente React) */
  icon?: ReactNode;
}

/**
 * Props específicas para navegação do marketplace
 */
export interface MarketplaceTabNavigationProps {
  /** Lista de tabs com ícones */
  tabs: MarketplaceTab[];
  /** ID da tab ativa atualmente */
  activeTabId: string;
  /** Callback executado quando uma tab é selecionada */
  onTabChange: (tabId: string) => void;
  /** Classes CSS adicionais */
  className?: string;
  /** Modo compacto */
  compact?: boolean;
}
