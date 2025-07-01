import { createClient } from "@supabase/supabase-js";
import { ensureAdminInAdminsTable } from '../pages/Users/actions/adminRegisterSubmit';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
    // Rate limiting check
    const rateLimitKey = `auth_attempts_${email}`;
    if (!checkRateLimit(rateLimitKey)) {
      const remainingMinutes = getRateLimitReset(rateLimitKey);
      throw new Error(
        `Too many attempts. Try again in ${remainingMinutes} minutes.`
      );
    }

    // Basic validation
    if (!email?.trim() || !password?.trim()) {
      throw new Error("Email and password are required");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new Error("Invalid email");
    }

    // Try to login
    const {
      data: { user, session },
      error
    } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim()
    });

    if (error) throw error;
    if (!user || !session) throw new Error("User data not found");

    // Garantir que o admin está na tabela admins
    try {
      await ensureAdminInAdminsTable({
        userId: user.id,
        email: user.email || '',
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || ''
      });
    } catch (e) {
      console.error('Erro ao garantir admin na tabela admins:', e);
    }

    // Check if admin
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("id, email, first_name, last_name, is_first_admin")
      .eq("id", user.id)
      .single();

    if (adminError || !adminData) {
      await signOut();
      throw new Error("User does not have admin permissions");
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
    throw error;
  }
}

export async function signInUser(email: string, password: string) {
  try {
    // Rate limiting check
    const rateLimitKey = `auth_attempts_${email}`;
    if (!checkRateLimit(rateLimitKey)) {
      const remainingMinutes = getRateLimitReset(rateLimitKey);
      throw new Error(
        `Too many attempts. Try again in ${remainingMinutes} minutes.`
      );
    }

    // Basic validation
    if (!email?.trim() || !password?.trim()) {
      throw new Error("Email and password are required");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new Error("Invalid email");
    }

    // Try to login
    const {
      data: { user, session },
      error
    } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim()
    });

    if (error) throw error;
    if (!user || !session) throw new Error("User data not found");

    // Check if platform user
    const { data: userData, error: userError } = await supabase
      .from("platform_users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (userError) throw userError;
    if (!userData) throw new Error("User not found");

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
    throw error;
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
    // Basic email validation
    if (!email?.trim()) {
      throw new Error("Email é obrigatório");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new Error("Email inválido");
    }

    // Rate limiting check
    const rateLimitKey = `reset_password_${email}`;
    if (!checkRateLimit(rateLimitKey)) {
      const remainingMinutes = getRateLimitReset(rateLimitKey);
      throw new Error(
        `Muitas tentativas. Por favor, aguarde ${remainingMinutes} minutos antes de tentar novamente.`
      );
    }

    // First check if email exists
    const { data: userData } = await supabase
      .from("platform_users")
      .select("id, email")
      .eq("email", email.trim())
      .maybeSingle();

    const { data: adminData } = await supabase
      .from("admins")
      .select("id, email")
      .eq("email", email.trim())
      .maybeSingle();

    if (!userData && !adminData) {
      throw new Error("Email not found");
    }

    // Request password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
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
