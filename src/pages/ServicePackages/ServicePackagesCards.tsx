import { useEffect, useState } from "react";
import { getCurrentUser } from "../../lib/supabase";
import { supabase } from "../../lib/supabase";

const ServicePackageMePage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndPackages = async () => {
      setLoading(true);
      setError(null);
      const user = await getCurrentUser();
      if (user?.user?.id) {
        setUserId(user.user.id);
        console.log(userId);
        // Busca todos os pacotes de serviço do usuário
        const { data, error } = await supabase
          .from("publisher_services")
          .select("*")
          .eq("publisher_id", user.user.id);
        if (error) {
          setError("Erro ao buscar pacotes de serviço.");
          setPackages([]);
        } else {
          setPackages(data || []);
        }
      } else {
        setError("Usuário não encontrado.");
      }
      setLoading(false);
    };
    fetchUserAndPackages();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1>Cards de Serviço do Usuário</h1>
      {packages.length === 0 ? (
        <div>Nenhum pacote de serviço encontrado.</div>
      ) : (
        <ul className="mt-4 space-y-4">
          {packages.map((pkg) => (
            <li
              key={pkg.id}
              className="border rounded p-4 bg-white dark:bg-gray-900"
            >
              <div>
                <strong>ID:</strong> {pkg.current_id}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ServicePackageMePage;
