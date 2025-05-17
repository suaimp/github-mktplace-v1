import { ReactNode, useEffect, useState } from 'react';
import { hasPermission } from '../../lib/permissions';
import { supabase } from '../../lib/supabase';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, [permission]);

  async function checkPermission() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setHasAccess(false);
        return;
      }

      const allowed = await hasPermission(user.id, permission);
      setHasAccess(allowed);
      
    } catch (error) {
      console.error('Error checking permission:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return null;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}