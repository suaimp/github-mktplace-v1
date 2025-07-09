// Para configurar a public key da Pagar.me, adicione no seu .env:
// VITE_PAGARME_PUBLIC_KEY=sua_public_key_aqui

// src/services/pagarme/tokenizeCard.ts

import { supabase } from '../../lib/supabase';

export async function tokenizeCard({
  card_number,
  card_exp_month,
  card_exp_year,
  card_cvv,
  card_holder_name,
}: {
  card_number: string;
  card_exp_month: string;
  card_exp_year: string;
  card_cvv: string;
  card_holder_name: string;
}): Promise<string> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pagarme-payment`;
  const { data } = await supabase.auth.getSession();
  const access_token = data?.session?.access_token;
  if (!access_token) throw new Error("Usuário não autenticado.");
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
    },
    body: JSON.stringify({
      action: 'tokenize',
      card_number,
      card_exp_month,
      card_exp_year,
      card_cvv,
      card_holder_name
    })
  });
  const dataRes = await response.json();
  if (!response.ok || !dataRes.card_token) {
    throw new Error(dataRes.error || 'Erro ao tokenizar cartão');
  }
  return dataRes.card_token;
} 