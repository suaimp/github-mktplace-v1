import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {   supabase } from "../lib/supabase";

export default function AdminRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      // Buscar o id do role admin
      const { data: adminRole } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "admin")
        .maybeSingle();
      if (!adminRole?.id) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      // Verificar se está na tabela admins
      const { data: adminData } = await supabase
        .from("admins")
        .select("role, role_id")
        .eq("id", user.id)
        .maybeSingle();
      if (adminData && adminData.role === "admin" && adminData.role_id === adminRole.id) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }
      // Verificar se está na tabela platform_users
      const { data: platformData } = await supabase
        .from("platform_users")
        .select("role, role_id")
        .eq("id", user.id)
        .maybeSingle();
      if (platformData && platformData.role === "admin" && platformData.role_id === adminRole.id) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }
      setIsAdmin(false);
      setLoading(false);
    }
    checkAdmin();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
