import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}

const TawkChat = () => {
  const location = useLocation();
  const shouldHide = location.pathname.includes("/service-packages");
  useEffect(() => {
    console.log('[TawkChat] pathname:', location.pathname);
    if (shouldHide) {
      console.log('[TawkChat] Ocultando chat nesta rota.');
      return;
    }
    if (document.getElementById("tawkto-script")) {
      console.log('[TawkChat] Script já inserido.');
      return;
    }
    console.log('[TawkChat] Inserindo script do TawkChat...');

    // Define estilo personalizado antes do script
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.zIndex = "9 !important";
    window.Tawk_API.customStyle = {
      zIndex: "5 !important",
      visibility: {
        desktop: {
          position: "br",
          xOffset: 20,
          yOffset: 30, // 10px mais acima
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
  }, []);

  return null;
};

export default TawkChat;
