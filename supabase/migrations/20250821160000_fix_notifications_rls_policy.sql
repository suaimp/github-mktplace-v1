-- Fix notifications RLS policy to allow proper notification system functionality
-- This migration corrects the RLS policies based on the actual notification system requirements:
-- - user_id represents who SENT the message (not who receives it)
-- - All authenticated users should be able to see notifications (for a global notification feed)
-- - Users can only create notifications as themselves
-- - Users can update/delete any notification (for admin purposes and marking as read)

-- Drop the restrictive INSERT policy from the initial migration
DROP POLICY IF EXISTS "notifications_insert_own" ON "public"."notifications";
DROP POLICY IF EXISTS "notifications_select_own" ON "public"."notifications";
DROP POLICY IF EXISTS "notifications_update_own" ON "public"."notifications";
DROP POLICY IF EXISTS "notifications_delete_own" ON "public"."notifications";

-- Drop any other policies that might exist
DROP POLICY IF EXISTS "notifications_insert_authenticated" ON "public"."notifications";
DROP POLICY IF EXISTS "notifications_select_all" ON "public"."notifications";
DROP POLICY IF EXISTS "notifications_update_all" ON "public"."notifications";
DROP POLICY IF EXISTS "notifications_delete_all" ON "public"."notifications";

-- Policy for SELECT: authenticated users can see all notifications
-- This allows for a global notification feed where admins see all notifications
-- and users can see notifications relevant to them
CREATE POLICY "notifications_select_all" ON "public"."notifications"
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (true);

-- Policy for INSERT: users can only create notifications as themselves
-- This ensures user_id matches the authenticated user (who sent the message)
CREATE POLICY "notifications_insert_own" ON "public"."notifications"
    AS PERMISSIVE FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE: authenticated users can update any notification
-- This allows marking notifications as read, updating content, etc.
CREATE POLICY "notifications_update_all" ON "public"."notifications"
    AS PERMISSIVE FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy for DELETE: authenticated users can delete any notification
-- This allows cleanup and management of notifications
CREATE POLICY "notifications_delete_all" ON "public"."notifications"
    AS PERMISSIVE FOR DELETE
    TO authenticated
    USING (true);
