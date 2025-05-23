import { useParams } from "react-router-dom";

import { getServiceCards } from "../../context/db-context/services/serviceCardService";
/* components */
import NewCardSettings from "../../components/ServicePackages/cards/NewCardSettings";
import ServiceCard from "../../components/ServicePackages/cards/ServiceCard";
import { PencilIcon, TrashBinIcon } from "../../icons";
import { useServicePackage, useServiceCards } from "./cards/useServicePackage";
import { useCardActions } from "./cards/useCardActions";

const ServicePackageMePage = () => {
  const { id } = useParams();
  const packageData = useServicePackage(id);
  const { cards, setCards, loading, setLoading } = useServiceCards(id);
  const {
    editCardId,
    showEditModal,
    editModalVisible,
    handleEdit,
    handleCloseEditModal,
    handleDelete
  } = useCardActions(setCards, setLoading, id, getServiceCards);

  if (!packageData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h2 className="text-lg text-gray-600 dark:text-gray-300">
          Nenhum dado de pacote encontrado.
        </h2>
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
          {loading ? (
            <div>Carregando pacotes...</div>
          ) : cards.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <h2 className="text-lg text-gray-600 dark:text-gray-300">
                Nenhum pacote cadastrado para este serviço.
              </h2>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cards.map((card) => (
                <div key={card.id} className="relative w-full">
                  <div className="absolute top-2 right-2 flex flex-row gap-2 z-10">
                    <button
                      className="w-10 h-10 rounded bg-gray-100 text-gray-700 hover:bg-gray-300 flex items-center justify-center shadow-md transition-colors duration-150"
                      title="Editar"
                      onClick={() => handleEdit(card.id)}
                    >
                      <input
                        type="radio"
                        name={`action-${card.id}`}
                        className="sr-only"
                        tabIndex={-1}
                      />
                      <PencilIcon className="w-5 h-5 text-brand-500" />
                    </button>
                    <button
                      className="w-10 h-10 rounded bg-gray-100 text-gray-700 hover:bg-gray-300 flex items-center justify-center shadow-md transition-colors duration-150"
                      title="Excluir"
                      onClick={() => handleDelete(card.id)}
                    >
                      <input
                        type="radio"
                        name={`action-${card.id}`}
                        className="sr-only"
                        tabIndex={-1}
                      />
                      <TrashBinIcon className="w-5 h-5 text-error-500" />
                    </button>
                  </div>
                  <ServiceCard
                    id={card.id}
                    service_id={card.service_id}
                    title={card.title}
                    subtitle={card.subtitle}
                    price={card.price}
                    benefits={card.benefits}
                    not_benefits={card.not_benefits}
                    period={card.period}
                    created_at={card.created_at}
                    updated_at={card.updated_at}
                    buttonText="Contratar"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <NewCardSettings
          field={{ label: "Novo Pacote", service_id: packageData.id }}
          onSuccess={() => {
            setLoading(true);
            getServiceCards().then((data) => {
              setCards(
                data ? data.filter((card) => card.service_id === id) : []
              );
              setLoading(false);
            });
          }}
        />
        {editModalVisible && editCardId && (
          <div
            className="absolute inset-0 z-[99999] bg-gray-400/50 backdrop-blur-[--background-blur] dark:text-white"
            onMouseDown={handleCloseEditModal}
          >
            <div
              className={
                `absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-lg border-l border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out ` +
                (showEditModal ? "translate-x-0" : "translate-x-full")
              }
              style={{ minWidth: 340 }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 z-10"
                onClick={handleCloseEditModal}
                aria-label="Fechar"
                type="button"
              >
                ✕
              </button>
              <NewCardSettings
                field={{
                  label: "Editar Pacote",
                  service_id: packageData.id,
                  id: editCardId
                }}
                onSuccess={() => {
                  handleCloseEditModal();
                  if (id) {
                    setLoading(true);
                    getServiceCards().then((data) => {
                      setCards(
                        data
                          ? data.filter((card) => card.service_id === id)
                          : []
                      );
                      setLoading(false);
                    });
                  }
                }}
              />
            </div>
          </div>
        )}
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
