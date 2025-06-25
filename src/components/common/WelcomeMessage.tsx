import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface WelcomeMessageProps {
  className?: string;
}

export default function WelcomeMessage({
  className = ""
}: WelcomeMessageProps) {
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      console.log("WelcomeMessage: Carregando dados do usuário...");

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        console.log("WelcomeMessage: Usuário não encontrado");
        setLoading(false);
        return;
      }

      console.log("WelcomeMessage: Usuário autenticado:", user.id);

      // Primeiro tenta buscar no perfil de platform_users (como no PlatformUserProfile)
      const { data: platformProfile, error: platformError } = await supabase
        .from("platform_users")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle();

      console.log("WelcomeMessage: Platform query result:", {
        platformProfile,
        platformError
      });
      if (platformProfile?.first_name) {
        console.log(
          "WelcomeMessage: Nome encontrado nos platform_users:",
          platformProfile.first_name
        );
        setUserName(platformProfile.first_name);
        setLoading(false);
        return;
      }

      // Se não encontrou nos platform_users, tenta buscar nos admins
      const { data: adminProfile, error: adminError } = await supabase
        .from("admins")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle();

      console.log("WelcomeMessage: Admin query result:", {
        adminProfile,
        adminError
      });
      if (adminProfile?.first_name) {
        console.log(
          "WelcomeMessage: Nome encontrado nos admins:",
          adminProfile.first_name
        );
        setUserName(adminProfile.first_name);
        setLoading(false);
        return;
      }

      // Fallback: usa dados do user_metadata ou email
      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Usuário";

      console.log("WelcomeMessage: Usando fallback para nome:", displayName);
      setUserName(displayName);
      setLoading(false);
    } catch (error) {
      console.error(
        "WelcomeMessage: Erro ao carregar dados do usuário:",
        error
      );
      setUserName("Usuário");
      setLoading(false);
    }
  }

  const handleBuyClick = () => {
    navigate("/pages/sites-e-portais");
  };
  if (loading) {
    return (
      <div className={`rounded-lg p-8 text-center ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 mx-auto w-64"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-6 mx-auto w-96"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-32"></div>
        </div>
      </div>
    );
  }
  return (
    <div className={`rounded-lg p-8 text-center ${className}`}>
      <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
        Olá, {userName}!
      </h1>{" "}
      <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
        Bem-vindo à plataforma de mídia da Sua Imprensa! Adquira artigos de
        qualidade e anuncie seus produtos para maximizar o alcance da sua marca.
      </p>
      <button
        onClick={handleBuyClick}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg"
      >
        Comprar
      </button>
    </div>
  );
}
