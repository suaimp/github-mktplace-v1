import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}

function removeTawkChatFromDOM() {
  const script = document.getElementById("tawkto-script");
  if (script) {
    script.remove();
  }
  // Remove o widget do DOM se já estiver renderizado
  const widget = document.querySelector("iframe[src*='tawk.to']")?.parentElement;
  if (widget) {
    widget.remove();
  }
}

const TawkChat = () => {
  const location = useLocation();
  const shouldHide = location.pathname.startsWith("/service-packages") || location.pathname.startsWith("/tickets");

  useEffect(() => {
    if (shouldHide) {
      removeTawkChatFromDOM();
      return;
    }
    if (document.getElementById("tawkto-script")) {
      return;
    }
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.zIndex = "9 !important";
    window.Tawk_API.customStyle = {
      zIndex: "5 !important",
      visibility: {
        desktop: {
          position: "br",
          xOffset: 20,
          yOffset: 30,
        },
        mobile: {
          position: "br",
          xOffset: 5,
          yOffset: 5,
        },
        bubble: {
          rotate: "0deg",
          xOffset: 5,
          yOffset: 5,
        },
      },
    };
    const s1 = document.createElement("script");
    s1.id = "tawkto-script";
    s1.async = true;
    s1.src = "https://embed.tawk.to/60394afb385de407571a81b8/1evfum410";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    const s0 = document.getElementsByTagName("script")[0];
    s0?.parentNode?.insertBefore(s1, s0);
  }, [location.pathname, shouldHide]);

  return null;
};

export default TawkChat;
