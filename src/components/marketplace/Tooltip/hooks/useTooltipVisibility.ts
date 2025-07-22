import { useEffect, useRef, useState } from 'react';

interface UseTooltipVisibilityResult {
  isVisible: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
}

export function useTooltipVisibility(): UseTooltipVisibilityResult {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = triggerRef.current;
    if (!element) return;

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);
    const handleFocus = () => setIsVisible(true);
    const handleBlur = () => setIsVisible(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, []);

  return { isVisible, triggerRef };
}
