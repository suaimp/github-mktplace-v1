// Funções utilitárias para lidar com o pacote de conteúdo selecionado e seus parâmetros

export function getSelectedServicePackage(
  item: any,
  selectedService: { [id: string]: string | null },
  serviceCards: any[]
): any {
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
    return {
      title: found.title,
      price: found.price,
      price_per_word: found.price_per_word,
      word_count: found.word_count,
      is_free: found.is_free,
      benefits: found.benefits
    };
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
