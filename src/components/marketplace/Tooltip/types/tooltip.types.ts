export type TooltipPlacement = 'top' | 'bottom';
export type TooltipAlignX = 'center' | 'left' | 'right';

export interface TooltipPosition {
  placement: TooltipPlacement;
  alignX: TooltipAlignX;
}

export interface TooltipContainerBounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}
