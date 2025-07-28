import { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogos } from "../hooks/useLogos";
import * as Icons from "../icons";
import { useSidebar } from "../services/context/SidebarContext";
import SidebarLogo from "../components/sidebar/SidebarLogo";
import SidebarNav from "../components/sidebar/SidebarNav";
import { supabase } from "../lib/supabase";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  path: string | null;
  parent_id: string | null;
  position: number;
  is_visible: boolean;
  visible_to: "all" | "publisher" | "advertiser" | null;
  requires_permission: string | null;
  subItems?: MenuItem[];
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
}

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { logos, loading } = useLogos();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<"publisher" | "advertiser" | null>(
    null
  );
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeights, setSubMenuHeights] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLUListElement | null>>({});

  useEffect(() => {
    checkUserType();
  }, []);

  useEffect(() => {
    // Load menu items after we know the user type
    if (isAdmin !== null || userRole !== null) {
      loadMenuItems();
    }
  }, [isAdmin, userRole]);

  // Update open dropdowns when location changes
  useEffect(() => {
    updateOpenDropdowns();
  }, [location.pathname, menuItems]);

  // Calculate submenu heights when they change
  useEffect(() => {
    calculateSubMenuHeights();
  }, [menuItems, isExpanded, isHovered, isMobileOpen]);

  // Recalculate heights when window resizes
  useEffect(() => {
    const handleResize = () => {
      calculateSubMenuHeights();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuItems, openSubmenu]);

  async function checkUserType() {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAdmin(false);
        setUserRole(null);
        return;
      }

      // Check if admin
      const { data: adminData } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (adminData) {
        setIsAdmin(true);
        setUserRole(null);
        return;
      }

      // Check if platform user
      const { data: userData } = await supabase
        .from("platform_users")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (userData) {
        setIsAdmin(false);
        setUserRole(userData.role as "publisher" | "advertiser");
      } else {
        setIsAdmin(false);
        setUserRole(null);
      }
    } catch (err) {
      console.error("Error checking user type:", err);
      setIsAdmin(false);
      setUserRole(null);
    }
  }

  async function loadMenuItems() {
    try {
      // Get all menu items
      const { data: items, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_visible", true)
        .order("position", { ascending: true });

      if (error) throw error;

      // Organize items into a tree structure
      const organizedItems = organizeMenuItems(items || []);
      setMenuItems(organizedItems);

      // Log for debugging
      console.log("User role:", userRole);
      console.log("Is admin:", isAdmin);
      console.log("Menu items loaded:", items?.length);
    } catch (err) {
      console.error("Error loading menu items:", err);
    }
  }

  const organizeMenuItems = (items: MenuItem[]): MenuItem[] => {
    const itemMap = new Map<string, MenuItem>();
    const rootItems: MenuItem[] = [];

    items.forEach((item) => {
      itemMap.set(item.id, { ...item, subItems: [] });
    });

    items.forEach((item) => {
      const menuItem = itemMap.get(item.id)!;
      if (item.parent_id && itemMap.has(item.parent_id)) {
        const parent = itemMap.get(item.parent_id)!;
        parent.subItems = parent.subItems || [];
        parent.subItems.push(menuItem);
      } else {
        rootItems.push(menuItem);
      }
    });

    return rootItems;
  };

  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return <Icons.GridIcon />;
    const IconComponent = Icons[iconName as keyof typeof Icons];
    return IconComponent ? <IconComponent /> : <Icons.GridIcon />;
  };

  // Filter menu items based on user role and visibility
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => {
        // Admin can see everything
        if (isAdmin) return true;

        // Check visibility rules for platform users
        if (item.visible_to === "all") return true;
        if (item.visible_to === "publisher" && userRole === "publisher")
          return true;
        if (item.visible_to === "advertiser" && userRole === "advertiser")
          return true;

        return false;
      })
      .map((item) => {
        // Also filter subItems based on the same rules
        if (item.subItems && item.subItems.length > 0) {
          const filteredSubItems = item.subItems.filter((subItem) => {
            if (isAdmin) return true;
            if (subItem.visible_to === "all") return true;
            if (subItem.visible_to === "publisher" && userRole === "publisher")
              return true;
            if (
              subItem.visible_to === "advertiser" &&
              userRole === "advertiser"
            )
              return true;
            return false;
          });

          return {
            ...item,
            subItems: filteredSubItems
          };
        }

        return item;
      })
      .filter((item) => {
        // Remove items with no subItems if they are meant to be a dropdown
        if (!item.path && (!item.subItems || item.subItems.length === 0)) {
          return false;
        }
        return true;
      })
      .filter((item) => item.name !== "Service Packages");
  };

  // Main dashboard menu items
  const navItems: NavItem[] = [
    {
      icon: <Icons.GridIcon />,
      name: "Dashboard",
      path: isAdmin
        ? "/dashboard"
        : userRole === "publisher"
        ? "/publisher/dashboard"
        : "/advertiser/dashboard"
    },
    {
      icon: <Icons.ShoppingCartIcon />,
      name: "Pedidos",
      path: "/orders"
    },
    ...filterMenuItems(menuItems)
      .filter((item) => item.name !== "Cupons")
      .map((item) => ({
        icon: getIconComponent(item.icon),
        name: item.name,
        path: item.path || undefined,
        subItems: item.subItems?.map((subItem) => ({
          name: subItem.name,
          path: subItem.path || ""
        }))
      }))
  ];

  // Admin menu items
  const adminItems: NavItem[] = isAdmin
    ? [
        {
          icon: <Icons.FileIcon />,
          name: "Gerenciador Editorial",
          path: "/editorial"
        },
        {
          icon: <Icons.UserIcon />,
          name: "Usuários",
          path: "/users"
        },
        {
          icon: <Icons.PageIcon />,
          name: "Páginas",
          path: "/pages"
        },
        {
          icon: <Icons.ListIcon />,
          name: "Menu Dash",
          path: "/menu-dash"
        },
        {
          icon: <Icons.FileIcon />,
          name: "Formulários",
          path: "/forms"
        },
        {
          icon: <Icons.BoxIcon />,
          name: "Serviços",
          path: "/service-packages"
        },
        {
          icon: <Icons.TicketIcon />,
          name: "Cupons",
          path: "/tickets"
        }
      ]
    : [];

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Ajustar updateOpenDropdowns para checar subItems corretamente e tipar subItem
  const updateOpenDropdowns = () => {
    // Check main menu items
    navItems.forEach((item, index) => {
      if (
        Array.isArray((item as any).subItems) &&
        ((item as any).subItems as { name: string; path: string }[]).some(
          (subItem) => subItem && subItem.path && isActive(subItem.path)
        )
      ) {
        setOpenSubmenu({ type: "main", index });
      }
    });

    // Check admin menu items
    adminItems.forEach((item, index) => {
      if (
        Array.isArray((item as any).subItems) &&
        ((item as any).subItems as { name: string; path: string }[]).some(
          (subItem) => subItem && subItem.path && isActive(subItem.path)
        )
      ) {
        setOpenSubmenu({ type: "others", index });
      }
    });
  };

  const calculateSubMenuHeights = () => {
    const heights: Record<string, number> = {};

    // Calculate heights for main menu items
    navItems.forEach((item, index) => {
      if (item.subItems) {
        const key = `main-${index}`;
        const ref = subMenuRefs.current[key];
        if (ref) {
          // Get the actual height of the submenu
          heights[key] = ref.scrollHeight;
        }
      }
    });

    // Calculate heights for admin menu items
    adminItems.forEach((item, index) => {
      if (item.subItems) {
        const key = `others-${index}`;
        const ref = subMenuRefs.current[key];
        if (ref) {
          // Get the actual height of the submenu
          heights[key] = ref.scrollHeight;
        }
      }
    });

    setSubMenuHeights(heights);
  };

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev?.type === menuType && prev?.index === index
        ? null
        : { type: menuType, index }
    );
  };

  const handleLogoClick = () => {
    if (isAdmin) {
      navigate("/dashboard");
    } else if (userRole === "publisher") {
      navigate("/publisher/dashboard");
    } else if (userRole === "advertiser") {
      navigate("/advertiser/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col xl:mt-0 top-0 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[240px] px-5"
            : isHovered
            ? "w-[240px] px-5"
            : "w-[70px] px-2"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        xl:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div onClick={handleLogoClick} className="cursor-pointer">
        <SidebarLogo
          logos={logos}
          isExpanded={isExpanded}
          isHovered={isHovered}
          isMobileOpen={isMobileOpen}
          loading={loading}
        />
      </div>

      <SidebarNav
        navItems={navItems}
        othersItems={adminItems}
        isExpanded={isExpanded}
        isHovered={isHovered}
        isMobileOpen={isMobileOpen}
        openSubmenu={openSubmenu}
        subMenuHeights={subMenuHeights}
        isActive={isActive}
        handleSubmenuToggle={handleSubmenuToggle}
        showOthersTitle={isAdmin ?? false} // Fixed: Handle null case with nullish coalescing
        subMenuRefs={subMenuRefs}
      />
    </aside>
  );
}
