import { NICHE_OPTIONS } from "../constants/options";

// Funções utilitárias para lidar com o valor selecionado de nicho e preço

interface NicheItem {
  niche: string;
  price: string | number;
}

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
  let niches: NicheItem[] = [];
  try {
    niches = item.niche ? JSON.parse(item.niche) : [];
  } catch {
    niches = [];
  }
  const selectedNicheName = getSelectedNicheName(item, selectedNiches);
  if (!selectedNicheName || selectedNicheName === "Nenhum" || selectedNicheName === NICHE_OPTIONS.PLACEHOLDER) return 0;
  const found = niches.find((n: NicheItem) => n.niche === selectedNicheName);
  if (found && found.price) {
    const nichePrice = Number(
      String(found.price)
        .replace(/[^0-9,.-]+/g, "")
        .replace(",", ".")
    );
    // Agora retorna apenas o valor do nicho selecionado
    return nichePrice;
  }
  return 0;
}
