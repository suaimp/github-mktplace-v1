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
      <div className={`rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-48"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-64"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-80"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mt-4 w-56"></div>
        </div>
      </div>
    );
  }
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 ${className}`}>
      <div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white/90">
          Olá, {userName} <span aria-label="emoji">👋</span>
        </h1>
        <h2 className="text-lg font-normal text-gray-700 dark:text-white/80 mb-2">
          Seja bem-vindo à sua plataforma de backlinks!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Descubra oportunidades em portais de alta relevância e aumente a autoridade do seu site com estratégias de SEO eficazes.
        </p>
        <button
          onClick={handleBuyClick}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
        >
          Ver oportunidades de backlinks
        </button>
      </div>
    </div>
  );
}
