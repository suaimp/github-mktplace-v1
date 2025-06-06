import React, { useEffect } from "react";
import { useCheckoutCardsActions } from "./checkoutCardsActions";
import { SortableCard } from "../../../pages/ServicePackages/cards/SortableCard";

const CheckoutCards: React.FC = () => {
  const { getActiveCards, serviceCardsByActiveService } =
    useCheckoutCardsActions();

  useEffect(() => {
    getActiveCards();
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <div className="mt-4">
        <h2 className="font-bold text-lg mb-1">Escolha o pacote de conteúdo</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Selecione qual pacote de conteúdo você deseja vincular ao seu produto.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {serviceCardsByActiveService &&
          serviceCardsByActiveService.length > 0 ? (
            serviceCardsByActiveService.map((card: any) => (
              <div key={card.id} className="relative w-full">
                {/* Renderiza apenas o ServiceCard, sem edição/exclusão e sem cursor de mãozinha */}
                <div className="cursor-default">
                  <SortableCard
                    card={card}
                    handleEdit={() => {}}
                    handleDelete={() => {}}
                    editButtons={false} // checkout: não mostra botões de edição
                    button={true} // força o botão a ser clicável no checkout
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              Nenhum card encontrado para o serviço ativo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutCards;
