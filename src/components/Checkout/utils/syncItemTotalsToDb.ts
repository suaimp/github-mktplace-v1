import { updateCartCheckoutResume } from "../../../services/db-services/marketplace-services/checkout/CartCheckoutResumeService";

export async function syncItemTotalsToDb(totalsMap: { [id: string]: number }) {
  const promises = Object.entries(totalsMap).map(async ([id, total]) => {
    try {
      await updateCartCheckoutResume(id, { item_total: total });
    } catch (err) {
      // Log de erro, mas não interrompe os outros updates
      console.error(`Erro ao atualizar item_total para id ${id}:`, err);
    }
  });
  await Promise.all(promises);
} 