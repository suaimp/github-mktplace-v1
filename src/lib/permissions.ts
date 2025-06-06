import { supabase } from "./supabase";

export type Permission = {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
};

// Cache user permissions
const userPermissionsCache = new Map<string, Set<string>>();

export async function getUserPermissions(userId: string): Promise<Set<string>> {
  // Check cache first
  if (userPermissionsCache.has(userId)) {
    return userPermissionsCache.get(userId)!;
  }

  try {
    // First check if user is admin
    const { data: adminData } = await supabase
      .from("admins")
      .select("role_id")
      .eq("id", userId)
      .maybeSingle();

    // If not admin, check platform_users
    const { data: userData } = await supabase
      .from("platform_users")
      .select("role_id")
      .eq("id", userId)
      .maybeSingle();

    const roleId = adminData?.role_id || userData?.role_id;

    if (!roleId) {
      throw new Error("User role not found");
    }

    // Get permissions for role
    const { data: permissions } = await supabase
      .from("permissions")
      .select(
        `
        code,
        role_permissions!inner(
          role_id
        )
      `
      )
      .eq("role_permissions.role_id", roleId);

    // Create permission set with explicit type assertion
    const permissionSet = new Set<string>(
      permissions?.map((p: any) => p.code as string) || []
    );

    // Cache permissions
    userPermissionsCache.set(userId, permissionSet);

    return permissionSet;
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return new Set();
  }
}

export async function hasPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(userId);
    return permissions.has(permission);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

export function clearPermissionsCache(userId?: string) {
  if (userId) {
    userPermissionsCache.delete(userId);
  } else {
    userPermissionsCache.clear();
  }
}

// Hook to check permissions in components
export function usePermissions() {
  return {
    getUserPermissions,
    hasPermission,
    clearPermissionsCache
  };
}
