import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug temporário - MUITO DETALHADO
console.log('🔍 Debug Supabase Config:');
console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `Present (${supabaseAnonKey.substring(0, 20)}...)` : 'Missing');
console.log('Mode:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('All VITE_ vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
console.log('All env vars:', import.meta.env);

// Tentar valores de fallback para desenvolvimento local
const fallbackUrl = 'http://127.0.0.1:54321';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const finalUrl = supabaseUrl || fallbackUrl;
const finalKey = supabaseAnonKey || fallbackKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Using fallback values for development');
  console.log('Final URL:', finalUrl);
  console.log('Final Key present:', !!finalKey);
}

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  },
  global: {
    headers: {
      "X-Client-Info": "supabase-js-web"
    }
  }
});

// Rate limiting configuration
const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RESET_MS: 30 * 60 * 1000 // 30 minutes
};

// Function to translate Supabase auth error messages to Portuguese
function translateAuthError(error: any): string {
  if (!error) return "Erro desconhecido";
  
  const message = error.message || error.toString();
  
  // Common Supabase auth error messages
  const errorTranslations: Record<string, string> = {
    "Invalid login credentials": "Email ou senha inválidos",
    "Email not confirmed": "Email não confirmado. Por favor, verifique sua caixa de entrada.",
    "User not found": "Usuário não encontrado",
    "Invalid email": "Email inválido",
    "Weak password": "Senha muito fraca",
    "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres",
    "Signup disabled": "Cadastro desabilitado",
    "Email already registered": "Este email já está cadastrado",
    "User already registered": "Usuário já está cadastrado",
    "Too many requests": "Muitas tentativas. Tente novamente mais tarde.",
    "Database connection error": "Erro de conexão com o banco de dados",
    "Auth session missing": "Sessão de autenticação perdida",
    "Invalid token": "Token inválido",
    "Token expired": "Token expirado",
    "Access denied": "Acesso negado",
    "Unable to validate email address": "Não foi possível validar o endereço de email"
  };
  
  // Check for exact matches first
  for (const [englishMessage, portugueseMessage] of Object.entries(errorTranslations)) {
    if (message.toLowerCase().includes(englishMessage.toLowerCase())) {
      return portugueseMessage;
    }
  }
  
  // Check for partial matches
  if (message.toLowerCase().includes("invalid") && message.toLowerCase().includes("credentials")) {
    return "Email ou senha inválidos";
  }
  
  if (message.toLowerCase().includes("email") && message.toLowerCase().includes("confirmed")) {
    return "Email não confirmado. Por favor, verifique sua caixa de entrada.";
  }
  
  if (message.toLowerCase().includes("password") && message.toLowerCase().includes("weak")) {
    return "Senha muito fraca. Use uma senha mais forte.";
  }
  
  if (message.toLowerCase().includes("rate") && message.toLowerCase().includes("limit")) {
    return "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.";
  }
  
  // Return original message if no translation found, but in Portuguese fallback
  return message || "Erro de autenticação. Tente novamente.";
}

// Check and update rate limit
function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const rateLimitData = localStorage.getItem(key);

  if (!rateLimitData) {
    const newData = {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now
    };
    localStorage.setItem(key, JSON.stringify(newData));
    return true;
  }

  const data = JSON.parse(rateLimitData);

  // Reset if outside window
  if (now - data.firstAttempt > RATE_LIMIT.RESET_MS) {
    const newData = {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now
    };
    localStorage.setItem(key, JSON.stringify(newData));
    return true;
  }

  // Check if within rate limit
  if (
    data.attempts >= RATE_LIMIT.MAX_ATTEMPTS &&
    now - data.firstAttempt < RATE_LIMIT.WINDOW_MS
  ) {
    return false;
  }

  // Update attempts
  const newData = {
    attempts: data.attempts + 1,
    firstAttempt: data.firstAttempt,
    lastAttempt: now
  };
  localStorage.setItem(key, JSON.stringify(newData));
  return true;
}

// Get remaining time for rate limit
function getRateLimitReset(key: string): number {
  const data = localStorage.getItem(key);
  if (!data) return 0;

  const { firstAttempt } = JSON.parse(data);
  const now = Date.now();
  const remainingMs = Math.max(0, RATE_LIMIT.RESET_MS - (now - firstAttempt));
  return Math.ceil(remainingMs / 1000 / 60); // Convert to minutes
}

