import { Link } from "react-router";
import { MutableRefObject } from "react";
import { ChevronDownIcon, HorizontaLDots } from "../../icons";

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
}

interface SidebarNavProps {
  navItems: NavItem[];
  othersItems: NavItem[];
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  openSubmenu: { type: "main" | "others"; index: number } | null;
  subMenuHeights: Record<string, number>;
  isActive: (path: string) => boolean;
  handleSubmenuToggle: (index: number, menuType: "main" | "others") => void;
  showOthersTitle?: boolean;
  subMenuRefs: MutableRefObject<Record<string, HTMLUListElement | null>>;
}

export default function SidebarNav({
  navItems,
  othersItems,
  isExpanded,
  isHovered,
  isMobileOpen,
  openSubmenu,
  subMenuHeights,
  isActive,
  handleSubmenuToggle,
  showOthersTitle = true,
  subMenuRefs
}: SidebarNavProps) {
  const renderMenuItems = (items: any[], menuType: "main" | "others") => (
    <ul
      className={`flex flex-col gap-4 ${
        menuType === "main" ? "menu-principal" : "menu-admin"
      }`}
    >
      {items.map((item, index) => (
        <li key={item.name}>
          {item.subItems ? (
            <>
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group cursor-pointer ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {item.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className="menu-item-text">{item.name}</span>
                    <ChevronDownIcon
                      className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                          ? "rotate-180 text-brand-500"
                          : ""
                      }`}
                    />
                  </>
                )}
              </button>
              {(isExpanded || isHovered || isMobileOpen) && (
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? `${
                            (subMenuHeights[`${menuType}-${index}`] || 0) + 10
                          }px`
                        : "0px"
                  }}
                >
                  <ul
                    className="mt-2 space-y-1 ml-9"
                    ref={(el) => {
                      subMenuRefs.current[`${menuType}-${index}`] = el;
                    }}
                  >
                    {item.subItems.map((subItem: any) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`menu-dropdown-badge ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                }`}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`menu-dropdown-badge ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                }`}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            item.path && (
              <Link
                to={item.path}
                className={`menu-item group ${
                  isActive(item.path)
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(item.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {item.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{item.name}</span>
                )}
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <nav className="mb-6 menu-sidebar">
      <div className="flex flex-col gap-4">
        <div>
          <h2
            className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
              !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
            }`}
          >
            {isExpanded || isHovered || isMobileOpen ? (
              "Menu"
            ) : (
              <HorizontaLDots className="size-6" />
            )}
          </h2>
          {renderMenuItems(navItems, "main")}
        </div>
        {othersItems.length > 0 && showOthersTitle && (
          <div className="menu-admin">
            {showOthersTitle && (
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Administration"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
            )}
            {renderMenuItems(othersItems, "others")}
          </div>
        )}
      </div>
    </nav>
  );
}