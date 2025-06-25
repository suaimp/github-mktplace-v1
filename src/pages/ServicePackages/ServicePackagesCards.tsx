import { useParams } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy
} from "@dnd-kit/sortable";

import type { DragEndEvent } from "@dnd-kit/core";

import { getServiceCards } from "../../services/db-services/marketplace-services/card/serviceCardService";
/* components */
import NewCardSettings from "../../components/ServicePackages/cards/NewCardSettings";
import { useServicePackage, useServiceCards } from "./cards/useServicePackage";
import { useCardActions } from "./cards/useCardActions";
import { SortableCard } from "./cards/SortableCard";

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
    handleDelete,
    handleCardsOrderChange // novo método do hook
  } = useCardActions(setCards, setLoading);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    })
  );

  const handleDndKitDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((c) => c.id === active.id);
      const newIndex = cards.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(cards, oldIndex, newIndex);
      handleCardsOrderChange(newOrder); // usa o método do hook
    }
  };

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
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-semibold text-gray-800 dark:text-white/90"
              x-text="pageName"
            >
              Adicionar pacotes para {packageData.service_title}
            </h2>
            <button
              type="button"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors text-sm font-medium"
              onClick={() => window.history.back()}
            >
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 18 18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.25 15L5.25 9L11.25 3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Voltar
            </button>
          </div>
          {loading ? (
            <div>Carregando pacotes...</div>
          ) : cards.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <h2 className="text-lg text-gray-600 dark:text-gray-300">
                Nenhum pacote cadastrado para este serviço.
              </h2>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDndKitDragEnd}
            >
              <SortableContext
                items={cards.map((c) => c.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {cards.map((card) => (
                    <SortableCard
                      key={card.id}
                      card={card}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
