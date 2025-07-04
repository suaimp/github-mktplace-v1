const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('SUPABASE_FUNCTIONS_URL:', SUPABASE_FUNCTIONS_URL);
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 8) + '...' : 'NOT FOUND');

export async function deleteUserFromAuth(userId: string) {
  const endpoint = `${SUPABASE_FUNCTIONS_URL}/delete-user`;
  const method = "POST";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  };
  const body = JSON.stringify({ userId });

  console.log('deleteUserFromAuth - endpoint:', endpoint);
  console.log('deleteUserFromAuth - method:', method);
  console.log('deleteUserFromAuth - headers:', headers);
  console.log('deleteUserFromAuth - body:', body);

  const res = await fetch(endpoint, {
    method,
    headers,
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro ao deletar do Auth");
  return data;
} 