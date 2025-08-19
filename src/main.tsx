import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/badge-colors.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./services/context/ThemeContext.tsx";
import "./debug/checkSupabaseConfig";
import { CartProvider } from "./components/marketplace/ShoppingCartContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <CartProvider>
        <AppWrapper>
          <App />
        </AppWrapper>
      </CartProvider>
    </ThemeProvider>
  </StrictMode>
);