export async function signInAdmin(email: string, password: string) {
  try {
    // Normalize email to lowercase for rate limiting
    const normalizedEmail = email.trim().toLowerCase();

    // Rate limiting check
    const rateLimitKey = `auth_attempts_${normalizedEmail}`;
    if (!checkRateLimit(rateLimitKey)) {
      const remainingMinutes = getRateLimitReset(rateLimitKey);
      throw new Error(
        `Muitas tentativas. Tente novamente em ${remainingMinutes} minutos.`
      );
    }

    // Basic validation
    if (!normalizedEmail || !password?.trim()) {
      throw new Error("Email e senha são obrigatórios");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error("Email inválido");
    }

    // Try to login
    const {
      data: { user, session },
      error
    } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password.trim()
    });

    if (error) throw error;
    if (!user || !session) throw new Error("Dados do usuário não encontrados");

    // Check if admin
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("id, email, first_name, last_name, is_first_admin")
      .eq("id", user.id)
      .single();

    if (adminError || !adminData) {
      await signOut();
      throw new Error("Usuário não possui permissões de administrador");
    }

    // Clear rate limit on successful login
    localStorage.removeItem(rateLimitKey);

    return {
      user,
      admin: adminData,
      session
    };
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(translateAuthError(error));
  }
}

export async function signInUser(email: string, password: string) {
  try {
    // Normalize email to lowercase for rate limiting
    const normalizedEmail = email.trim().toLowerCase();

    // Rate limiting check
    const rateLimitKey = `auth_attempts_${normalizedEmail}`;
    if (!checkRateLimit(rateLimitKey)) {
      const remainingMinutes = getRateLimitReset(rateLimitKey);
      throw new Error(
        `Muitas tentativas. Tente novamente em ${remainingMinutes} minutos.`
      );
    }

    // Basic validation
    if (!normalizedEmail || !password?.trim()) {
      throw new Error("Email e senha são obrigatórios");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error("Email inválido");
    }

    // Try to login
    const {
      data: { user, session },
      error
    } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password.trim()
    });

    if (error) throw error;
    if (!user || !session) throw new Error("Dados do usuário não encontrados");

    // Check if platform user
    const { data: userData, error: userError } = await supabase
      .from("platform_users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (userError) throw userError;
    if (!userData) throw new Error("Usuário não encontrado");

    // Check if email is confirmed
    if (!user.email_confirmed_at) {
      await signOut();
      throw new Error(
        "Email não confirmado. Por favor, verifique sua caixa de entrada."
      );
    }

    // Clear rate limit on successful login
    localStorage.removeItem(rateLimitKey);

    return {
      user,
      platformUser: userData,
      session
    };
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(translateAuthError(error));
  }
}

export async function signOut() {
  try {
    // Clear local storage except for theme preference
    const theme = localStorage.getItem("theme");
    localStorage.clear();
    if (theme) localStorage.setItem("theme", theme);

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export async function getCurrentSession() {
  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const session = await getCurrentSession();
    if (!session) return null;

    const {
      data: { user },
      error
    } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return null;

    // Check if admin or platform user
    const { data: adminData } = await supabase
      .from("admins")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (adminData) {
      return { user, type: "admin", data: adminData };
    }

    const { data: userData } = await supabase
      .from("platform_users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (userData) {
      return { user, type: "platform", data: userData };
    }

    await signOut();
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export async function resetPassword(email: string) {
  try {
    // Normalize email to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    // Basic email validation
    if (!normalizedEmail) {
      throw new Error("Email é obrigatório");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error("Email inválido");
    }

    // Rate limiting check
    const rateLimitKey = `reset_password_${normalizedEmail}`;
    if (!checkRateLimit(rateLimitKey)) {
      const remainingMinutes = getRateLimitReset(rateLimitKey);
      throw new Error(
        `Muitas tentativas. Por favor, aguarde ${remainingMinutes} minutos antes de tentar novamente.`
      );
    }

    // First check if email exists (case-insensitive)
    const { data: userData } = await supabase
      .from("platform_users")
      .select("id, email")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    const { data: adminData } = await supabase
      .from("admins")
      .select("id, email")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (!userData && !adminData) {
      throw new Error("Email não encontrado");
    }

    // Request password reset
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
}

export async function getRedirectPath(): Promise<string> {
  try {
    const user = await getCurrentUser();
    if (!user) return "/";

    if (user.type === "admin") {
      return "/dashboard";
    }

    if (user.type === "platform") {
      const role = user.data.role;
      return role === "publisher"
        ? "/publisher/dashboard"
        : "/advertiser/dashboard";
    }

    return "/";
  } catch (error) {
    console.error("Error determining redirect:", error);
    return "/";
  }
}
