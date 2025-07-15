import { InstallmentOption } from "./types";
import { supabase } from '../../../../lib/supabase';

export async function fetchInstallments(amount: number, card_brand: string): Promise<InstallmentOption[]> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pagarme-installments`;
  const { data } = await supabase.auth.getSession();
  const access_token = data?.session?.access_token;
  if (!access_token) throw new Error("Usuário não autenticado.");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`,
    },
    body: JSON.stringify({ amount, card_brand })
  });
  if (!res.ok) throw new Error("Erro ao buscar opções de parcelamento");
  const dataRes = await res.json();
  return (dataRes.installments || []).map((item: any) => ({
    installments: item.installments,
    amount: item.amount,
    formatted_amount: (item.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    interest: !!item.interest,
  }));
} 