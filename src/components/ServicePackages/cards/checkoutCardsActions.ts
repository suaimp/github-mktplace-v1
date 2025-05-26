import { useState } from "react";
import { getShoppingCartItemsByUser } from "../../../context/db-context/services/shoppingCartService";
import { getFormEntries } from "../../../context/db-context/services/formEntriesService";
import { getPublisherServices } from "../../../context/db-context/services/publisherService";
import { getServiceCards } from "../../../context/db-context/services/serviceCardService";

export function useCheckoutCardsActions() {
  const [cartProductTypeId, setCartProductTypeId] = useState<string | null>(
    null
  );
  const [publisherServices, setPublisherServices] = useState<any[] | null>(
    null
  );
  const [activePublisherService, setActivePublisherService] = useState<
    any | null
  >(null);
  const [activePublisherServiceId, setActivePublisherServiceId] = useState<
    string | null
  >(null);
  const [serviceCardsByActiveService, setServiceCardsByActiveService] =
    useState<any[] | null>(null);

  // Função para filtrar publisherServices pelo cartProductTypeId
  const serviceProductType =
    publisherServices && cartProductTypeId
      ? publisherServices.filter(
          (service) =>
            String(service.product_type) === String(cartProductTypeId)
        )
      : [];

  function filterActivePublisherService(services: any[] | null) {
    if (!services) return null;
    const active = services.find((service) => service.is_active === true);
    setActivePublisherService(active);
    console.log("activePublisherService:", active);
    return active;
  }

  async function getActiveCards() {
    const items = await getShoppingCartItemsByUser();
    if (!items.length) {
      console.log("Carrinho vazio");
      return;
    }
    const first = items[0];
    // Pega o entry_id do primeiro item
    const entryId = (first as any).entry_id;
    console.log("entryId extraído do carrinho:", entryId);

    // Busca todas as entradas e exibe o registro correspondente ao entryId
    const allEntries = await getFormEntries();
    const found = allEntries.find((entry: any) => entry.id === entryId);
    if (!found) {
      setCartProductTypeId(null);
      console.log("Nenhum FormEntry encontrado com id:", entryId);
      console.log("Itens do carrinho:", items);
      return;
    }
    console.log("FormEntry correspondente ao entryId:", found);
    const formId = found.form_id;
    setCartProductTypeId(formId);
    console.log("form_id extraído do FormEntry:", formId);

    // --- Fluxo automático sincronizado ---
    // 1. Buscar publisherServices filtrados por product_type
    const data = await getPublisherServices();
    const filteredPublisherServices =
      data && formId
        ? data.filter(
            (service: any) => String(service.product_type) === String(formId)
          )
        : [];
    setPublisherServices(filteredPublisherServices);
    console.log(
      "Publisher services filtrados por product_type:",
      filteredPublisherServices
    );

    // 2. Encontrar e setar o serviço ativo
    const active = filterActivePublisherService(filteredPublisherServices);
    // 3. Setar o id do serviço ativo
    if (active && active.id) {
      setActivePublisherServiceId(active.id);
      console.log("ID do activePublisherService:", active.id);
    } else {
      setActivePublisherServiceId(null);
      console.log("Nenhum activePublisherService definido.");
    }
    // 4. Buscar e setar os service cards do serviço ativo
    if (active && active.id) {
      const allCards = await getServiceCards();
      const filteredCards = allCards
        ? allCards.filter((card: any) => card.service_id === active.id)
        : [];
      setServiceCardsByActiveService(filteredCards);
      console.log("Service cards do serviço ativo:", filteredCards);
    } else {
      setServiceCardsByActiveService([]);
    }
    // Loga o valor atualizado de cartProductTypeId
    console.log("cartProductTypeId (após set):", formId);
    // Exibe os itens do carrinho normalmente
    console.log("Itens do carrinho:", items);
  }

  async function handleGetPublisherServices() {
    // Busca todos os publisherServices sem filtro de currentId
    const data = await getPublisherServices();
    // Filtra apenas os registros cujo product_type é igual ao cartProductTypeId
    const filtered =
      data && cartProductTypeId
        ? data.filter(
            (service: any) =>
              String(service.product_type) === String(cartProductTypeId)
          )
        : [];
    setPublisherServices(filtered);
    console.log("Publisher services filtrados por product_type:", filtered);
    filterActivePublisherService(filtered);
    return filtered;
  }

  function getActivePublisherServiceId() {
    if (activePublisherService && activePublisherService.id) {
      setActivePublisherServiceId(activePublisherService.id);
      console.log("ID do activePublisherService:", activePublisherService.id);
      return activePublisherService.id;
    }
    setActivePublisherServiceId(null);
    console.log("Nenhum activePublisherService definido.");
    fetchServiceCardsByActiveService();
    return null;
  }

  async function fetchServiceCardsByActiveService() {
    if (!activePublisherService || !activePublisherService.id) {
      console.log(
        "Nenhum activePublisherService definido para buscar service cards."
      );
      setServiceCardsByActiveService([]);
      return [];
    }
    const allCards = await getServiceCards();
    const filteredCards = allCards
      ? allCards.filter(
          (card: any) => card.service_id === activePublisherService.id
        )
      : [];
    setServiceCardsByActiveService(filteredCards);
    console.log("Service cards do serviço ativo:", filteredCards);
    return filteredCards;
  }

  return {
    getActiveCards,
    cartProductTypeId,
    handleGetPublisherServices,
    publisherServices,
    serviceProductType,
    activePublisherService,
    getActivePublisherServiceId,
    activePublisherServiceId,
    fetchServiceCardsByActiveService,
    serviceCardsByActiveService
  };
}
