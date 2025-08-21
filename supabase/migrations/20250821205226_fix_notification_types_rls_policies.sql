-- Fix notification_types RLS policies
-- Ensure RLS is enabled for notification_types
ALTER TABLE "public"."notification_types" ENABLE ROW LEVEL SECURITY;

-- Function to check if user is admin (if not exists)
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user exists in admins table and has admin role
    RETURN EXISTS (
        SELECT 1 
        FROM admins a
        JOIN roles r ON a.role_id = r.id
        WHERE a.id = user_id
          AND r.name = 'admin'
          AND a.role = 'admin'
    );
END;
$$;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "notification_types_select_admin_only" ON "public"."notification_types";
DROP POLICY IF EXISTS "notification_types_insert_admin_only" ON "public"."notification_types";
DROP POLICY IF EXISTS "notification_types_update_admin_only" ON "public"."notification_types";
DROP POLICY IF EXISTS "notification_types_delete_admin_only" ON "public"."notification_types";

-- Policy for SELECT (read) - only admins can read notification types
CREATE POLICY "notification_types_select_admin_only" ON "public"."notification_types"
    AS PERMISSIVE FOR SELECT
    TO public
    USING (is_admin(auth.uid()));

-- Policy for INSERT (create) - only admins can create notification types
CREATE POLICY "notification_types_insert_admin_only" ON "public"."notification_types"
    AS PERMISSIVE FOR INSERT
    TO public
    WITH CHECK (is_admin(auth.uid()));

-- Policy for UPDATE (update) - only admins can update notification types
CREATE POLICY "notification_types_update_admin_only" ON "public"."notification_types"
    AS PERMISSIVE FOR UPDATE
    TO public
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Policy for DELETE (delete) - only admins can delete notification types
CREATE POLICY "notification_types_delete_admin_only" ON "public"."notification_types"
    AS PERMISSIVE FOR DELETE
    TO public
    USING (is_admin(auth.uid()));

-- Create updated_at trigger for notification_types
CREATE OR REPLACE FUNCTION update_notification_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_notification_types_updated_at ON "public"."notification_types";
CREATE TRIGGER update_notification_types_updated_at
    BEFORE UPDATE ON "public"."notification_types"
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_types_updated_at();