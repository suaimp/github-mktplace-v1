-- Create notification_types table (simplified version for remote deployment)
CREATE TABLE IF NOT EXISTS "public"."notification_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notification_types_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notification_types_type_unique" UNIQUE ("type")
);

-- Insert basic notification types
INSERT INTO "public"."notification_types" ("type") 
VALUES ('chat'), ('purchase'), ('system'), ('order') 
ON CONFLICT ("type") DO NOTHING;
