// Funções utilitárias para lidar com o pacote de conteúdo selecionado e seus parâmetros

export function getSelectedServicePackage(
  item: any,
  selectedService: { [id: string]: string | null },
  serviceCards: any[]
): any {
  console.log("🔍 getSelectedServicePackage chamada:", {
    itemId: item.id,
    selectedService: selectedService[item.id],
    serviceCardsLength: serviceCards.length,
    itemServiceSelected: item.service_selected
  });
  
  // Sempre prioriza o valor persistido no backend se não houver seleção no estado
  let selectedServiceTitle = selectedService[item.id];
  if (!selectedServiceTitle) {
    const preset = item.service_selected;
    // Tenta extrair o título do pacote salvo no backend
    if (preset) {
      if (typeof preset === "string") {
        try {
          const parsed = JSON.parse(preset);
          if (parsed && parsed.title) selectedServiceTitle = parsed.title;
          else selectedServiceTitle = preset;
        } catch {
          selectedServiceTitle = preset;
        }
      } else if (Array.isArray(preset) && preset.length > 0) {
        const first = preset[0];
        if (typeof first === "string") {
          try {
            const parsed = JSON.parse(first);
            if (parsed && parsed.title) selectedServiceTitle = parsed.title;
            else selectedServiceTitle = first;
          } catch {
            selectedServiceTitle = first;
          }
        } else if (typeof first === "object" && first !== null && first.title) {
          selectedServiceTitle = first.title;
        }
      } else if (
        typeof preset === "object" &&
        preset !== null &&
        preset.title
      ) {
        selectedServiceTitle = preset.title;
      }
    }
  }
  if (!selectedServiceTitle || selectedServiceTitle === "Nenhum") return null;
  // Busca o pacote de conteúdo pelo título
  const found = serviceCards.find(
    (option: any) => option.title === selectedServiceTitle
  );
  if (found) {
    console.log("Service card encontrado com benefits:", found);
    
    // Verifica se há um valor personalizado de word_count no item
    let customWordCount = null;
    if (item.service_selected && Array.isArray(item.service_selected) && item.service_selected.length > 0) {
      const serviceData = item.service_selected[0];
      if (typeof serviceData === "object" && serviceData.word_count !== undefined) {
        customWordCount = serviceData.word_count;
        console.log("🎯 Valor personalizado encontrado:", customWordCount);
      }
    }
    
    const result = {
      title: found.title,
      price: found.price,
      price_per_word: found.price_per_word,
      // Usa o valor personalizado se existir, senão usa o padrão do serviço
      word_count: customWordCount !== null ? customWordCount : found.word_count,
      is_free: found.is_free,
      benefits: found.benefits
    };
    
    console.log("📤 Retornando service package:", {
      itemId: item.id,
      customWordCount: customWordCount,
      defaultWordCount: found.word_count,
      finalWordCount: result.word_count
    });
    
    return result;
  }
  return null;
}

export function getServicePackageArray(
  item: any,
  selectedService: { [id: string]: string | null },
  serviceCards: any[]
): any[] {
  const pkg = getSelectedServicePackage(item, selectedService, serviceCards);
  if (!pkg)
    return [
      {
        title: "Nenhum",
        price: 0,
        price_per_word: 0,
        word_count: 0,
        is_free: false,
        benefits: []
      }
    ];
  return [pkg];
}

// Retorna o title do pacote de conteúdo selecionado, independente do formato
export function getSelectedServiceTitle(
  item: any,
  selectedService: { [id: string]: string }
) {
  let preset = selectedService[item.id] ?? item.service_selected ?? "";
  // Se já for string simples (title)
  if (typeof preset === "string" && preset && preset !== "[object Object]") {
    // Pode ser string serializada de objeto
    try {
      const parsed = JSON.parse(preset);
      if (parsed && typeof parsed === "object" && "title" in parsed)
        return parsed.title;
      return preset;
    } catch {
      return preset;
    }
  }
  // Se for array
  if (Array.isArray(preset) && preset.length > 0) {
    const first = preset[0];
    if (typeof first === "string") {
      try {
        const parsed = JSON.parse(first);
        if (parsed && typeof parsed === "object" && "title" in parsed)
          return parsed.title;
        return first;
      } catch {
        return first;
      }
    } else if (
      typeof first === "object" &&
      first !== null &&
      "title" in first
    ) {
      return first.title;
    }
  }
  // Se for objeto
  if (typeof preset === "object" && preset !== null && "title" in preset) {
    return (preset as any).title;
  }
  return "";
}
