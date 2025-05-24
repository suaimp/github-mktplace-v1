import React from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import ServiceCard from "../../../components/ServicePackages/cards/ServiceCard";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import Switch from "react-switch";
import { updateServiceCardToggle } from "../../../context/db-context/services/serviceCardService";

import {
  defaultCardColors,
  mainCardColors
} from "../../../components/ServicePackages/cards/cardColors";

export function CardView({
  card,
  handleEdit,
  handleDelete
}: {
  card: any;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
}) {
  // Estado local para o toggle de layout, inicializado pelo valor do card
  const [toggleChecked, setToggleChecked] = React.useState(
    card.layout_toggle ?? false
  );
  const [toggleLoading, setToggleLoading] = React.useState(false);
  // Estado local para o tema visual do card
  const [cardColors, setCardColors] = React.useState(
    toggleChecked ? mainCardColors : defaultCardColors
  );

  // Hook de ações (apenas para obter handleToggleCardLayout se necessário)
  // const { handleToggleCardLayout } = useCardActions();

  const handleToggleChange = async (checked: boolean) => {
    setToggleChecked(checked);
    setToggleLoading(true);
    // Atualiza no banco
    await updateServiceCardToggle(card.id, checked);
    // Alterna o tema visual do card
    setCardColors(checked ? mainCardColors : defaultCardColors);
    setToggleLoading(false);
    // Se quiser atualizar globalmente, chame handleToggleCardLayout(card.id, checked)
  };

  return (
    <div className="relative w-full">
      <div className="absolute top-2 right-2 flex flex-row items-center gap-2 z-10">
        {/* Toggle */}
        <Switch
          checked={toggleChecked}
          onChange={handleToggleChange}
          onColor="#f9f9f9"
          offColor="#1d2939"
          checkedIcon={false}
          uncheckedIcon={false}
          height={16}
          width={32}
          offHandleColor="#ededed" // cor da bolinha ligada
          onHandleColor="#cacaca" // cor da bolinha desligada
          disabled={toggleLoading}
        />
        {/* Botão Editar */}
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
          <PencilIcon className="w-5 h-5 text-gray-600" />
        </button>
        {/* Botão Excluir */}
        <button
          className="w-10 h-10 rounded bg-gray-100 text-gray-700 hover:bg-red-200 flex items-center justify-center shadow-md transition-colors duration-150"
          title="Excluir"
          onClick={() => handleDelete(card.id)}
        >
          <input
            type="radio"
            name={`action-${card.id}`}
            className="sr-only"
            tabIndex={-1}
          />
          <TrashBinIcon className="w-5 h-5 text-gray-600" />
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
        cardColors={cardColors}
      />
    </div>
  );
}

export function SortableCard({
  card,
  handleEdit,
  handleDelete
}: {
  card: any;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: card.id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    zIndex: isDragging ? 50 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={"cursor-grab " + (isDragging ? "opacity-70" : "")}
      {...listeners}
    >
      <CardView
        card={card}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    </div>
  );
}
