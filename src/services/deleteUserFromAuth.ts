const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function deleteUserFromAuth(userId: string) {
  const endpoint = `${SUPABASE_FUNCTIONS_URL}/delete-user`;
  const method = "POST";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  };
  const body = JSON.stringify({ userId });

  const res = await fetch(endpoint, {
    method,
    headers,
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro ao deletar do Auth");
  return data;
} 