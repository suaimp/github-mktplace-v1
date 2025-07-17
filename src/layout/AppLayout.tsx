import {
  SidebarProvider,
  useSidebar,
} from "../services/context/SidebarContext";
import { Outlet, useLocation } from "react-router-dom";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import TawkChat from "../components/TawkChat/TawkChat";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen, toggleMobileSidebar } =
    useSidebar();

  return (
    <div className="w-full min-h-screen xl:flex">
      <div>
        <AppSidebar />
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
            onClick={toggleMobileSidebar}
          />
        )}
      </div>
      <div
        className={`w-full flex-1 transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded || isHovered ? "xl:ml-[290px]" : "xl:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader onToggle={toggleMobileSidebar} />
        <div className="w-full main-content p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC<{ hideTawkChat?: boolean }> = ({
  hideTawkChat = false,
}) => {
  const location = useLocation();
  const isTicketOrServiceRoute = location.pathname.startsWith("/tickets") || location.pathname.startsWith("/service-packages");
  return (
    <SidebarProvider>
      <LayoutContent />
      {!hideTawkChat && !isTicketOrServiceRoute && <TawkChat />}
    </SidebarProvider>
  );
};

export default AppLayout;
