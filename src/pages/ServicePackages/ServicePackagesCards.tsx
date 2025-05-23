import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../../lib/supabase";

const ServicePackageMePage = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user?.user?.id) {
        setUserId(user.user.id);
        // Aqui você pode buscar os dados do usuário usando o id
      }
    };
    fetchUser();
  }, []);

  if (!userId) return <div>Carregando...</div>;

  return (
    <div>
      {/* Renderize aqui o conteúdo do pacote de serviço do usuário */}
      <h1>Cards de Serviço do Usuário</h1>

      {/* ... */}
    </div>
  );
};

export default ServicePackageMePage;
