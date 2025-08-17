import { TooltipPosition, TooltipContainerBounds } from '../types/tooltip.types';

/**
 * Encontra o container de scroll pai do elemento
 */
export function findScrollContainer(element: HTMLElement): HTMLElement | Window {
  let parent = element.parentElement;
  
  while (parent) {
    const overflowY = getComputedStyle(parent).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent;
    }
    parent = parent.parentElement;
  }
  
  return window;
}

/**
 * Calcula os limites do container de scroll
 */
export function getContainerBounds(container: HTMLElement | Window): TooltipContainerBounds {
  if (container instanceof Window) {
    return {
      top: 0,
      bottom: window.innerHeight,
      left: 0,
      right: window.innerWidth
    };
  }
  
  const rect = container.getBoundingClientRect();
  return {
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right
  };
}

/**
 * Calcula a posição ideal do tooltip
 */
export function calculateTooltipPosition(
  triggerElement: HTMLElement,
  tooltipElement: HTMLDivElement
): TooltipPosition {
  const triggerRect = triggerElement.getBoundingClientRect();
  const tooltipRect = tooltipElement.getBoundingClientRect();
  
  // Encontrar container de scroll
  const scrollContainer = findScrollContainer(triggerElement);
  const containerBounds = getContainerBounds(scrollContainer);
  
  // Calcular espaços disponíveis
  const spaceBelow = containerBounds.bottom - triggerRect.bottom;
  const spaceAbove = triggerRect.top - containerBounds.top;
  const tooltipHeight = tooltipRect.height;
  
  // Determinar posicionamento vertical
  const placement = (spaceBelow < tooltipHeight + 8 && spaceAbove > tooltipHeight + 8) 
    ? 'top' 
    : 'bottom';
  
  // Calcular posicionamento horizontal
  const tooltipWidth = tooltipRect.width;
  const triggerCenter = (triggerRect.left + triggerRect.right) / 2;
  const leftEdge = triggerCenter - tooltipWidth / 2;
  const rightEdge = triggerCenter + tooltipWidth / 2;
  const padding = 8;
  
  let alignX: 'center' | 'left' | 'right' = 'center';
  
  // Em telas pequenas (< 570px), priorizar os limites da viewport
  const screenWidth = window.innerWidth;
  const isSmallScreen = screenWidth < 570;
  
  if (isSmallScreen) {
    const viewportPadding = 16;
    if (leftEdge < viewportPadding) {
      alignX = 'left';
    } else if (rightEdge > screenWidth - viewportPadding) {
      alignX = 'right';
    }
  } else {
    // Em telas maiores, usar a lógica baseada no container
    if (leftEdge < containerBounds.left + padding) {
      alignX = 'left';
    } else if (rightEdge > containerBounds.right - padding) {
      alignX = 'right';
    }
  }
  
  return { placement, alignX };
}
