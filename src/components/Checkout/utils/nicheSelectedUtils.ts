// Funções utilitárias para lidar com o valor selecionado de nicho e preço

export function getSelectedNicheName(
  item: any,
  selectedNiches: { [id: string]: string | null }
): string {
  let selectedNicheName = selectedNiches[item.id];
  if (!selectedNicheName) {
    const preset = item.niche_selected;
    if (Array.isArray(preset) && preset.length > 0) {
      try {
        if (typeof preset[0] === "string") {
          const parsed = JSON.parse(preset[0]);
          if (parsed && parsed.niche) selectedNicheName = parsed.niche;
        } else if (
          typeof preset[0] === "object" &&
          preset[0] !== null &&
          preset[0].niche
        ) {
          selectedNicheName = preset[0].niche;
        }
      } catch {
        selectedNicheName = preset[0];
      }
    } else if (typeof preset === "object" && preset !== null && preset.niche) {
      selectedNicheName = preset.niche;
    } else if (typeof preset === "string") {
      try {
        const parsed = JSON.parse(preset);
        if (parsed && parsed.niche) selectedNicheName = parsed.niche;
        else selectedNicheName = preset;
      } catch {
        selectedNicheName = preset;
      }
    }
  }
  return selectedNicheName || "";
}

export function getNichePrice(
  item: any,
  selectedNiches: { [id: string]: string | null }
): number {
  let niches = [];
  try {
    niches = item.niche ? JSON.parse(item.niche) : [];
  } catch {
    niches = [];
  }
  const selectedNicheName = getSelectedNicheName(item, selectedNiches);
  if (!selectedNicheName || selectedNicheName === "Nenhum") return 0;
  const found = niches.find((n: any) => n.niche === selectedNicheName);
  if (found && found.price) {
    return Number(
      String(found.price)
        .replace(/[^0-9,.-]+/g, "")
        .replace(",", ".")
    );
  }
  return 0;
}
