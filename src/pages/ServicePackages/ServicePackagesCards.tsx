import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
/* components */
import NewCardSettings from "../../components/ServicePackages/cards/NewCardSettings";
import ServiceCard from "../../components/ServicePackages/cards/ServiceCard";

const ServicePackageMePage = () => {
  const { id } = useParams();
  const [packageData, setPackageData] = useState<any>(null);

  useEffect(() => {
    const fetchPackage = async () => {
      if (!id) {
        console.log("ID da URL não encontrado");
        return;
      }
      const { data, error } = await supabase
        .from("publisher_services")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log("Erro ao buscar pacote:", error);
        setPackageData(null);
      } else {
        setPackageData(data);
      }
    };
    fetchPackage();
  }, [id]);

  if (!packageData) {
    return (
      <div>
        <h1>Carregando...</h1>
      </div>
    );
  }

  if (packageData.service_type === "Conteúdo") {
    return (
      <section className="flex min-h-screen">
        <div className="flex-1 pr-0 md:pr-4 lg:pr-8 xl:pr-12 2xl:pr-16">
          <h2
            className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90"
            x-text="pageName"
          >
            Adicionar pacotes para {packageData.service_title}
          </h2>

          {/* Conteúdo principal */}
          <ServiceCard />
        </div>
        {/* Sidebar fixa à direita */}
        <NewCardSettings
          field={{ label: "Novo Pacote", service_id: packageData.id }}
        />
      </section>
    );
  } else {
    return (
      <div>
        <h2>O serviço não é do tipo "Conteúdo"</h2>
      </div>
    );
  }
};

export default ServicePackageMePage;
