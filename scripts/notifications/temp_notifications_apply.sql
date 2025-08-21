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

ALTER TABLE "public"."notifications" OWNER TO "postgres";

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" 
    FOREIGN KEY ("user_id") 
    REFERENCES "auth"."users"("id") 
    ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_type_fkey" 
    FOREIGN KEY ("type") 
    REFERENCES "public"."notification_types"("type") 
    ON DELETE RESTRICT;

CREATE INDEX "notifications_user_id_idx" ON "public"."notifications" USING btree ("user_id");
CREATE INDEX "notifications_type_idx" ON "public"."notifications" USING btree ("type");
CREATE INDEX "notifications_created_at_idx" ON "public"."notifications" USING btree ("created_at" DESC);

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON "public"."notifications"
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own" ON "public"."notifications"
    AS PERMISSIVE FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON "public"."notifications"
    AS PERMISSIVE FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON "public"."notifications"
    AS PERMISSIVE FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

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
