import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/supabase";

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
      const userInfo = await getCurrentUser();
      setIsAdmin(userInfo?.type === "admin");
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
