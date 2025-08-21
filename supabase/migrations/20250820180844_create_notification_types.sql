-- Create notification_types table
CREATE TABLE IF NOT EXISTS "public"."notification_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

-- Set owner
ALTER TABLE "public"."notification_types" OWNER TO "postgres";

-- Add primary key constraint
ALTER TABLE ONLY "public"."notification_types"
    ADD CONSTRAINT "notification_types_pkey" PRIMARY KEY ("id");

-- Add unique constraint on type
ALTER TABLE ONLY "public"."notification_types"
    ADD CONSTRAINT "notification_types_type_unique" UNIQUE ("type");

-- Enable RLS
ALTER TABLE "public"."notification_types" ENABLE ROW LEVEL SECURITY;

-- Function to check if user is admin
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

-- RLS Policies for notification_types (only admins can CRUD)

-- Policy for SELECT (read)
CREATE POLICY "notification_types_select_admin_only" ON "public"."notification_types"
    AS PERMISSIVE FOR SELECT
    TO public
    USING (is_admin(auth.uid()));

-- Policy for INSERT (create)
CREATE POLICY "notification_types_insert_admin_only" ON "public"."notification_types"
    AS PERMISSIVE FOR INSERT
    TO public
    WITH CHECK (is_admin(auth.uid()));

-- Policy for UPDATE (update)
CREATE POLICY "notification_types_update_admin_only" ON "public"."notification_types"
    AS PERMISSIVE FOR UPDATE
    TO public
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Policy for DELETE (delete)
CREATE POLICY "notification_types_delete_admin_only" ON "public"."notification_types"
    AS PERMISSIVE FOR DELETE
    TO public
    USING (is_admin(auth.uid()));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_notification_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_types_updated_at
    BEFORE UPDATE ON "public"."notification_types"
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_types_updated_at();

-- Populate table with initial notification types
INSERT INTO "public"."notification_types" ("type") VALUES 
    ('chat'),
    ('purchase')
ON CONFLICT (type) DO NOTHING;
