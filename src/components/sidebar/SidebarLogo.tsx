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

  return (
    <div
      className={`py-8 flex ${
        !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
      }`}
    >
      {isExpanded || isHovered || isMobileOpen ? (
        <>
          <img className="dark:hidden h-8" src={logos.light} alt="Logo" />
          <img className="hidden dark:block h-8" src={logos.dark} alt="Logo" />
        </>
      ) : (
        <img src={logos.icon} alt="Logo" className="h-8 w-8" />
      )}
    </div>
  );
}
