export interface NicheOption {
  text: string;
  icon?: string;
}

export interface NicheRenderingState {
  allNiches: NicheOption[];
  loading: boolean;
  error: string | null;
}

export interface NicheIconProps {
  niche: NicheOption;
  isActive: boolean;
  index: number;
}
