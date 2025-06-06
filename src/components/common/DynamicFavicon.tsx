import { useFavicon } from '../../hooks/useFavicon';
import { useEffect } from 'react';

export default function DynamicFavicon() {
  const { favicon } = useFavicon();

  useEffect(() => {
    // Update favicon link tag
    const linkElement = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (linkElement) {
      linkElement.href = favicon;
    }
  }, [favicon]);

  // Don't render anything - we're just updating the existing link tag
  return null;
}