-- Create notifications table
CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "content" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

-- Set owner
ALTER TABLE "public"."notifications" OWNER TO "postgres";

-- Add primary key constraint
ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

-- Add foreign key constraint to auth.users with CASCADE delete
ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" 
    FOREIGN KEY ("user_id") 
    REFERENCES "auth"."users"("id") 
    ON DELETE CASCADE;

-- Add foreign key constraint to notification_types.type
ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_type_fkey" 
    FOREIGN KEY ("type") 
    REFERENCES "public"."notification_types"("type") 
    ON DELETE RESTRICT;

-- Add index for better performance on user_id queries
CREATE INDEX "notifications_user_id_idx" ON "public"."notifications" USING btree ("user_id");

-- Add index for better performance on type queries
CREATE INDEX "notifications_type_idx" ON "public"."notifications" USING btree ("type");

-- Add index for better performance on created_at queries (for ordering)
CREATE INDEX "notifications_created_at_idx" ON "public"."notifications" USING btree ("created_at" DESC);

-- Enable RLS
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications (authenticated users can CRUD their own notifications)

-- Policy for SELECT (read) - users can only see their own notifications
CREATE POLICY "notifications_select_own" ON "public"."notifications"
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy for INSERT (create) - users can only create notifications for themselves
CREATE POLICY "notifications_insert_own" ON "public"."notifications"
    AS PERMISSIVE FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE (update) - users can only update their own notifications
CREATE POLICY "notifications_update_own" ON "public"."notifications"
    AS PERMISSIVE FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE (delete) - users can only delete their own notifications
CREATE POLICY "notifications_delete_own" ON "public"."notifications"
    AS PERMISSIVE FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON "public"."notifications"
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();
