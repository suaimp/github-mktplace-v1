import { useNavigate } from "react-router-dom";

/**
 * Hook para navegação específica da loja
 * Segue o princípio de responsabilidade única para navegação do checkout
 */
export function useShopNavigation() {
  const navigate = useNavigate();

  /**
   * Redireciona para a página principal da loja (sites e portais)
   */
  const goToShop = () => {
    navigate("/pages/sites-e-portais");
  };

  /**
   * Redireciona para a página inicial baseada no contexto
   */
  const goToHome = () => {
    navigate("/pages/sites-e-portais");
  };

  return {
    goToShop,
    goToHome
  };
}
