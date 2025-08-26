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
 
      
      const testUrl = async (url: string, name: string) => {
        try {
          //@ts-ignore
          const response = await fetch(url);
 
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
