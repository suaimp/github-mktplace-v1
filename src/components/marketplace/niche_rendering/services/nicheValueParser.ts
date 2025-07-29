import { parseNicheData } from "../../../../services/db-services/form-services/formFieldNicheService";
import type { NicheOption } from "../types";

export function parseNicheValue(value: any): NicheOption[] {
  if (!value) {
    return [];
  }

  try {
    let nicheData: NicheOption[] = [];

    if (typeof value === "string") {
      // Verifica se parece ser JSON
      if (value.trim().startsWith("[") || value.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(value);
          nicheData = parseNicheData(Array.isArray(parsed) ? parsed : [parsed]);
        } catch {
          console.log("[parseNicheValue] Failed to parse JSON, skipping malformed data");
          return [];
        }
      } else {
        // String simples, trata como texto
        nicheData = [{ text: value, icon: undefined }];
      }
    } else if (Array.isArray(value)) {
      nicheData = parseNicheData(value);
    } else {
      nicheData = parseNicheData([value]);
    }

    // Filtra dados válidos
    return nicheData.filter((niche) => {
      const hasText = niche.text && niche.text.trim() !== "";
      const hasIcon = niche.icon && niche.icon.trim() !== "";
      return hasText || hasIcon;
    });
  } catch (error) {
    console.error("[parseNicheValue] Error parsing niche value:", error);
    return [];
  }
}
