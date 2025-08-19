import { useEffect } from "react";

interface SidebarLogoProps {
  logos: {
    light: string;
    dark: string;
    icon: string;
  };
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  loading?: boolean;
}

export default function SidebarLogo({
  logos,
  isExpanded,
  isHovered,
  isMobileOpen,
  loading
}: SidebarLogoProps) {
  console.log('🖼️ [SidebarLogo] Rendering with props:', {
    logos,
    isExpanded,
    isHovered,
    isMobileOpen,
    loading,
    timestamp: new Date().toISOString()
  });

  if (loading) {
    return (
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded dark:bg-gray-800"></div>
      </div>
    );
  }

  // Verificar se as URLs das imagens estão acessíveis
  useEffect(() => {
    const testImageUrls = async () => {
      console.log('[SidebarLogo] Testing image URLs...');
      
      const testUrl = async (url: string, name: string) => {
        try {
          const response = await fetch(url);
          console.log(`[SidebarLogo] ${name} URL test:`, {
            url,
            status: response.status,
            ok: response.ok,
            contentType: response.headers.get('content-type')
          });
        } catch (error) {
          console.error(`[SidebarLogo] ${name} URL test failed:`, {
            url,
            error
          });
        }
      };

      if (logos.light) await testUrl(logos.light, 'Light logo');
      if (logos.dark) await testUrl(logos.dark, 'Dark logo');
      if (logos.icon) await testUrl(logos.icon, 'Icon logo');
    };

    testImageUrls();
  }, [logos]);

  console.log('[SidebarLogo] About to render:', {
    condition: isExpanded || isHovered || isMobileOpen,
    isExpanded,
    isHovered,
    isMobileOpen,
    logos,
    timestamp: new Date().toISOString()
  });

  return (
    <div
      className={`py-8 flex ${
        !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
      }`}
    >
      {isExpanded || isHovered || isMobileOpen ? (
        <>
          <img 
            className="dark:hidden h-8" 
            src={logos.light} 
            alt="Logo" 
            onLoad={(e) => {
              const target = e.target as HTMLImageElement;
              console.log('✅ [SidebarLogo] Light logo loaded successfully:', {
                src: logos.light,
                naturalWidth: target.naturalWidth,
                naturalHeight: target.naturalHeight,
                complete: target.complete
              });
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error('❌ [SidebarLogo] Light logo failed to load:', {
                src: logos.light,
                complete: target.complete
              });
            }}
          />
          <img 
            className="hidden dark:block h-8" 
            src={logos.dark} 
            alt="Logo" 
            onLoad={(e) => {
              const target = e.target as HTMLImageElement;
              console.log('✅ [SidebarLogo] Dark logo loaded successfully:', {
                src: logos.dark,
                naturalWidth: target.naturalWidth,
                naturalHeight: target.naturalHeight,
                complete: target.complete
              });
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error('❌ [SidebarLogo] Dark logo failed to load:', {
                src: logos.dark,
                complete: target.complete
              });
            }}
          />
        </>
      ) : (
        <img 
          src={logos.icon} 
          alt="Logo" 
          className="h-8 w-8" 
          onLoad={(e) => {
            const target = e.target as HTMLImageElement;
            console.log('✅ [SidebarLogo] Icon logo loaded successfully:', {
              src: logos.icon,
              naturalWidth: target.naturalWidth,
              naturalHeight: target.naturalHeight,
              complete: target.complete
            });
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            console.error('❌ [SidebarLogo] Icon logo failed to load:', {
              src: logos.icon,
              complete: target.complete
            });
          }}
        />
      )}
    </div>
  );
}
