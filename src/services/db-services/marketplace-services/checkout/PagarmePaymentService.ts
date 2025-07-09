// Serviço de pagamento Pagar.me (teste)
// Este serviço simula uma transação de teste usando a API de sandbox da Pagar.me

import { supabase } from "../../../../lib/supabase";

export async function pagarmeTestTransaction({
  amount = 1000,
  card_token,
}: {
  amount?: number;
  card_token: string;
}) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pagarme-payment`;
  const body = {
    amount,
    card_token,
  };
  // Obter o token do usuário autenticado
  const { data } = await supabase.auth.getSession();
  const access_token = data?.session?.access_token;
  if (!access_token) {
    throw new Error("Usuário não autenticado.");
  }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.errors ? JSON.stringify(data.errors) : data.message || data.error || "Erro na transação Pagar.me");
    }
    return data;
  } catch (error: any) {
    throw new Error(error.message || "Erro ao conectar com Edge Function Pagar.me");
  }
} 