
create type "public"."pix_key_type" as enum ('cpf', 'cnpj', 'phone', 'email', 'random');

create sequence "public"."trigger_debug_log_id_seq";

create sequence "public"."user_stats_id_seq";

create table "public"."admins" (
    "id" uuid not null,
    "email" text not null,
    "first_name" text not null,
    "last_name" text not null,
    "is_first_admin" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "phone" text,
    "marketing_automation" boolean default false,
    "newsletter" boolean default false,
    "offer_suggestions" boolean default false,
    "avatar_url" text,
    "role_id" uuid not null,
    "role" character varying(50)
);


alter table "public"."admins" enable row level security;

create table "public"."best_selling_sites" (
    "id" uuid not null default gen_random_uuid(),
    "entry_id" uuid,
    "product_name" text not null,
    "product_url" text not null,
    "quantity" integer not null default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."best_selling_sites" enable row level security;

create table "public"."cart_checkout_resume" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "entry_id" uuid,
    "product_url" character varying(255),
    "quantity" integer default 1,
    "niche" character varying(255),
    "price" numeric(10,2),
    "service_content" character varying,
    "created_at" timestamp without time zone default CURRENT_TIMESTAMP,
    "niche_selected" text[],
    "service_selected" text[],
    "item_total" numeric default 0
);


alter table "public"."cart_checkout_resume" enable row level security;

create table "public"."company_data" (
    "id" uuid not null default gen_random_uuid(),
    "admin_id" uuid,
    "legal_status" text not null,
    "country" text not null,
    "company_name" text,
    "city" text not null,
    "zip_code" text not null,
    "address" text not null,
    "document_number" text not null,
    "withdrawal_method" text,
    "bank_account" text,
    "paypal_id" text,
    "other_payment_info" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "pix_key_type" pix_key_type,
    "pix_key" text,
    "bank_transfer_type" text,
    "bank_code" text,
    "bank_agency" text,
    "bank_account_number" text,
    "bank_account_type" text,
    "bank_account_holder" text,
    "bank_account_holder_document" text,
    "bank_swift" text,
    "bank_iban" text,
    "bank_routing_number" text,
    "bank_address" text,
    "bank_country" text,
    "state" character varying(32),
    "user_id" uuid
);


alter table "public"."company_data" enable row level security;

create table "public"."contracts" (
    "id" uuid not null default gen_random_uuid(),
    "admin_id" uuid not null,
    "type_of_contract" text not null,
    "contract_content" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."contracts" enable row level security;

create table "public"."coupons" (
    "id" uuid not null default gen_random_uuid(),
    "code" text not null,
    "name" text not null,
    "description" text,
    "discount_type" text not null,
    "discount_value" numeric(10,2) not null,
    "minimum_amount" numeric(10,2),
    "maximum_discount" numeric(10,2),
    "usage_limit" integer,
    "usage_count" integer not null default 0,
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "is_active" boolean not null default true,
    "created_by" uuid,
    "updated_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "maximum_amount" numeric(10,2),
    "individual_use_only" boolean not null default false,
    "exclude_sale_items" boolean not null default false,
    "usage_limit_per_customer" integer
);


alter table "public"."coupons" enable row level security;

create table "public"."email_templates" (
    "id" uuid not null default gen_random_uuid(),
    "code" text not null,
    "name" text not null,
    "subject" text not null,
    "body" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."email_templates" enable row level security;

create table "public"."favorite_sites" (
    "id" uuid not null,
    "user_id" uuid not null,
    "entry_id" uuid not null
);


alter table "public"."favorite_sites" enable row level security;

create table "public"."feedback_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "name" character varying(255) not null,
    "email" character varying(255) not null,
    "category" text[] not null,
    "priority" text[] not null,
    "subject" character varying(500) not null,
    "message" text not null,
    "status" character varying(50) default 'pending'::character varying,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "reviewed_at" timestamp with time zone,
    "reviewed_by" uuid,
    "admin_notes" text,
    "user_type" character varying(50) default 'user'::character varying,
    "is_internal" boolean default false
);


alter table "public"."feedback_submissions" enable row level security;

create table "public"."form_entries" (
    "id" uuid not null default gen_random_uuid(),
    "form_id" uuid,
    "status" text not null default 'active'::text,
    "ip_address" text,
    "user_agent" text,
    "created_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."form_entries" enable row level security;

create table "public"."form_entry_notes" (
    "id" uuid not null default gen_random_uuid(),
    "entry_id" uuid,
    "note" text not null,
    "type" text default 'note'::text,
    "created_by" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."form_entry_notes" enable row level security;

create table "public"."form_entry_values" (
    "id" uuid not null default gen_random_uuid(),
    "entry_id" uuid,
    "field_id" uuid,
    "value" text,
    "value_json" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."form_entry_values" enable row level security;

create table "public"."form_field_niche" (
    "id" uuid not null default gen_random_uuid(),
    "form_field_id" uuid,
    "options" text[],
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."form_field_niche" enable row level security;

create table "public"."form_field_settings" (
    "id" uuid not null default gen_random_uuid(),
    "field_id" uuid,
    "label_text" text,
    "label_visibility" text,
    "placeholder_text" text,
    "help_text" text,
    "is_required" boolean default false,
    "no_duplicates" boolean default false,
    "visibility" text default 'visible'::text,
    "validation_type" text,
    "validation_regex" text,
    "min_length" integer,
    "max_length" integer,
    "min_value" numeric,
    "max_value" numeric,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "field_identifier" text,
    "input_mask_enabled" boolean default false,
    "input_mask_pattern" text,
    "columns" smallint default 1,
    "max_selections" integer,
    "inline_layout" boolean default false,
    "allowed_extensions" text,
    "multiple_files" boolean default false,
    "max_files" integer,
    "max_file_size" integer,
    "product_currency" text default 'BRL'::text,
    "product_description" text,
    "commission_rate" numeric,
    "disable_quantity" boolean default false,
    "date_format" text default 'dd/mm/yyyy'::text,
    "time_format" text default 'HH:mm'::text,
    "countries" jsonb default '[]'::jsonb,
    "show_percentage" boolean default false,
    "country_field_id" text,
    "country_relation_enabled" boolean not null default false,
    "show_logo" boolean default true,
    "marketplace_label" text,
    "custom_button_text" boolean default false,
    "button_text" text,
    "position_last_column" boolean default false,
    "button_style" text default 'primary'::text,
    "sort_by_field" boolean default false,
    "is_product_name" boolean default false,
    "is_site_url" boolean default false
);


alter table "public"."form_field_settings" enable row level security;

create table "public"."form_fields" (
    "id" uuid not null default gen_random_uuid(),
    "form_id" uuid,
    "field_type" text not null,
    "label" text not null,
    "description" text,
    "placeholder" text,
    "default_value" text,
    "options" jsonb default '[]'::jsonb,
    "validation_rules" jsonb default '{}'::jsonb,
    "is_required" boolean default false,
    "position" integer not null default 0,
    "width" text default 'full'::text,
    "css_class" text,
    "created_by" uuid,
    "updated_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "modal_content" text
);


alter table "public"."form_fields" enable row level security;

create table "public"."forms" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text,
    "fields" jsonb not null default '[]'::jsonb,
    "validation_rules" jsonb not null default '{}'::jsonb,
    "success_message" text,
    "failure_message" text,
    "submit_button_text" text default 'Enviar'::text,
    "status" text not null default 'draft'::text,
    "created_by" uuid,
    "updated_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "redirect_page" text,
    "visible_to" text not null default 'all'::text,
    "no_data_message" text default 'No entries found'::text
);


alter table "public"."forms" enable row level security;

create table "public"."menu_items" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "icon" text,
    "path" text,
    "parent_id" uuid,
    "position" integer not null default 0,
    "is_visible" boolean not null default true,
    "requires_permission" text,
    "created_by" uuid,
    "updated_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "visible_to" text not null default 'all'::text
);


alter table "public"."menu_items" enable row level security;

create table "public"."order_chat" (
    "id" uuid not null default gen_random_uuid(),
    "order_id" uuid not null,
    "order_item_id" uuid not null,
    "entry_id" uuid,
    "sender_id" uuid not null,
    "sender_type" character varying(20) not null,
    "message" text not null,
    "is_read" boolean default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."order_chat" enable row level security;

create table "public"."order_items" (
    "id" uuid not null default gen_random_uuid(),
    "order_id" uuid not null,
    "entry_id" uuid,
    "product_name" text not null,
    "product_url" text,
    "quantity" integer not null default 1,
    "unit_price" numeric(10,2) not null,
    "total_price" numeric(10,2) not null,
    "niche" jsonb,
    "service_content" jsonb,
    "created_at" timestamp with time zone default now(),
    "article_document_path" text,
    "article_doc" text,
    "article_url_status" text default 'pending'::text,
    "publication_status" text default 'pending'::text,
    "article_url" text,
    "outline" jsonb
);


alter table "public"."order_items" enable row level security;

create table "public"."order_totals" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "total_product_price" numeric not null,
    "total_final_price" numeric not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "total_content_price" numeric,
    "total_word_count" integer default 0,
    "applied_coupon_id" uuid,
    "discount_value" numeric(10,2) default 0
);


alter table "public"."order_totals" enable row level security;

create table "public"."orders" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "status" text not null default 'pending'::text,
    "payment_method" text not null,
    "payment_status" text not null default 'pending'::text,
    "total_amount" numeric(10,2) not null,
    "billing_name" text not null,
    "billing_email" text not null,
    "billing_address" text not null,
    "billing_city" text not null,
    "billing_state" text not null,
    "billing_zip_code" text not null,
    "billing_document_number" text not null,
    "payment_id" text,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "phone" character varying(20),
    "aprovment_payment" timestamp without time zone,
    "idempotency_key" text
);


alter table "public"."orders" enable row level security;

create table "public"."pagarme_settings" (
    "id" uuid not null default gen_random_uuid(),
    "pagarme_webhook_secret" text,
    "pagarme_test_mode" boolean default true,
    "currency" text default 'BRL'::text,
    "payment_methods" text[] default ARRAY['credit_card'::text],
    "antifraude_enabled" boolean default true,
    "antifraude_min_amount" numeric(10,2) default 10.00,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."pagarme_settings" enable row level security;

create table "public"."pages" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "slug" text not null,
    "content" text not null,
    "meta_title" text,
    "meta_description" text,
    "status" text not null default 'draft'::text,
    "created_by" uuid,
    "updated_by" uuid,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "visible_to" text not null default 'all'::text
);


alter table "public"."pages" enable row level security;

create table "public"."payment_settings" (
    "id" uuid not null default gen_random_uuid(),
    "stripe_public_key" text,
    "stripe_secret_key" text,
    "stripe_webhook_secret" text,
    "stripe_enabled" boolean default false,
    "stripe_test_mode" boolean default true,
    "currency" text default 'BRL'::text,
    "payment_methods" text[] default ARRAY['card'::text],
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."payment_settings" enable row level security;

create table "public"."payments" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "order_id" uuid,
    "payment_method" text not null,
    "amount" numeric(10,2) not null,
    "status" text not null default 'pending'::text,
    "transaction_id" text,
    "metadata" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."payments" enable row level security;

create table "public"."permissions" (
    "id" uuid not null default gen_random_uuid(),
    "code" text not null,
    "name" text not null,
    "description" text,
    "category" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."permissions" enable row level security;

create table "public"."platform_users" (
    "id" uuid not null,
    "email" text not null,
    "first_name" text not null,
    "last_name" text not null,
    "phone" text,
    "role" text not null,
    "status" text not null default 'pending'::text,
    "terms_accepted" boolean not null default false,
    "terms_accepted_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "avatar_url" text,
    "role_id" uuid
);


alter table "public"."platform_users" enable row level security;

create table "public"."promotion_sites" (
    "id" uuid not null default gen_random_uuid(),
    "entry_id" uuid,
    "percent" numeric(5,2),
    "price" numeric(10,2),
    "old_price" numeric(10,2),
    "promotional_price" numeric(10,2),
    "old_promotional_price" numeric(10,2),
    "url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."promotion_sites" enable row level security;

create table "public"."publisher_services" (
    "id" uuid not null default gen_random_uuid(),
    "admin_id" uuid,
    "user_id" uuid,
    "current_id" uuid not null,
    "service_title" text not null,
    "service_type" text not null,
    "product_type" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "is_active" boolean not null default false
);


alter table "public"."publisher_services" enable row level security;

create table "public"."role_permissions" (
    "role_id" uuid not null,
    "permission_id" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."role_permissions" enable row level security;

create table "public"."roles" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."roles" enable row level security;

create table "public"."service_cards" (
    "id" uuid not null default gen_random_uuid(),
    "service_id" uuid,
    "title" text not null,
    "subtitle" text,
    "price" numeric(12,2) not null,
    "price_per_word" numeric(12,2) not null,
    "word_count" integer not null,
    "benefits" text[] not null,
    "not_benefits" text[],
    "period" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "order_layout" integer,
    "layout_toggle" boolean default false,
    "is_free" boolean
);


alter table "public"."service_cards" enable row level security;

create table "public"."services" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text,
    "status" text not null default 'draft'::text,
    "created_by" uuid,
    "updated_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."services" enable row level security;

create table "public"."settings" (
    "id" uuid not null default gen_random_uuid(),
    "light_logo" text,
    "dark_logo" text,
    "platform_icon" text,
    "smtp_host" text default 'smtp.resend.com'::text,
    "smtp_port" text default '465'::text,
    "smtp_user" text default 'resend'::text,
    "smtp_pass" text,
    "smtp_from_email" text default 'noreply@cp.suaimprensa.com.br'::text,
    "smtp_from_name" text default 'Sua Imprensa'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "site_title" text default 'Marketplace Platform'::text,
    "site_description" text default 'Plataforma de marketplace para conectar publishers e anunciantes'::text,
    "marketplace_in_test" boolean default false,
    "marketplace_in_maintenance" boolean default false,
    "marketplace_test_message" text default 'O marketplace est├í em modo de teste. Algumas funcionalidades podem n├úo estar dispon├¡veis.'::text,
    "marketplace_maintenance_message" text default 'O marketplace est├í temporariamente em manuten├º├úo. Tente novamente em alguns minutos.'::text,
    "header_scripts" text,
    "footer_scripts" text
);


alter table "public"."settings" enable row level security;

create table "public"."shopping_cart_items" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "entry_id" uuid,
    "quantity" integer not null default 1,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."shopping_cart_items" enable row level security;

create table "public"."trigger_debug_log" (
    "id" integer not null default nextval('trigger_debug_log_id_seq'::regclass),
    "trigger_name" text,
    "entry_id" uuid,
    "action_type" text,
    "message" text,
    "data" jsonb,
    "created_at" timestamp without time zone default now()
);


create table "public"."user_favorites" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "entry_id" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."user_favorites" enable row level security;

create table "public"."user_stats" (
    "id" integer not null default nextval('user_stats_id_seq'::regclass),
    "month_total" integer not null default 0,
    "name" text not null,
    "last_date" date not null,
    "year" integer not null
);


alter table "public"."user_stats" enable row level security;

alter sequence "public"."trigger_debug_log_id_seq" owned by "public"."trigger_debug_log"."id";

alter sequence "public"."user_stats_id_seq" owned by "public"."user_stats"."id";

CREATE UNIQUE INDEX admins_email_key ON public.admins USING btree (email);

CREATE UNIQUE INDEX admins_pkey ON public.admins USING btree (id);

CREATE UNIQUE INDEX best_selling_sites_entry_id_unique ON public.best_selling_sites USING btree (entry_id);

CREATE UNIQUE INDEX best_selling_sites_pkey ON public.best_selling_sites USING btree (id);

CREATE UNIQUE INDEX cart_checkout_resume_pkey ON public.cart_checkout_resume USING btree (id);

CREATE UNIQUE INDEX company_data_admin_unique ON public.company_data USING btree (admin_id);

CREATE UNIQUE INDEX company_data_pkey ON public.company_data USING btree (id);

CREATE UNIQUE INDEX contracts_pkey ON public.contracts USING btree (id);

CREATE UNIQUE INDEX coupons_code_key ON public.coupons USING btree (code);

CREATE UNIQUE INDEX coupons_pkey ON public.coupons USING btree (id);

CREATE UNIQUE INDEX email_templates_code_key ON public.email_templates USING btree (code);

CREATE UNIQUE INDEX email_templates_pkey ON public.email_templates USING btree (id);

CREATE UNIQUE INDEX favorite_sites_pkey ON public.favorite_sites USING btree (id);

CREATE UNIQUE INDEX feedback_submissions_pkey ON public.feedback_submissions USING btree (id);

CREATE UNIQUE INDEX form_entries_pkey ON public.form_entries USING btree (id);

CREATE UNIQUE INDEX form_entry_notes_pkey ON public.form_entry_notes USING btree (id);

CREATE UNIQUE INDEX form_entry_values_pkey ON public.form_entry_values USING btree (id);

CREATE UNIQUE INDEX form_field_niche_pkey ON public.form_field_niche USING btree (id);

CREATE UNIQUE INDEX form_field_settings_field_id_key ON public.form_field_settings USING btree (field_id);

CREATE UNIQUE INDEX form_field_settings_pkey ON public.form_field_settings USING btree (id);

CREATE UNIQUE INDEX form_fields_pkey ON public.form_fields USING btree (id);

CREATE UNIQUE INDEX forms_pkey ON public.forms USING btree (id);

CREATE INDEX idx_admins_email ON public.admins USING btree (email);

CREATE INDEX idx_admins_is_first_admin ON public.admins USING btree (is_first_admin);

CREATE INDEX idx_best_selling_sites_created_at ON public.best_selling_sites USING btree (created_at DESC);

CREATE INDEX idx_best_selling_sites_entry_id ON public.best_selling_sites USING btree (entry_id);

CREATE INDEX idx_best_selling_sites_product_name ON public.best_selling_sites USING btree (product_name);

CREATE INDEX idx_best_selling_sites_quantity ON public.best_selling_sites USING btree (quantity DESC);

CREATE INDEX idx_company_data_admin_id ON public.company_data USING btree (admin_id);

CREATE INDEX idx_company_data_document_number ON public.company_data USING btree (document_number);

CREATE INDEX idx_company_data_legal_status ON public.company_data USING btree (legal_status);

CREATE INDEX idx_contracts_admin_id ON public.contracts USING btree (admin_id);

CREATE INDEX idx_contracts_type ON public.contracts USING btree (type_of_contract);

CREATE UNIQUE INDEX idx_contracts_unique_admin_type ON public.contracts USING btree (admin_id, type_of_contract);

CREATE INDEX idx_coupons_code ON public.coupons USING btree (code);

CREATE INDEX idx_coupons_created_at ON public.coupons USING btree (created_at);

CREATE INDEX idx_coupons_dates ON public.coupons USING btree (start_date, end_date);

CREATE INDEX idx_coupons_exclude_sale_items ON public.coupons USING btree (exclude_sale_items);

CREATE INDEX idx_coupons_individual_use ON public.coupons USING btree (individual_use_only);

CREATE INDEX idx_coupons_is_active ON public.coupons USING btree (is_active);

CREATE INDEX idx_email_templates_code ON public.email_templates USING btree (code);

CREATE INDEX idx_feedback_category ON public.feedback_submissions USING gin (category);

CREATE INDEX idx_feedback_created_at ON public.feedback_submissions USING btree (created_at);

CREATE INDEX idx_feedback_email ON public.feedback_submissions USING btree (email);

CREATE INDEX idx_feedback_priority ON public.feedback_submissions USING gin (priority);

CREATE INDEX idx_feedback_status ON public.feedback_submissions USING btree (status);

CREATE INDEX idx_feedback_user_id ON public.feedback_submissions USING btree (user_id);

CREATE INDEX idx_feedback_user_type ON public.feedback_submissions USING btree (user_type);

CREATE INDEX idx_form_entries_created_at ON public.form_entries USING btree (created_at);

CREATE INDEX idx_form_entries_created_by ON public.form_entries USING btree (created_by);

CREATE INDEX idx_form_entries_form_id ON public.form_entries USING btree (form_id);

CREATE INDEX idx_form_entries_status ON public.form_entries USING btree (status);

CREATE INDEX idx_form_entry_notes_created_at ON public.form_entry_notes USING btree (created_at);

CREATE INDEX idx_form_entry_notes_entry_id ON public.form_entry_notes USING btree (entry_id);

CREATE INDEX idx_form_entry_values_entry_id ON public.form_entry_values USING btree (entry_id);

CREATE INDEX idx_form_entry_values_field_id ON public.form_entry_values USING btree (field_id);

CREATE INDEX idx_form_entry_values_updated_at ON public.form_entry_values USING btree (updated_at);

CREATE INDEX idx_form_entry_values_value ON public.form_entry_values USING btree (value);

CREATE INDEX idx_form_entry_values_value_json ON public.form_entry_values USING gin (value_json);

CREATE INDEX idx_form_entry_values_value_json_price ON public.form_entry_values USING gin (((value_json -> 'price'::text))) WHERE (value_json ? 'price'::text);

CREATE INDEX idx_form_entry_values_value_json_promotional_price ON public.form_entry_values USING gin (((value_json -> 'promotional_price'::text))) WHERE (value_json ? 'promotional_price'::text);

CREATE INDEX idx_form_field_settings_countries ON public.form_field_settings USING gin (countries);

CREATE INDEX idx_form_field_settings_country_field_id ON public.form_field_settings USING btree (country_field_id);

CREATE INDEX idx_form_field_settings_country_relation ON public.form_field_settings USING btree (country_relation_enabled);

CREATE INDEX idx_form_field_settings_field_id ON public.form_field_settings USING btree (field_id);

CREATE INDEX idx_form_field_settings_field_identifier ON public.form_field_settings USING btree (field_identifier);

CREATE INDEX idx_form_field_settings_is_product_name ON public.form_field_settings USING btree (is_product_name);

CREATE INDEX idx_form_field_settings_is_site_url ON public.form_field_settings USING btree (is_site_url);

CREATE INDEX idx_form_field_settings_max_selections ON public.form_field_settings USING btree (max_selections);

CREATE INDEX idx_form_field_settings_multiple_files ON public.form_field_settings USING btree (multiple_files);

CREATE INDEX idx_form_field_settings_sort_by_field ON public.form_field_settings USING btree (sort_by_field);

CREATE INDEX idx_form_field_settings_validation_type ON public.form_field_settings USING btree (validation_type);

CREATE INDEX idx_form_fields_field_type ON public.form_fields USING btree (field_type);

CREATE INDEX idx_form_fields_form_id ON public.form_fields USING btree (form_id);

CREATE INDEX idx_form_fields_position ON public.form_fields USING btree ("position");

CREATE INDEX idx_forms_redirect_page ON public.forms USING btree (redirect_page);

CREATE INDEX idx_forms_status ON public.forms USING btree (status);

CREATE INDEX idx_forms_visible_to ON public.forms USING btree (visible_to);

CREATE INDEX idx_menu_items_parent_id ON public.menu_items USING btree (parent_id);

CREATE INDEX idx_menu_items_position ON public.menu_items USING btree ("position");

CREATE INDEX idx_menu_items_visible_to ON public.menu_items USING btree (visible_to);

CREATE INDEX idx_order_chat_created_at ON public.order_chat USING btree (created_at);

CREATE INDEX idx_order_chat_is_read ON public.order_chat USING btree (is_read);

CREATE INDEX idx_order_chat_order_id ON public.order_chat USING btree (order_id);

CREATE INDEX idx_order_chat_order_item_id ON public.order_chat USING btree (order_item_id);

CREATE INDEX idx_order_chat_sender_id ON public.order_chat USING btree (sender_id);

CREATE INDEX idx_order_items_article_doc ON public.order_items USING btree (article_doc);

CREATE INDEX idx_order_items_article_url_status ON public.order_items USING btree (article_url_status);

CREATE INDEX idx_order_items_entry_id ON public.order_items USING btree (entry_id);

CREATE INDEX idx_order_items_has_outline ON public.order_items USING btree (((outline IS NOT NULL)));

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);

CREATE INDEX idx_order_items_outline ON public.order_items USING gin (outline);

CREATE INDEX idx_order_items_publication_status ON public.order_items USING btree (publication_status);

CREATE INDEX idx_order_totals_applied_coupon_id ON public.order_totals USING btree (applied_coupon_id);

CREATE INDEX idx_orders_payment_status ON public.orders USING btree (payment_status);

CREATE INDEX idx_orders_status ON public.orders USING btree (status);

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);

CREATE INDEX idx_pages_slug ON public.pages USING btree (slug);

CREATE INDEX idx_pages_status ON public.pages USING btree (status);

CREATE INDEX idx_pages_visible_to ON public.pages USING btree (visible_to);

CREATE INDEX idx_permissions_category ON public.permissions USING btree (category);

CREATE INDEX idx_permissions_code ON public.permissions USING btree (code);

CREATE INDEX idx_platform_users_email ON public.platform_users USING btree (email);

CREATE INDEX idx_platform_users_role ON public.platform_users USING btree (role);

CREATE INDEX idx_platform_users_role_status ON public.platform_users USING btree (role, status);

CREATE INDEX idx_platform_users_status ON public.platform_users USING btree (status);

CREATE INDEX idx_promotion_sites_created_at ON public.promotion_sites USING btree (created_at);

CREATE INDEX idx_promotion_sites_entry_id ON public.promotion_sites USING btree (entry_id);

CREATE INDEX idx_roles_name ON public.roles USING btree (name);

CREATE INDEX idx_services_status ON public.services USING btree (status);

CREATE INDEX idx_settings_footer_scripts ON public.settings USING btree (footer_scripts) WHERE (footer_scripts IS NOT NULL);

CREATE INDEX idx_settings_header_scripts ON public.settings USING btree (header_scripts) WHERE (header_scripts IS NOT NULL);

CREATE INDEX idx_settings_marketplace_modes ON public.settings USING btree (marketplace_in_test, marketplace_in_maintenance);

CREATE INDEX idx_settings_site_meta ON public.settings USING btree (site_title, site_description);

CREATE INDEX idx_shopping_cart_items_entry_id ON public.shopping_cart_items USING btree (entry_id);

CREATE INDEX idx_shopping_cart_items_user_id ON public.shopping_cart_items USING btree (user_id);

CREATE INDEX idx_user_favorites_entry_id ON public.user_favorites USING btree (entry_id);

CREATE INDEX idx_user_favorites_user_id ON public.user_favorites USING btree (user_id);

CREATE UNIQUE INDEX menu_items_pkey ON public.menu_items USING btree (id);

CREATE UNIQUE INDEX order_chat_pkey ON public.order_chat USING btree (id);

CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);

CREATE UNIQUE INDEX order_totals_pkey ON public.order_totals USING btree (id);

CREATE UNIQUE INDEX orders_idempotency_key_key ON public.orders USING btree (idempotency_key);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX pagarme_settings_pkey ON public.pagarme_settings USING btree (id);

CREATE UNIQUE INDEX pages_pkey ON public.pages USING btree (id);

CREATE UNIQUE INDEX pages_slug_key ON public.pages USING btree (slug);

CREATE UNIQUE INDEX payment_settings_pkey ON public.payment_settings USING btree (id);

CREATE UNIQUE INDEX payments_pkey ON public.payments USING btree (id);

CREATE UNIQUE INDEX permissions_code_key ON public.permissions USING btree (code);

CREATE UNIQUE INDEX permissions_pkey ON public.permissions USING btree (id);

CREATE UNIQUE INDEX platform_users_email_key ON public.platform_users USING btree (email);

CREATE UNIQUE INDEX platform_users_pkey ON public.platform_users USING btree (id);

CREATE UNIQUE INDEX promotion_sites_pkey ON public.promotion_sites USING btree (id);

CREATE UNIQUE INDEX publisher_services_pkey ON public.publisher_services USING btree (id);

CREATE UNIQUE INDEX role_permissions_pkey ON public.role_permissions USING btree (role_id, permission_id);

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);

CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (id);

CREATE UNIQUE INDEX service_cards_pkey ON public.service_cards USING btree (id);

CREATE UNIQUE INDEX services_pkey ON public.services USING btree (id);

CREATE UNIQUE INDEX settings_pkey ON public.settings USING btree (id);

CREATE UNIQUE INDEX shopping_cart_items_pkey ON public.shopping_cart_items USING btree (id);

CREATE UNIQUE INDEX shopping_cart_items_user_entry_unique ON public.shopping_cart_items USING btree (user_id, entry_id);

CREATE UNIQUE INDEX trigger_debug_log_pkey ON public.trigger_debug_log USING btree (id);

CREATE UNIQUE INDEX unique_entry_field ON public.form_entry_values USING btree (entry_id, field_id);

CREATE UNIQUE INDEX unique_entry_id ON public.promotion_sites USING btree (entry_id);

CREATE UNIQUE INDEX user_favorites_pkey ON public.user_favorites USING btree (id);

CREATE UNIQUE INDEX user_favorites_user_entry_unique ON public.user_favorites USING btree (user_id, entry_id);

CREATE UNIQUE INDEX user_stats_pkey ON public.user_stats USING btree (id);

alter table "public"."admins" add constraint "admins_pkey" PRIMARY KEY using index "admins_pkey";

alter table "public"."best_selling_sites" add constraint "best_selling_sites_pkey" PRIMARY KEY using index "best_selling_sites_pkey";

alter table "public"."cart_checkout_resume" add constraint "cart_checkout_resume_pkey" PRIMARY KEY using index "cart_checkout_resume_pkey";

alter table "public"."company_data" add constraint "company_data_pkey" PRIMARY KEY using index "company_data_pkey";

alter table "public"."contracts" add constraint "contracts_pkey" PRIMARY KEY using index "contracts_pkey";

alter table "public"."coupons" add constraint "coupons_pkey" PRIMARY KEY using index "coupons_pkey";

alter table "public"."email_templates" add constraint "email_templates_pkey" PRIMARY KEY using index "email_templates_pkey";

alter table "public"."favorite_sites" add constraint "favorite_sites_pkey" PRIMARY KEY using index "favorite_sites_pkey";

alter table "public"."feedback_submissions" add constraint "feedback_submissions_pkey" PRIMARY KEY using index "feedback_submissions_pkey";

alter table "public"."form_entries" add constraint "form_entries_pkey" PRIMARY KEY using index "form_entries_pkey";

alter table "public"."form_entry_notes" add constraint "form_entry_notes_pkey" PRIMARY KEY using index "form_entry_notes_pkey";

alter table "public"."form_entry_values" add constraint "form_entry_values_pkey" PRIMARY KEY using index "form_entry_values_pkey";

alter table "public"."form_field_niche" add constraint "form_field_niche_pkey" PRIMARY KEY using index "form_field_niche_pkey";

alter table "public"."form_field_settings" add constraint "form_field_settings_pkey" PRIMARY KEY using index "form_field_settings_pkey";

alter table "public"."form_fields" add constraint "form_fields_pkey" PRIMARY KEY using index "form_fields_pkey";

alter table "public"."forms" add constraint "forms_pkey" PRIMARY KEY using index "forms_pkey";

alter table "public"."menu_items" add constraint "menu_items_pkey" PRIMARY KEY using index "menu_items_pkey";

alter table "public"."order_chat" add constraint "order_chat_pkey" PRIMARY KEY using index "order_chat_pkey";

alter table "public"."order_items" add constraint "order_items_pkey" PRIMARY KEY using index "order_items_pkey";

alter table "public"."order_totals" add constraint "order_totals_pkey" PRIMARY KEY using index "order_totals_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."pagarme_settings" add constraint "pagarme_settings_pkey" PRIMARY KEY using index "pagarme_settings_pkey";

alter table "public"."pages" add constraint "pages_pkey" PRIMARY KEY using index "pages_pkey";

alter table "public"."payment_settings" add constraint "payment_settings_pkey" PRIMARY KEY using index "payment_settings_pkey";

alter table "public"."payments" add constraint "payments_pkey" PRIMARY KEY using index "payments_pkey";

alter table "public"."permissions" add constraint "permissions_pkey" PRIMARY KEY using index "permissions_pkey";

alter table "public"."platform_users" add constraint "platform_users_pkey" PRIMARY KEY using index "platform_users_pkey";

alter table "public"."promotion_sites" add constraint "promotion_sites_pkey" PRIMARY KEY using index "promotion_sites_pkey";

alter table "public"."publisher_services" add constraint "publisher_services_pkey" PRIMARY KEY using index "publisher_services_pkey";

alter table "public"."role_permissions" add constraint "role_permissions_pkey" PRIMARY KEY using index "role_permissions_pkey";

alter table "public"."roles" add constraint "roles_pkey" PRIMARY KEY using index "roles_pkey";

alter table "public"."service_cards" add constraint "service_cards_pkey" PRIMARY KEY using index "service_cards_pkey";

alter table "public"."services" add constraint "services_pkey" PRIMARY KEY using index "services_pkey";

alter table "public"."settings" add constraint "settings_pkey" PRIMARY KEY using index "settings_pkey";

alter table "public"."shopping_cart_items" add constraint "shopping_cart_items_pkey" PRIMARY KEY using index "shopping_cart_items_pkey";

alter table "public"."trigger_debug_log" add constraint "trigger_debug_log_pkey" PRIMARY KEY using index "trigger_debug_log_pkey";

alter table "public"."user_favorites" add constraint "user_favorites_pkey" PRIMARY KEY using index "user_favorites_pkey";

alter table "public"."user_stats" add constraint "user_stats_pkey" PRIMARY KEY using index "user_stats_pkey";

alter table "public"."admins" add constraint "admins_email_key" UNIQUE using index "admins_email_key";

alter table "public"."admins" add constraint "admins_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) not valid;

alter table "public"."admins" validate constraint "admins_id_fkey";

alter table "public"."admins" add constraint "admins_role_id_fkey" FOREIGN KEY (role_id) REFERENCES roles(id) not valid;

alter table "public"."admins" validate constraint "admins_role_id_fkey";

alter table "public"."best_selling_sites" add constraint "best_selling_sites_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES form_entries(id) ON DELETE CASCADE not valid;

alter table "public"."best_selling_sites" validate constraint "best_selling_sites_entry_id_fkey";

alter table "public"."best_selling_sites" add constraint "best_selling_sites_entry_id_unique" UNIQUE using index "best_selling_sites_entry_id_unique";

alter table "public"."cart_checkout_resume" add constraint "cart_checkout_resume_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES form_entries(id) ON DELETE SET NULL not valid;

alter table "public"."cart_checkout_resume" validate constraint "cart_checkout_resume_entry_id_fkey";

alter table "public"."company_data" add constraint "company_data_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE not valid;

alter table "public"."company_data" validate constraint "company_data_admin_id_fkey";

alter table "public"."company_data" add constraint "company_data_admin_unique" UNIQUE using index "company_data_admin_unique";

alter table "public"."company_data" add constraint "company_data_bank_transfer_type_check" CHECK ((bank_transfer_type = ANY (ARRAY['domestic'::text, 'international'::text]))) not valid;

alter table "public"."company_data" validate constraint "company_data_bank_transfer_type_check";

alter table "public"."company_data" add constraint "company_data_legal_status_check" CHECK ((legal_status = ANY (ARRAY['business'::text, 'individual'::text]))) not valid;

alter table "public"."company_data" validate constraint "company_data_legal_status_check";

alter table "public"."company_data" add constraint "company_data_user_id_fkey" FOREIGN KEY (user_id) REFERENCES platform_users(id) not valid;

alter table "public"."company_data" validate constraint "company_data_user_id_fkey";

alter table "public"."company_data" add constraint "company_data_withdrawal_method_check" CHECK ((withdrawal_method = ANY (ARRAY['bank'::text, 'paypal'::text, 'pix'::text, 'other'::text]))) not valid;

alter table "public"."company_data" validate constraint "company_data_withdrawal_method_check";

alter table "public"."contracts" add constraint "contracts_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE not valid;

alter table "public"."contracts" validate constraint "contracts_admin_id_fkey";

alter table "public"."contracts" add constraint "contracts_type_of_contract_check" CHECK ((type_of_contract = ANY (ARRAY['termos_condicoes'::text, 'contrato_pf'::text, 'contrato_cnpj'::text, 'politica_privacidade'::text]))) not valid;

alter table "public"."contracts" validate constraint "contracts_type_of_contract_check";

alter table "public"."coupons" add constraint "check_usage_limit_per_customer" CHECK (((usage_limit_per_customer IS NULL) OR (usage_limit_per_customer > 0))) not valid;

alter table "public"."coupons" validate constraint "check_usage_limit_per_customer";

alter table "public"."coupons" add constraint "coupons_code_key" UNIQUE using index "coupons_code_key";

alter table "public"."coupons" add constraint "coupons_created_by_fkey" FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL not valid;

alter table "public"."coupons" validate constraint "coupons_created_by_fkey";

alter table "public"."coupons" add constraint "coupons_discount_type_check" CHECK ((discount_type = ANY (ARRAY['percentage'::text, 'cart_fixed'::text, 'product_fixed'::text]))) not valid;

alter table "public"."coupons" validate constraint "coupons_discount_type_check";

alter table "public"."coupons" add constraint "coupons_discount_value_check" CHECK ((discount_value > (0)::numeric)) not valid;

alter table "public"."coupons" validate constraint "coupons_discount_value_check";

alter table "public"."coupons" add constraint "coupons_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL not valid;

alter table "public"."coupons" validate constraint "coupons_updated_by_fkey";

alter table "public"."coupons" add constraint "coupons_usage_limit_check" CHECK ((usage_limit > 0)) not valid;

alter table "public"."coupons" validate constraint "coupons_usage_limit_check";

alter table "public"."coupons" add constraint "valid_date_range" CHECK (((end_date IS NULL) OR (start_date IS NULL) OR (end_date > start_date))) not valid;

alter table "public"."coupons" validate constraint "valid_date_range";

alter table "public"."coupons" add constraint "valid_percentage" CHECK (((discount_type <> 'percentage'::text) OR ((discount_value >= (0)::numeric) AND (discount_value <= (100)::numeric)))) not valid;

alter table "public"."coupons" validate constraint "valid_percentage";

alter table "public"."email_templates" add constraint "email_templates_code_key" UNIQUE using index "email_templates_code_key";

alter table "public"."favorite_sites" add constraint "favorite_sites_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES form_entries(id) ON DELETE CASCADE not valid;

alter table "public"."favorite_sites" validate constraint "favorite_sites_entry_id_fkey";

alter table "public"."form_entries" add constraint "form_entries_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."form_entries" validate constraint "form_entries_created_by_fkey";

alter table "public"."form_entries" add constraint "form_entries_form_id_fkey" FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE not valid;

alter table "public"."form_entries" validate constraint "form_entries_form_id_fkey";

alter table "public"."form_entries" add constraint "form_entries_status_check" CHECK ((status = ANY (ARRAY['em_analise'::text, 'verificado'::text, 'reprovado'::text, 'active'::text, 'spam'::text, 'trash'::text]))) not valid;

alter table "public"."form_entries" validate constraint "form_entries_status_check";

alter table "public"."form_entry_notes" add constraint "form_entry_notes_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."form_entry_notes" validate constraint "form_entry_notes_created_by_fkey";

alter table "public"."form_entry_notes" add constraint "form_entry_notes_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES form_entries(id) ON DELETE CASCADE not valid;

alter table "public"."form_entry_notes" validate constraint "form_entry_notes_entry_id_fkey";

alter table "public"."form_entry_notes" add constraint "form_entry_notes_type_check" CHECK ((type = ANY (ARRAY['note'::text, 'system'::text]))) not valid;

alter table "public"."form_entry_notes" validate constraint "form_entry_notes_type_check";

alter table "public"."form_entry_values" add constraint "form_entry_values_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES form_entries(id) ON DELETE CASCADE not valid;

alter table "public"."form_entry_values" validate constraint "form_entry_values_entry_id_fkey";

alter table "public"."form_entry_values" add constraint "form_entry_values_field_id_fkey" FOREIGN KEY (field_id) REFERENCES form_fields(id) ON DELETE CASCADE not valid;

alter table "public"."form_entry_values" validate constraint "form_entry_values_field_id_fkey";

alter table "public"."form_entry_values" add constraint "unique_entry_field" UNIQUE using index "unique_entry_field";

alter table "public"."form_field_niche" add constraint "form_field_niche_form_field_id_fkey" FOREIGN KEY (form_field_id) REFERENCES form_fields(id) ON DELETE CASCADE not valid;

alter table "public"."form_field_niche" validate constraint "form_field_niche_form_field_id_fkey";

alter table "public"."form_field_settings" add constraint "form_field_settings_columns_check" CHECK ((columns = ANY (ARRAY[1, 2, 3]))) not valid;

alter table "public"."form_field_settings" validate constraint "form_field_settings_columns_check";

alter table "public"."form_field_settings" add constraint "form_field_settings_field_id_fkey" FOREIGN KEY (field_id) REFERENCES form_fields(id) ON DELETE CASCADE not valid;

alter table "public"."form_field_settings" validate constraint "form_field_settings_field_id_fkey";

alter table "public"."form_field_settings" add constraint "form_field_settings_field_id_key" UNIQUE using index "form_field_settings_field_id_key";

alter table "public"."form_field_settings" add constraint "form_field_settings_label_visibility_check" CHECK ((label_visibility = ANY (ARRAY['visible'::text, 'hidden'::text]))) not valid;

alter table "public"."form_field_settings" validate constraint "form_field_settings_label_visibility_check";

alter table "public"."form_field_settings" add constraint "form_field_settings_max_file_size_check" CHECK ((max_file_size > 0)) not valid;

alter table "public"."form_field_settings" validate constraint "form_field_settings_max_file_size_check";

alter table "public"."form_field_settings" add constraint "form_field_settings_max_files_check" CHECK ((max_files > 0)) not valid;

alter table "public"."form_field_settings" validate constraint "form_field_settings_max_files_check";

alter table "public"."form_field_settings" add constraint "form_field_settings_max_selections_check" CHECK ((max_selections > 0)) not valid;

alter table "public"."form_field_settings" validate constraint "form_field_settings_max_selections_check";

alter table "public"."form_field_settings" add constraint "form_field_settings_visibility_check" CHECK ((visibility = ANY (ARRAY['visible'::text, 'hidden'::text, 'admin'::text, 'marketplace'::text]))) not valid;

alter table "public"."form_field_settings" validate constraint "form_field_settings_visibility_check";

alter table "public"."form_fields" add constraint "form_fields_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."form_fields" validate constraint "form_fields_created_by_fkey";

alter table "public"."form_fields" add constraint "form_fields_field_type_check" CHECK ((field_type = ANY (ARRAY['text'::text, 'textarea'::text, 'number'::text, 'email'::text, 'phone'::text, 'url'::text, 'date'::text, 'time'::text, 'select'::text, 'multiselect'::text, 'radio'::text, 'checkbox'::text, 'toggle'::text, 'section'::text, 'file'::text, 'html'::text, 'country'::text, 'brazilian_states'::text, 'moz_da'::text, 'semrush_as'::text, 'ahrefs_dr'::text, 'ahrefs_traffic'::text, 'similarweb_traffic'::text, 'google_traffic'::text, 'brand'::text, 'button_buy'::text, 'commission'::text, 'product'::text, 'niche'::text, 'import_csv'::text]))) not valid;

alter table "public"."form_fields" validate constraint "form_fields_field_type_check";

alter table "public"."form_fields" add constraint "form_fields_form_id_fkey" FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE not valid;

alter table "public"."form_fields" validate constraint "form_fields_form_id_fkey";

alter table "public"."form_fields" add constraint "form_fields_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."form_fields" validate constraint "form_fields_updated_by_fkey";

alter table "public"."form_fields" add constraint "form_fields_width_check" CHECK ((width = ANY (ARRAY['full'::text, 'half'::text, 'third'::text, 'quarter'::text]))) not valid;

alter table "public"."form_fields" validate constraint "form_fields_width_check";

alter table "public"."forms" add constraint "forms_created_by_fkey" FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL not valid;

alter table "public"."forms" validate constraint "forms_created_by_fkey";

alter table "public"."forms" add constraint "forms_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))) not valid;

alter table "public"."forms" validate constraint "forms_status_check";

alter table "public"."forms" add constraint "forms_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL not valid;

alter table "public"."forms" validate constraint "forms_updated_by_fkey";

alter table "public"."forms" add constraint "forms_visible_to_check" CHECK ((visible_to = ANY (ARRAY['all'::text, 'publisher'::text, 'advertiser'::text]))) not valid;

alter table "public"."forms" validate constraint "forms_visible_to_check";

alter table "public"."menu_items" add constraint "menu_items_created_by_fkey" FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL not valid;

alter table "public"."menu_items" validate constraint "menu_items_created_by_fkey";

alter table "public"."menu_items" add constraint "menu_items_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE not valid;

alter table "public"."menu_items" validate constraint "menu_items_parent_id_fkey";

alter table "public"."menu_items" add constraint "menu_items_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL not valid;

alter table "public"."menu_items" validate constraint "menu_items_updated_by_fkey";

alter table "public"."menu_items" add constraint "menu_items_visible_to_check" CHECK ((visible_to = ANY (ARRAY['all'::text, 'publisher'::text, 'advertiser'::text]))) not valid;

alter table "public"."menu_items" validate constraint "menu_items_visible_to_check";

alter table "public"."order_chat" add constraint "fk_order_chat_order" FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_chat" validate constraint "fk_order_chat_order";

alter table "public"."order_chat" add constraint "fk_order_chat_order_item" FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE not valid;

alter table "public"."order_chat" validate constraint "fk_order_chat_order_item";

alter table "public"."order_chat" add constraint "fk_order_chat_sender" FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."order_chat" validate constraint "fk_order_chat_sender";

alter table "public"."order_chat" add constraint "order_chat_sender_type_check" CHECK (((sender_type)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[]))) not valid;

alter table "public"."order_chat" validate constraint "order_chat_sender_type_check";

alter table "public"."order_items" add constraint "order_items_article_url_status_check" CHECK ((article_url_status = ANY (ARRAY['pending'::text, 'sent'::text]))) not valid;

alter table "public"."order_items" validate constraint "order_items_article_url_status_check";

alter table "public"."order_items" add constraint "order_items_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES form_entries(id) ON DELETE SET NULL not valid;

alter table "public"."order_items" validate constraint "order_items_entry_id_fkey";

alter table "public"."order_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_order_id_fkey";

alter table "public"."order_items" add constraint "order_items_publication_status_check" CHECK ((publication_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))) not valid;

alter table "public"."order_items" validate constraint "order_items_publication_status_check";

alter table "public"."order_totals" add constraint "order_totals_applied_coupon_id_fkey" FOREIGN KEY (applied_coupon_id) REFERENCES coupons(id) ON DELETE SET NULL not valid;

alter table "public"."order_totals" validate constraint "order_totals_applied_coupon_id_fkey";

alter table "public"."order_totals" add constraint "order_totals_discount_value_check" CHECK ((discount_value >= (0)::numeric)) not valid;

alter table "public"."order_totals" validate constraint "order_totals_discount_value_check";

alter table "public"."orders" add constraint "orders_idempotency_key_key" UNIQUE using index "orders_idempotency_key_key";

alter table "public"."orders" add constraint "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_user_id_fkey";

alter table "public"."pages" add constraint "pages_created_by_fkey" FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL not valid;

alter table "public"."pages" validate constraint "pages_created_by_fkey";

alter table "public"."pages" add constraint "pages_slug_key" UNIQUE using index "pages_slug_key";

alter table "public"."pages" add constraint "pages_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))) not valid;

alter table "public"."pages" validate constraint "pages_status_check";

alter table "public"."pages" add constraint "pages_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL not valid;

alter table "public"."pages" validate constraint "pages_updated_by_fkey";

alter table "public"."pages" add constraint "pages_visible_to_check" CHECK ((visible_to = ANY (ARRAY['all'::text, 'publisher'::text, 'advertiser'::text]))) not valid;

alter table "public"."pages" validate constraint "pages_visible_to_check";

alter table "public"."payments" add constraint "payments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."payments" validate constraint "payments_user_id_fkey";

alter table "public"."permissions" add constraint "permissions_code_key" UNIQUE using index "permissions_code_key";

alter table "public"."platform_users" add constraint "platform_users_email_key" UNIQUE using index "platform_users_email_key";

alter table "public"."platform_users" add constraint "platform_users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."platform_users" validate constraint "platform_users_id_fkey";

alter table "public"."platform_users" add constraint "platform_users_role_check" CHECK ((role = ANY (ARRAY['advertiser'::text, 'publisher'::text]))) not valid;

alter table "public"."platform_users" validate constraint "platform_users_role_check";

alter table "public"."platform_users" add constraint "platform_users_role_id_fkey" FOREIGN KEY (role_id) REFERENCES roles(id) not valid;

alter table "public"."platform_users" validate constraint "platform_users_role_id_fkey";

alter table "public"."platform_users" add constraint "platform_users_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'suspended'::text]))) not valid;

alter table "public"."platform_users" validate constraint "platform_users_status_check";

alter table "public"."promotion_sites" add constraint "promotion_sites_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES form_entries(id) ON DELETE CASCADE not valid;

alter table "public"."promotion_sites" validate constraint "promotion_sites_entry_id_fkey";

alter table "public"."promotion_sites" add constraint "promotion_sites_old_price_check" CHECK ((old_price >= (0)::numeric)) not valid;

alter table "public"."promotion_sites" validate constraint "promotion_sites_old_price_check";

alter table "public"."promotion_sites" add constraint "promotion_sites_old_promotional_price_check" CHECK ((old_promotional_price >= (0)::numeric)) not valid;

alter table "public"."promotion_sites" validate constraint "promotion_sites_old_promotional_price_check";

alter table "public"."promotion_sites" add constraint "promotion_sites_percent_check" CHECK (((percent >= (0)::numeric) AND (percent <= (100)::numeric))) not valid;

alter table "public"."promotion_sites" validate constraint "promotion_sites_percent_check";

alter table "public"."promotion_sites" add constraint "promotion_sites_price_check" CHECK ((price >= (0)::numeric)) not valid;

alter table "public"."promotion_sites" validate constraint "promotion_sites_price_check";

alter table "public"."promotion_sites" add constraint "promotion_sites_promotional_price_check" CHECK ((promotional_price >= (0)::numeric)) not valid;

alter table "public"."promotion_sites" validate constraint "promotion_sites_promotional_price_check";

alter table "public"."promotion_sites" add constraint "unique_entry_id" UNIQUE using index "unique_entry_id";

alter table "public"."publisher_services" add constraint "publisher_services_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES admins(id) not valid;

alter table "public"."publisher_services" validate constraint "publisher_services_admin_id_fkey";

alter table "public"."publisher_services" add constraint "publisher_services_product_type_fkey" FOREIGN KEY (product_type) REFERENCES forms(id) not valid;

alter table "public"."publisher_services" validate constraint "publisher_services_product_type_fkey";

alter table "public"."publisher_services" add constraint "publisher_services_user_id_fkey" FOREIGN KEY (user_id) REFERENCES platform_users(id) not valid;

alter table "public"."publisher_services" validate constraint "publisher_services_user_id_fkey";

alter table "public"."role_permissions" add constraint "role_permissions_permission_id_fkey" FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE not valid;

alter table "public"."role_permissions" validate constraint "role_permissions_permission_id_fkey";

alter table "public"."role_permissions" add constraint "role_permissions_role_id_fkey" FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE not valid;

alter table "public"."role_permissions" validate constraint "role_permissions_role_id_fkey";

alter table "public"."roles" add constraint "roles_name_key" UNIQUE using index "roles_name_key";

alter table "public"."service_cards" add constraint "period_not_empty" CHECK ((char_length(TRIM(BOTH FROM period)) > 0)) not valid;

alter table "public"."service_cards" validate constraint "period_not_empty";

alter table "public"."service_cards" add constraint "service_cards_service_id_fkey" FOREIGN KEY (service_id) REFERENCES publisher_services(id) ON DELETE CASCADE not valid;

alter table "public"."service_cards" validate constraint "service_cards_service_id_fkey";

alter table "public"."service_cards" add constraint "title_not_empty" CHECK ((char_length(TRIM(BOTH FROM title)) > 0)) not valid;

alter table "public"."service_cards" validate constraint "title_not_empty";

alter table "public"."services" add constraint "services_created_by_fkey" FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL not valid;

alter table "public"."services" validate constraint "services_created_by_fkey";

alter table "public"."services" add constraint "services_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))) not valid;

alter table "public"."services" validate constraint "services_status_check";

alter table "public"."services" add constraint "services_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL not valid;

alter table "public"."services" validate constraint "services_updated_by_fkey";

alter table "public"."shopping_cart_items" add constraint "shopping_cart_items_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES form_entries(id) ON DELETE CASCADE not valid;

alter table "public"."shopping_cart_items" validate constraint "shopping_cart_items_entry_id_fkey";

alter table "public"."shopping_cart_items" add constraint "shopping_cart_items_quantity_check" CHECK ((quantity > 0)) not valid;

alter table "public"."shopping_cart_items" validate constraint "shopping_cart_items_quantity_check";

alter table "public"."shopping_cart_items" add constraint "shopping_cart_items_user_entry_unique" UNIQUE using index "shopping_cart_items_user_entry_unique";

alter table "public"."shopping_cart_items" add constraint "shopping_cart_items_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."shopping_cart_items" validate constraint "shopping_cart_items_user_id_fkey";

alter table "public"."user_favorites" add constraint "user_favorites_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES form_entries(id) ON DELETE CASCADE not valid;

alter table "public"."user_favorites" validate constraint "user_favorites_entry_id_fkey";

alter table "public"."user_favorites" add constraint "user_favorites_user_entry_unique" UNIQUE using index "user_favorites_user_entry_unique";

alter table "public"."user_favorites" add constraint "user_favorites_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_favorites" validate constraint "user_favorites_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_max_selections_column()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Add max_selections column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'form_field_settings' 
    AND column_name = 'max_selections'
  ) THEN
    ALTER TABLE form_field_settings
    ADD COLUMN max_selections integer CHECK (max_selections > 0);
    
    -- Create index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_form_field_settings_max_selections 
    ON form_field_settings(max_selections);
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.analyze_form_entry_data()
 RETURNS TABLE(entry_id_val uuid, has_price_json boolean, has_url_in_value boolean, value_content text, value_json_content text, extracted_price text, extracted_promotional_price text, extracted_url text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        fev.entry_id,
        (fev.value_json ? 'price') AS has_price_json,
        (fev.value ~ '^https?://') AS has_url_in_value,
        LEFT(COALESCE(fev.value, 'NULL'), 100) AS value_content,
        LEFT(COALESCE(fev.value_json::TEXT, 'NULL'), 100) AS value_json_content,
        COALESCE(fev.value_json->>'price', 'NULL') AS extracted_price,
        COALESCE(fev.value_json->>'promotional_price', 'NULL') AS extracted_promotional_price,
        CASE 
            WHEN fev.value ~ '^https?://' THEN fev.value
            ELSE 'NOT_URL'
        END AS extracted_url
    FROM form_entry_values fev
    ORDER BY fev.created_at DESC
    LIMIT 10;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.auto_populate_best_selling_sites()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Insert new record or update existing one using UPSERT
  INSERT INTO best_selling_sites (
    entry_id,
    product_name,
    product_url,
    quantity,
    created_at,
    updated_at
  )
  VALUES (
    NEW.entry_id,
    NEW.product_name,
    NEW.product_url,
    NEW.quantity,
    now(),
    now()
  )
  ON CONFLICT (entry_id) 
  DO UPDATE SET
    product_name = EXCLUDED.product_name,
    product_url = EXCLUDED.product_url,
    quantity = best_selling_sites.quantity + EXCLUDED.quantity,
    updated_at = now();

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.debug_price_processing(p_entry_id uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  price_val NUMERIC;
  promotional_price_val NUMERIC;
  percent_val NUMERIC;
  price_data JSONB;
  value_text TEXT;
  debug_info TEXT := '';
BEGIN
  debug_info := 'Processando entry_id: ' || p_entry_id || E'\n';
  
  -- Busca value
  SELECT value INTO value_text
  FROM form_entry_values
  WHERE entry_id = p_entry_id
    AND value IS NOT NULL
    AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%');
  
  price_data := value_text::jsonb;
  debug_info := debug_info || 'price original: ' || COALESCE((price_data->>'price'), 'NULL') || E'\n';
  debug_info := debug_info || 'promotional_price original: ' || COALESCE((price_data->>'promotional_price'), 'NULL') || E'\n';
  
  -- Normalizar price
  BEGIN
    price_val := COALESCE(
      REPLACE(
        REGEXP_REPLACE((price_data::jsonb)->>'price', '[^0-9,\.]', '', 'g'),
        ',', '.'
      )::NUMERIC, 0
    );
    debug_info := debug_info || 'price normalizado: ' || price_val || E'\n';
  EXCEPTION WHEN OTHERS THEN
    debug_info := debug_info || 'Erro no price: ' || SQLERRM || E'\n';
    price_val := 0;
  END;
  
  -- Normalizar promotional_price
  BEGIN
    promotional_price_val := COALESCE(
      REPLACE(
        REGEXP_REPLACE((price_data::jsonb)->>'promotional_price', '[^0-9,\.]', '', 'g'),
        ',', '.'
      )::NUMERIC, 0
    );
    debug_info := debug_info || 'promotional_price normalizado: ' || promotional_price_val || E'\n';
  EXCEPTION WHEN OTHERS THEN
    debug_info := debug_info || 'Erro no promotional_price: ' || SQLERRM || E'\n';
    promotional_price_val := 0;
  END;
  
  -- Valida├º├úo
  debug_info := debug_info || 'Valida├º├úo:' || E'\n';
  debug_info := debug_info || '- price_val > 0: ' || (price_val > 0) || E'\n';
  debug_info := debug_info || '- promotional_price_val > 0: ' || (promotional_price_val > 0) || E'\n';
  debug_info := debug_info || '- promotional_price_val < price_val: ' || (promotional_price_val < price_val) || E'\n';
  
  IF price_val > 0 AND promotional_price_val > 0 AND promotional_price_val < price_val THEN
    percent_val := ROUND(((price_val - promotional_price_val) / price_val * 100), 2);
    debug_info := debug_info || 'Desconto calculado: ' || percent_val || '%' || E'\n';
    debug_info := debug_info || 'RESULTADO: SERIA INSERIDO' || E'\n';
  ELSE
    debug_info := debug_info || 'RESULTADO: SERIA IGNORADO' || E'\n';
  END IF;
  
  RETURN debug_info;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.debug_promotion_processing(p_entry_id uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  price_val NUMERIC;
  promotional_price_val NUMERIC;
  price_data JSONB;
  valuejson_text TEXT;
  value_text TEXT;
  debug_info TEXT := '';
BEGIN
  debug_info := 'Processando entry_id: ' || p_entry_id || E'\n';
  
  -- Busca value_json
  SELECT value_json::TEXT INTO valuejson_text
  FROM form_entry_values
  WHERE entry_id = p_entry_id
    AND value_json IS NOT NULL;
  
  debug_info := debug_info || 'value_json encontrado: ' || COALESCE(valuejson_text, 'NULL') || E'\n';
  
  -- Busca value
  SELECT value INTO value_text
  FROM form_entry_values
  WHERE entry_id = p_entry_id
    AND value IS NOT NULL
    AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%');
  
  debug_info := debug_info || 'value encontrado: ' || COALESCE(value_text, 'NULL') || E'\n';
  
  -- Tenta converter
  IF value_text IS NOT NULL THEN
    BEGIN
      price_data := value_text::jsonb;
      debug_info := debug_info || 'Convers├úo para jsonb: OK' || E'\n';
      debug_info := debug_info || 'price: ' || COALESCE((price_data->>'price'), 'NULL') || E'\n';
      debug_info := debug_info || 'promotional_price: ' || COALESCE((price_data->>'promotional_price'), 'NULL') || E'\n';
    EXCEPTION WHEN OTHERS THEN
      debug_info := debug_info || 'Erro na convers├úo: ' || SQLERRM || E'\n';
    END;
  END IF;
  
  RETURN debug_info;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE coupons
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = coupon_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coupon not found';
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.normalize_price_string(price_str text)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF price_str IS NULL OR price_str = '' THEN
    RETURN 0;
  END IF;
  
  -- Remove tudo exceto n├║meros, v├¡rgulas e pontos
  price_str := REGEXP_REPLACE(price_str, '[^0-9,\.]', '', 'g');
  
  -- Se tem v├¡rgula E ponto, assume que v├¡rgula ├® decimal e ponto ├® separador de milhares
  IF price_str LIKE '%,%' AND price_str LIKE '%.%' THEN
    -- Remove pontos (separadores de milhares) e substitui v├¡rgula por ponto
    price_str := REPLACE(price_str, '.', '');
    price_str := REPLACE(price_str, ',', '.');
  -- Se tem s├│ v├¡rgula, substitui por ponto
  ELSIF price_str LIKE '%,%' THEN
    price_str := REPLACE(price_str, ',', '.');
  END IF;
  
  RETURN price_str::NUMERIC;
EXCEPTION WHEN OTHERS THEN
  RETURN 0;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.populate_promotion_sites()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  price_val NUMERIC;
  promotional_price_val NUMERIC;
  percent_val NUMERIC;
  url_val TEXT;
  price_data JSONB;
  url_data TEXT;
BEGIN
  -- Coleta dados de pre├ºo
  -- Sempre tenta converter value_json e value para jsonb
  DECLARE
    valuejson_text TEXT;
    value_text TEXT;
  BEGIN
    -- Tenta value_json primeiro
    SELECT value_json::TEXT INTO valuejson_text
    FROM form_entry_values
    WHERE entry_id = NEW.entry_id
      AND value_json IS NOT NULL
      AND (value_json::TEXT LIKE '%"price"%' OR value_json::TEXT LIKE '%"promotional_price"%')
    LIMIT 1;
    IF valuejson_text IS NOT NULL THEN
      BEGIN
        price_data := valuejson_text::jsonb;
      EXCEPTION WHEN OTHERS THEN
        price_data := NULL;
      END;
    END IF;
    -- Se n├úo achou, tenta value
    IF price_data IS NULL THEN
      SELECT value INTO value_text
      FROM form_entry_values
      WHERE entry_id = NEW.entry_id
        AND value IS NOT NULL
        AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%')
      LIMIT 1;
      IF value_text IS NOT NULL THEN
        BEGIN
          price_data := value_text::jsonb;
        EXCEPTION WHEN OTHERS THEN
          price_data := NULL;
        END;
      END IF;
    END IF;
  END;
  -- Coleta dados de URL
  SELECT value INTO url_data
  FROM form_entry_values 
  WHERE entry_id = NEW.entry_id 
    AND value IS NOT NULL 
    AND value ~ '^https?://'
  LIMIT 1;
  -- Se o registro atual tem dados de pre├ºo, prioriza
  IF NEW.value_json IS NOT NULL AND (NEW.value_json::TEXT LIKE '%"price"%' OR NEW.value_json::TEXT LIKE '%"promotional_price"%') THEN
    BEGIN
      price_data := NEW.value_json::TEXT::jsonb;
    EXCEPTION WHEN OTHERS THEN
      price_data := NULL;
    END;
  ELSIF NEW.value IS NOT NULL AND (NEW.value LIKE '%"price"%' OR NEW.value LIKE '%"promotional_price"%') THEN
    BEGIN
      price_data := NEW.value::jsonb;
    EXCEPTION WHEN OTHERS THEN
      price_data := NULL;
    END;
  END IF;
  -- Se o registro atual tem URL, prioriza
  IF NEW.value IS NOT NULL AND NEW.value ~ '^https?://' THEN
    url_data := NEW.value;
  END IF;
  -- Se n├úo tem pre├ºo, n├úo processa
  IF price_data IS NULL THEN
    RETURN NEW;
  END IF;
  -- Extrai e normaliza pre├ºo
  BEGIN
    price_val := COALESCE(
      REPLACE(
        REGEXP_REPLACE((price_data::jsonb)->>'price', '[^0-9,\.]', '', 'g'),
        ',', '.'
      )::NUMERIC, 0
    );
  EXCEPTION WHEN OTHERS THEN
    price_val := 0;
  END;
  BEGIN
    promotional_price_val := COALESCE(
      REPLACE(
        REGEXP_REPLACE((price_data::jsonb)->>'promotional_price', '[^0-9,\.]', '', 'g'),
        ',', '.'
      )::NUMERIC, 0
    );
  EXCEPTION WHEN OTHERS THEN
    promotional_price_val := 0;
  END;
  -- Valida pre├ºos
  IF price_val <= 0 OR promotional_price_val <= 0 OR promotional_price_val >= price_val THEN
    RAISE NOTICE 'Trigger populate_promotion_sites: entry_id=%, price=%, promo_price=% (ignorado)', NEW.entry_id, price_val, promotional_price_val;
    DELETE FROM promotion_sites WHERE entry_id = NEW.entry_id;
    RETURN NEW;
  END IF;
  RAISE NOTICE 'Trigger populate_promotion_sites: entry_id=%, price=%, promo_price=% (INSERIDO/ATUALIZADO)', NEW.entry_id, price_val, promotional_price_val;
  -- Calcula desconto
  percent_val := ROUND(((price_val - promotional_price_val) / price_val * 100), 2);
  url_val := COALESCE(url_data, '');
  -- Upsert
  INSERT INTO promotion_sites (
    entry_id, percent, price, promotional_price, url, created_at, updated_at
  ) VALUES (
    NEW.entry_id, percent_val, price_val, promotional_price_val, url_val, NOW(), NOW()
  )
  ON CONFLICT (entry_id) DO UPDATE SET
    percent = EXCLUDED.percent,
    price = EXCLUDED.price,
    promotional_price = EXCLUDED.promotional_price,
    url = EXCLUDED.url,
    updated_at = NOW();
  -- Mant├®m s├│ os 10 melhores
  DELETE FROM promotion_sites 
  WHERE id NOT IN (
    SELECT id FROM promotion_sites WHERE percent > 0 AND price IS NOT NULL AND promotional_price IS NOT NULL ORDER BY percent DESC, price DESC LIMIT 10
  ) AND percent > 0;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.populate_promotion_sites_debug(p_entry_id uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  price_val NUMERIC;
  promotional_price_val NUMERIC;
  percent_val NUMERIC;
  url_val TEXT;
  price_data JSONB;
  url_data TEXT;
  value_text TEXT;
  debug_log TEXT := '';
BEGIN
  debug_log := debug_log || 'Iniciando processamento para entry_id: ' || p_entry_id || E'\n';
  
  -- Busca dados
  SELECT value INTO value_text
  FROM form_entry_values
  WHERE entry_id = p_entry_id
    AND value IS NOT NULL
    AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%')
  LIMIT 1;
  
  debug_log := debug_log || 'value_text encontrado: ' || COALESCE(value_text, 'NULL') || E'\n';
  
  IF value_text IS NOT NULL THEN
    BEGIN
      price_data := value_text::jsonb;
      debug_log := debug_log || 'Convers├úo para jsonb: OK' || E'\n';
    EXCEPTION WHEN OTHERS THEN
      debug_log := debug_log || 'Erro na convers├úo jsonb: ' || SQLERRM || E'\n';
      RETURN debug_log;
    END;
  ELSE
    debug_log := debug_log || 'Nenhum value_text encontrado, saindo' || E'\n';
    RETURN debug_log;
  END IF;
  
  -- URL
  SELECT value INTO url_data
  FROM form_entry_values 
  WHERE entry_id = p_entry_id
    AND value IS NOT NULL 
    AND value ~ '^https?://'
  LIMIT 1;
  
  debug_log := debug_log || 'URL encontrada: ' || COALESCE(url_data, 'NULL') || E'\n';
  
  -- Normalizar pre├ºos
  debug_log := debug_log || 'price original: ' || (price_data->>'price') || E'\n';
  debug_log := debug_log || 'promotional_price original: ' || (price_data->>'promotional_price') || E'\n';
  
  price_val := normalize_price_string((price_data->>'price'));
  promotional_price_val := normalize_price_string((price_data->>'promotional_price'));
  
  debug_log := debug_log || 'price_val normalizado: ' || price_val || E'\n';
  debug_log := debug_log || 'promotional_price_val normalizado: ' || promotional_price_val || E'\n';
  
  -- Valida├º├Áes
  debug_log := debug_log || 'Valida├º├Áes:' || E'\n';
  debug_log := debug_log || '- price_val > 0: ' || (price_val > 0) || E'\n';
  debug_log := debug_log || '- promotional_price_val > 0: ' || (promotional_price_val > 0) || E'\n';
  debug_log := debug_log || '- promotional_price_val < price_val: ' || (promotional_price_val < price_val) || E'\n';
  
  IF price_val <= 0 OR promotional_price_val <= 0 OR promotional_price_val >= price_val THEN
    debug_log := debug_log || 'Valida├º├úo FALHOU - seria deletado e ignorado' || E'\n';
  ELSE
    percent_val := ROUND(((price_val - promotional_price_val) / price_val * 100), 2);
    debug_log := debug_log || 'Desconto calculado: ' || percent_val || '%' || E'\n';
    debug_log := debug_log || 'SERIA INSERIDO/ATUALIZADO na tabela' || E'\n';
  END IF;
  
  RETURN debug_log;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.populate_promotion_sites_debug_v2(p_entry_id uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  price_data JSONB;
  value_text TEXT;
  debug_log TEXT := '';
  rec RECORD;
BEGIN
  debug_log := debug_log || 'Iniciando processamento para entry_id: ' || p_entry_id || E'\n';
  
  -- Ver TODOS os registros para esse entry_id
  debug_log := debug_log || 'Todos os registros para esse entry_id:' || E'\n';
  FOR rec IN 
    SELECT field_id, value, value_json
    FROM form_entry_values 
    WHERE entry_id = p_entry_id
  LOOP
    debug_log := debug_log || '- field_id: ' || rec.field_id || ', value: ' || COALESCE(rec.value, 'NULL') || ', value_json: ' || COALESCE(rec.value_json::TEXT, 'NULL') || E'\n';
  END LOOP;
  
  -- Tentar buscar dados de pre├ºo em value
  SELECT value INTO value_text
  FROM form_entry_values
  WHERE entry_id = p_entry_id
    AND value IS NOT NULL
    AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%')
  LIMIT 1;
  
  debug_log := debug_log || 'Busca em value com filtro de price: ' || COALESCE(value_text, 'NULL') || E'\n';
  
  -- Se n├úo achou, tentar sem filtro de price
  IF value_text IS NULL THEN
    SELECT value INTO value_text
    FROM form_entry_values
    WHERE entry_id = p_entry_id
      AND value IS NOT NULL
      AND value LIKE '%{%'
    LIMIT 1;
    
    debug_log := debug_log || 'Busca em value sem filtro (qualquer JSON): ' || COALESCE(value_text, 'NULL') || E'\n';
  END IF;
  
  -- Tentar buscar em value_json
  SELECT value_json::TEXT INTO value_text
  FROM form_entry_values
  WHERE entry_id = p_entry_id
    AND value_json IS NOT NULL
  LIMIT 1;
  
  debug_log := debug_log || 'Busca em value_json: ' || COALESCE(value_text, 'NULL') || E'\n';
  
  RETURN debug_log;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.populate_promotion_sites_manual(p_entry_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  price_val NUMERIC;
  promotional_price_val NUMERIC;
  percent_val NUMERIC;
  url_val TEXT;
  price_data JSONB;
  url_data TEXT;
  valuejson_text TEXT;
  value_text TEXT;
BEGIN
  RAISE NOTICE 'DEBUG: Iniciando processamento para entry_id=%', p_entry_id;
  
  -- Busca dados de pre├ºo em AMBAS as colunas (value_json E value)
  -- Prioriza value_json, mas tamb├®m verifica value
  SELECT 
    CASE 
      WHEN value_json IS NOT NULL AND (value_json::TEXT LIKE '%"price"%' OR value_json::TEXT LIKE '%"promotional_price"%') 
      THEN value_json::TEXT
      WHEN value IS NOT NULL AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%')
      THEN value
      ELSE NULL
    END INTO value_text
  FROM form_entry_values
  WHERE entry_id = p_entry_id
    AND (
      (value_json IS NOT NULL AND (value_json::TEXT LIKE '%"price"%' OR value_json::TEXT LIKE '%"promotional_price"%'))
      OR 
      (value IS NOT NULL AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%'))
    )
  LIMIT 1;
  
  IF value_text IS NOT NULL THEN
    BEGIN
      price_data := value_text::jsonb;
      RAISE NOTICE 'DEBUG: Convers├úo para jsonb OK';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'DEBUG: Erro na convers├úo jsonb: %', SQLERRM;
      RETURN;
    END;
  ELSE
    RAISE NOTICE 'DEBUG: Nenhum value_text encontrado, saindo';
    RETURN;
  END IF;
  
  -- URL
  SELECT value INTO url_data
  FROM form_entry_values 
  WHERE entry_id = p_entry_id
    AND value IS NOT NULL 
    AND value ~ '^https?://'
  LIMIT 1;
  
  RAISE NOTICE 'DEBUG: URL encontrada=%', COALESCE(url_data, 'NULL');
  
  -- Normalizar pre├ºos usando a nova fun├º├úo
  RAISE NOTICE 'DEBUG: price original=%', (price_data->>'price');
  RAISE NOTICE 'DEBUG: promotional_price original=%', (price_data->>'promotional_price');
  
  price_val := normalize_price_string((price_data->>'price'));
  promotional_price_val := normalize_price_string((price_data->>'promotional_price'));
  
  RAISE NOTICE 'DEBUG: price_val normalizado=%', price_val;
  RAISE NOTICE 'DEBUG: promotional_price_val normalizado=%', promotional_price_val;
  
  -- Valida├º├Áes detalhadas
  RAISE NOTICE 'DEBUG: Valida├º├Áes:';
  RAISE NOTICE 'DEBUG: - price_val > 0: %', (price_val > 0);
  RAISE NOTICE 'DEBUG: - promotional_price_val > 0: %', (promotional_price_val > 0);
  RAISE NOTICE 'DEBUG: - promotional_price_val < price_val: %', (promotional_price_val < price_val);
  
  IF price_val <= 0 OR promotional_price_val <= 0 OR promotional_price_val >= price_val THEN
    RAISE NOTICE 'DEBUG: Valida├º├úo FALHOU - deletando registro existente e saindo';
    DELETE FROM promotion_sites WHERE entry_id = p_entry_id;
    RETURN;
  END IF;
  
  percent_val := ROUND(((price_val - promotional_price_val) / price_val * 100), 2);
  url_val := COALESCE(url_data, '');
  
  RAISE NOTICE 'DEBUG: Desconto calculado=% %', percent_val, '%';
  RAISE NOTICE 'DEBUG: Inserindo/atualizando na tabela promotion_sites';
  
  INSERT INTO promotion_sites (
    entry_id, percent, price, promotional_price, url, created_at, updated_at
  ) VALUES (
    p_entry_id, percent_val, price_val, promotional_price_val, url_val, NOW(), NOW()
  )
  ON CONFLICT (entry_id) DO UPDATE SET
    percent = EXCLUDED.percent,
    price = EXCLUDED.price,
    promotional_price = EXCLUDED.promotional_price,
    url = EXCLUDED.url,
    updated_at = NOW();
    
  RAISE NOTICE 'DEBUG: Inser├º├úo/atualiza├º├úo conclu├¡da com sucesso';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.populate_promotion_sites_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  price_val NUMERIC;
  promotional_price_val NUMERIC;
  percent_val NUMERIC;
  url_val TEXT;
  price_data JSONB;
  url_data TEXT;
  value_text TEXT;
BEGIN
  -- Log de in├¡cio
  INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
  VALUES ('populate_promotion_sites_trigger', NEW.entry_id, TG_OP, 'TRIGGER INICIADO', 
          jsonb_build_object('field_id', NEW.field_id, 'value', NEW.value, 'value_json', NEW.value_json));
  
  RAISE NOTICE 'TRIGGER DEBUG: Iniciado para entry_id=% field_id=% operation=%', NEW.entry_id, NEW.field_id, TG_OP;
  
  -- Busca dados de pre├ºo usando a mesma l├│gica da fun├º├úo manual
  SELECT 
    CASE 
      WHEN value_json IS NOT NULL AND (value_json::TEXT LIKE '%"price"%' OR value_json::TEXT LIKE '%"promotional_price"%') 
      THEN value_json::TEXT
      WHEN value IS NOT NULL AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%')
      THEN value
      ELSE NULL
    END INTO value_text
  FROM form_entry_values
  WHERE entry_id = NEW.entry_id
    AND (
      (value_json IS NOT NULL AND (value_json::TEXT LIKE '%"price"%' OR value_json::TEXT LIKE '%"promotional_price"%'))
      OR 
      (value IS NOT NULL AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%'))
    )
  LIMIT 1;
  
  -- Log da busca de pre├ºos
  INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
  VALUES ('populate_promotion_sites_trigger', NEW.entry_id, 'PRICE_SEARCH', 
          CASE WHEN value_text IS NULL THEN 'NENHUM PRE├çO ENCONTRADO' ELSE 'PRE├çO ENCONTRADO' END,
          jsonb_build_object('value_text', value_text));
  
  -- Se n├úo encontrou dados de pre├ºo, sair
  IF value_text IS NULL THEN
    RAISE NOTICE 'TRIGGER DEBUG: Nenhum dado de pre├ºo encontrado para entry_id=%', NEW.entry_id;
    RETURN NEW;
  END IF;
  
  -- Converter para JSONB
  BEGIN
    price_data := value_text::jsonb;
    
    -- Log da convers├úo
    INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
    VALUES ('populate_promotion_sites_trigger', NEW.entry_id, 'JSONB_CONVERT', 'CONVERS├âO OK', price_data);
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TRIGGER DEBUG: Erro na convers├úo jsonb para entry_id=% erro=%', NEW.entry_id, SQLERRM;
    
    -- Log do erro
    INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
    VALUES ('populate_promotion_sites_trigger', NEW.entry_id, 'ERROR', 'ERRO CONVERS├âO JSONB: ' || SQLERRM, 
            jsonb_build_object('value_text', value_text));
    
    RETURN NEW;
  END;
  
  -- Buscar URL
  SELECT value INTO url_data
  FROM form_entry_values 
  WHERE entry_id = NEW.entry_id
    AND value IS NOT NULL 
    AND value ~ '^https?://'
  LIMIT 1;
  
  -- Log da URL
  INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
  VALUES ('populate_promotion_sites_trigger', NEW.entry_id, 'URL_SEARCH', 
          CASE WHEN url_data IS NULL THEN 'URL N├âO ENCONTRADA' ELSE 'URL ENCONTRADA' END,
          jsonb_build_object('url', url_data));
  
  -- Normalizar pre├ºos
  price_val := normalize_price_string((price_data->>'price'));
  promotional_price_val := normalize_price_string((price_data->>'promotional_price'));
  
  -- Log dos pre├ºos normalizados
  INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
  VALUES ('populate_promotion_sites_trigger', NEW.entry_id, 'PRICE_NORMALIZE', 'PRE├çOS NORMALIZADOS',
          jsonb_build_object(
            'price_original', price_data->>'price',
            'promotional_price_original', price_data->>'promotional_price',
            'price_normalized', price_val,
            'promotional_price_normalized', promotional_price_val
          ));
  
  -- Validar dados
  IF price_val <= 0 OR promotional_price_val <= 0 OR promotional_price_val >= price_val THEN
    RAISE NOTICE 'TRIGGER DEBUG: Valida├º├úo falhou para entry_id=%', NEW.entry_id;
    
    -- Log da valida├º├úo falhou
    INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
    VALUES ('populate_promotion_sites_trigger', NEW.entry_id, 'VALIDATION', 'VALIDA├ç├âO FALHOU',
            jsonb_build_object(
              'price_val', price_val,
              'promotional_price_val', promotional_price_val,
              'price_valid', price_val > 0,
              'promo_valid', promotional_price_val > 0,
              'promo_less_than_price', promotional_price_val < price_val
            ));
    
    -- Remove registro existente se inv├ílido
    DELETE FROM promotion_sites WHERE entry_id = NEW.entry_id;
    RETURN NEW;
  END IF;
  
  -- Calcular desconto
  percent_val := ROUND(((price_val - promotional_price_val) / price_val * 100), 2);
  url_val := COALESCE(url_data, '');
  
  -- Inserir/atualizar na tabela promotion_sites
  INSERT INTO promotion_sites (
    entry_id, percent, price, promotional_price, url, created_at, updated_at
  ) VALUES (
    NEW.entry_id, percent_val, price_val, promotional_price_val, url_val, NOW(), NOW()
  )
  ON CONFLICT (entry_id) DO UPDATE SET
    percent = EXCLUDED.percent,
    price = EXCLUDED.price,
    promotional_price = EXCLUDED.promotional_price,
    url = EXCLUDED.url,
    updated_at = NOW();
  
  -- Log final de sucesso
  INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
  VALUES ('populate_promotion_sites_trigger', NEW.entry_id, 'SUCCESS', 'PROCESSAMENTO CONCLU├ìDO',
          jsonb_build_object(
            'percent', percent_val,
            'price', price_val,
            'promotional_price', promotional_price_val,
            'url', url_val
          ));
    
  RAISE NOTICE 'TRIGGER DEBUG: Processamento conclu├¡do para entry_id=%', NEW.entry_id;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.process_all_promotion_data()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT DISTINCT entry_id 
        FROM form_entry_values 
        WHERE (
          (value_json IS NOT NULL AND (value_json::TEXT LIKE '%"price"%' OR value_json::TEXT LIKE '%"promotional_price"%'))
          OR 
          (value IS NOT NULL AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%'))
        )
    LOOP
        PERFORM populate_promotion_sites_manual(rec.entry_id);
    END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.process_existing_promotion_data()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT DISTINCT entry_id 
        FROM form_entry_values 
        WHERE (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%')
           OR (value_json IS NOT NULL AND (value_json::TEXT LIKE '%"price"%' OR value_json::TEXT LIKE '%"promotional_price"%'))
    LOOP
        PERFORM populate_promotion_sites_manual(rec.entry_id);
    END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_promotion_sites()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  processed_count INTEGER := 0;
  entry_record RECORD;
BEGIN
  -- Clear existing promotion_sites
  TRUNCATE TABLE promotion_sites;
  
  -- Process all form_entry_values with pricing data
  FOR entry_record IN 
    SELECT DISTINCT fev.entry_id, fev.value_json
    FROM form_entry_values fev
    WHERE fev.value_json IS NOT NULL 
      AND (
        fev.value_json ? 'price' OR 
        fev.value_json ? 'promotional_price' OR
        fev.value_json ? 'url'
      )
      AND COALESCE((fev.value_json->>'price')::NUMERIC, 0) > 0
      AND COALESCE((fev.value_json->>'promotional_price')::NUMERIC, 0) > 0
  LOOP
    -- Insert promotion data
    INSERT INTO promotion_sites (
      entry_id,
      percent,
      price,
      old_price,
      promotional_price,
      old_promotional_price,
      url
    ) VALUES (
      entry_record.entry_id,
      CASE 
        WHEN COALESCE((entry_record.value_json->>'price')::NUMERIC, 0) > 0 
         AND COALESCE((entry_record.value_json->>'promotional_price')::NUMERIC, 0) > 0
         AND COALESCE((entry_record.value_json->>'promotional_price')::NUMERIC, 0) < COALESCE((entry_record.value_json->>'price')::NUMERIC, 0)
        THEN ROUND(((COALESCE((entry_record.value_json->>'price')::NUMERIC, 0) - COALESCE((entry_record.value_json->>'promotional_price')::NUMERIC, 0)) / COALESCE((entry_record.value_json->>'price')::NUMERIC, 0) * 100), 2)
        ELSE 0
      END,
      NULLIF(COALESCE((entry_record.value_json->>'price')::NUMERIC, 0), 0),
      NULLIF(COALESCE((entry_record.value_json->>'old_price')::NUMERIC, 0), 0),
      NULLIF(COALESCE((entry_record.value_json->>'promotional_price')::NUMERIC, 0), 0),
      NULLIF(COALESCE((entry_record.value_json->>'old_promotional_price')::NUMERIC, 0), 0),
      entry_record.value_json->>'url'
    )
    ON CONFLICT (entry_id) DO NOTHING;
    
    processed_count := processed_count + 1;
  END LOOP;
  
  -- Keep only top 10 with best discount ratios
  DELETE FROM promotion_sites 
  WHERE id NOT IN (
    SELECT id 
    FROM promotion_sites 
    WHERE percent > 0 
      AND price IS NOT NULL 
      AND promotional_price IS NOT NULL
    ORDER BY percent DESC, price DESC
    LIMIT 10
  ) AND percent > 0;
  
  RETURN processed_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_admin_role()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.role := 'admin';
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_aprovment_payment()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Se o status de pagamento mudou para 'paid', atualiza a data
  IF NEW.payment_status = 'paid' AND OLD.payment_status IS DISTINCT FROM 'paid' THEN
    NEW.aprovment_payment := NOW();
  -- Se o status de pagamento mudou para outro valor, zera a data
  ELSIF NEW.payment_status IS DISTINCT FROM 'paid' AND OLD.payment_status = 'paid' THEN
    NEW.aprovment_payment := NULL;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_current_id()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.admin_id IS NOT NULL THEN
    NEW.current_id := NEW.admin_id;
  ELSIF NEW.user_id IS NOT NULL THEN
    NEW.current_id := NEW.user_id;
  ELSE
    RAISE EXCEPTION '├ë necess├írio informar admin_id ou user_id';
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.test_promotion_sites_trigger()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    test_entry_id UUID := gen_random_uuid();
    test_field_id UUID := gen_random_uuid();
    result_text TEXT := '';
BEGIN
    -- Inserir um registro de teste
    INSERT INTO form_entry_values (
        entry_id, 
        field_id, 
        value_json,
        value
    ) VALUES (
        test_entry_id,
        test_field_id,
        '{"price": "100.00", "promotional_price": "80.00", "url": "https://test.com"}'::jsonb,
        'test value'
    );
    
    -- Verificar se foi criado na promotion_sites
    IF EXISTS (SELECT 1 FROM promotion_sites WHERE entry_id = test_entry_id) THEN
        result_text := 'SUCCESS: Trigger funcionou! Registro criado na promotion_sites';
    ELSE
        result_text := 'FAIL: Trigger n├úo funcionou. Nenhum registro na promotion_sites';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM form_entry_values WHERE entry_id = test_entry_id;
    DELETE FROM promotion_sites WHERE entry_id = test_entry_id;
    
    RETURN result_text;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.test_real_data_trigger()
 RETURNS TABLE(step text, result text)
 LANGUAGE plpgsql
AS $function$
DECLARE
    price_entry_id UUID;
    url_entry_id UUID;
    promotion_count INTEGER;
BEGIN
    -- Encontrar uma entrada com dados de pre├ºo
    SELECT fev.entry_id INTO price_entry_id
    FROM form_entry_values fev
    WHERE fev.value_json ? 'price' 
      AND fev.value_json ? 'promotional_price'
    LIMIT 1;
    
    -- Encontrar uma entrada com URL
    SELECT fev.entry_id INTO url_entry_id
    FROM form_entry_values fev
    WHERE fev.value ~ '^https?://'
    LIMIT 1;
    
    RETURN QUERY SELECT 'INFO'::TEXT, ('Entry com pre├ºos: ' || COALESCE(price_entry_id::TEXT, 'NENHUMA'))::TEXT;
    RETURN QUERY SELECT 'INFO'::TEXT, ('Entry com URL: ' || COALESCE(url_entry_id::TEXT, 'NENHUMA'))::TEXT;
    
    -- Combinar dados de pre├ºo e URL em uma ├║nica entrada para teste
    IF price_entry_id IS NOT NULL AND url_entry_id IS NOT NULL THEN
        -- Atualizar entrada de pre├ºo com URL
        UPDATE form_entry_values 
        SET value = (SELECT value FROM form_entry_values WHERE entry_id = url_entry_id LIMIT 1)
        WHERE entry_id = price_entry_id;
        
        RETURN QUERY SELECT 'UPDATE'::TEXT, 'Dados combinados - pre├ºo + URL'::TEXT;
        
        -- Aguardar trigger processar
        PERFORM pg_sleep(1);
        
        -- Verificar resultado
        SELECT COUNT(*) INTO promotion_count 
        FROM promotion_sites 
        WHERE entry_id = price_entry_id;
        
        IF promotion_count > 0 THEN
            RETURN QUERY SELECT 'SUCCESS'::TEXT, ('Encontrados ' || promotion_count || ' registros')::TEXT;
            
            RETURN QUERY 
            SELECT 'RESULT'::TEXT, 
                   ('percent: ' || COALESCE(percent::TEXT, 'NULL') || 
                    ', price: ' || COALESCE(price::TEXT, 'NULL') || 
                    ', promo: ' || COALESCE(promotional_price::TEXT, 'NULL') ||
                    ', url: ' || COALESCE(LEFT(url, 30), 'NULL'))::TEXT
            FROM promotion_sites 
            WHERE entry_id = price_entry_id;
        ELSE
            RETURN QUERY SELECT 'FAIL'::TEXT, 'Nenhum registro criado'::TEXT;
        END IF;
    ELSE
        RETURN QUERY SELECT 'ERROR'::TEXT, 'Dados insuficientes para teste'::TEXT;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.test_real_data_trigger_fixed()
 RETURNS TABLE(step text, result text)
 LANGUAGE plpgsql
AS $function$
DECLARE
    test_entry_id UUID;
    test_record_count INTEGER;
BEGIN
    -- Criar um entry_id de teste
    test_entry_id := gen_random_uuid();
    
    RETURN QUERY SELECT 'INFO'::TEXT, ('Entry ID de teste: ' || test_entry_id::TEXT)::TEXT;
    
    -- Inserir dados de teste que simulam a estrutura real
    -- 1. Record com pricing data (value_json)
    INSERT INTO form_entry_values (id, entry_id, field_id, value, value_json, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        test_entry_id,
        '87866488-3270-447e-a0-d2579cb5-0517'::UUID, -- field_id fict├¡cio
        NULL,
        '{"price":"500,00","old_price":"500,00","promotional_price":"300,00","old_promotional_price":"300,00"}'::jsonb,
        now(),
        now()
    );
    
    -- 2. Record com URL (value)
    INSERT INTO form_entry_values (id, entry_id, field_id, value, value_json, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        test_entry_id,
        '87866488-3270-447e-a0-bfabf6e5-4986'::UUID, -- field_id fict├¡cio
        'https://www.teste.com',
        NULL,
        now(),
        now()
    );
    
    RETURN QUERY SELECT 'INSERT'::TEXT, 'Dados de teste inseridos'::TEXT;
    
    -- Aguardar trigger processar
    PERFORM pg_sleep(1);
    
    -- Verificar resultado
    SELECT COUNT(*) INTO test_record_count 
    FROM promotion_sites 
    WHERE entry_id = test_entry_id;
    
    IF test_record_count > 0 THEN
        RETURN QUERY SELECT 'SUCCESS'::TEXT, ('Encontrados ' || test_record_count || ' registros')::TEXT;
        
        RETURN QUERY 
        SELECT 'RESULT'::TEXT, 
               ('percent: ' || COALESCE(percent::TEXT, 'NULL') || 
                ', price: ' || COALESCE(price::TEXT, 'NULL') || 
                ', old_price: ' || COALESCE(old_price::TEXT, 'NULL') ||
                ', promo: ' || COALESCE(promotional_price::TEXT, 'NULL') ||
                ', old_promo: ' || COALESCE(old_promotional_price::TEXT, 'NULL') ||
                ', url: ' || COALESCE(LEFT(url, 30), 'NULL'))::TEXT
        FROM promotion_sites 
        WHERE entry_id = test_entry_id;
    ELSE
        RETURN QUERY SELECT 'FAIL'::TEXT, 'Nenhum registro criado'::TEXT;
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM form_entry_values WHERE entry_id = test_entry_id;
    DELETE FROM promotion_sites WHERE entry_id = test_entry_id;
    
    RETURN QUERY SELECT 'CLEANUP'::TEXT, 'Dados de teste removidos'::TEXT;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.test_with_logs()
 RETURNS TABLE(message text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Esta fun├º├úo vai mostrar as mensagens NOTICE como resultado
    SET client_min_messages TO NOTICE;
    
    -- Executar um update que deveria disparar o trigger
    UPDATE form_entry_values 
    SET value_json = '{"price": "200.00", "promotional-price": "150.00", "url": "https://example.com"}'::jsonb
    WHERE id = (SELECT id FROM form_entry_values LIMIT 1);
    
    RETURN QUERY SELECT 'Update executado - verifique os logs acima'::TEXT;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_best_selling_sites_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_company_data_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_contracts_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_email_templates_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_form_entry_values_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_order_chat_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_platform_users_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_promotion_sites_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_sales_rank()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update rank based on total_sales in descending order
  WITH ranked_sites AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY total_sales DESC, monthly_sales DESC) as new_rank
    FROM best_selling_sites
    WHERE is_active = true
  )
  UPDATE best_selling_sites 
  SET sales_rank = ranked_sites.new_rank
  FROM ranked_sites
  WHERE best_selling_sites.id = ranked_sites.id;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_settings_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_shopping_cart_items_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_stats()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  user_month int;
  user_year int;
  month_name text;
  new_month_total int;
  new_last_date date;
BEGIN
  -- Descobre o m├¬s e ano do usu├írio afetado
  IF (TG_OP = 'INSERT') THEN
    user_month := EXTRACT(MONTH FROM NEW.created_at);
    user_year := EXTRACT(YEAR FROM NEW.created_at);
  ELSE
    user_month := EXTRACT(MONTH FROM OLD.created_at);
    user_year := EXTRACT(YEAR FROM OLD.created_at);
  END IF;

  -- Nome do m├¬s em portugu├¬s
  month_name := CASE user_month
    WHEN 1 THEN 'Janeiro'
    WHEN 2 THEN 'Fevereiro'
    WHEN 3 THEN 'Mar├ºo'
    WHEN 4 THEN 'Abril'
    WHEN 5 THEN 'Maio'
    WHEN 6 THEN 'Junho'
    WHEN 7 THEN 'Julho'
    WHEN 8 THEN 'Agosto'
    WHEN 9 THEN 'Setembro'
    WHEN 10 THEN 'Outubro'
    WHEN 11 THEN 'Novembro'
    WHEN 12 THEN 'Dezembro'
    ELSE 'Desconhecido'
  END;

  -- Conta quantos usu├írios existem para o m├¬s/ano
  SELECT COUNT(*), MAX(created_at::date)
    INTO new_month_total, new_last_date
    FROM auth.users
    WHERE EXTRACT(MONTH FROM created_at) = user_month
      AND EXTRACT(YEAR FROM created_at) = user_year;

  -- Se j├í existe registro em user_stats, atualiza. Se n├úo, insere.
  IF EXISTS (
    SELECT 1 FROM public.user_stats WHERE name = month_name AND year = user_year
  ) THEN
    UPDATE public.user_stats
      SET month_total = new_month_total,
          last_date = new_last_date
      WHERE name = month_name AND year = user_year;
  ELSE
    INSERT INTO public.user_stats (month_total, name, last_date, year)
      VALUES (new_month_total, month_name, new_last_date, user_year);
  END IF;

  RETURN NULL;
END;
$function$
;

grant delete on table "public"."admins" to "anon";

grant insert on table "public"."admins" to "anon";

grant references on table "public"."admins" to "anon";

grant select on table "public"."admins" to "anon";

grant trigger on table "public"."admins" to "anon";

grant truncate on table "public"."admins" to "anon";

grant update on table "public"."admins" to "anon";

grant delete on table "public"."admins" to "authenticated";

grant insert on table "public"."admins" to "authenticated";

grant references on table "public"."admins" to "authenticated";

grant select on table "public"."admins" to "authenticated";

grant trigger on table "public"."admins" to "authenticated";

grant truncate on table "public"."admins" to "authenticated";

grant update on table "public"."admins" to "authenticated";

grant delete on table "public"."admins" to "service_role";

grant insert on table "public"."admins" to "service_role";

grant references on table "public"."admins" to "service_role";

grant select on table "public"."admins" to "service_role";

grant trigger on table "public"."admins" to "service_role";

grant truncate on table "public"."admins" to "service_role";

grant update on table "public"."admins" to "service_role";

grant delete on table "public"."best_selling_sites" to "anon";

grant insert on table "public"."best_selling_sites" to "anon";

grant references on table "public"."best_selling_sites" to "anon";

grant select on table "public"."best_selling_sites" to "anon";

grant trigger on table "public"."best_selling_sites" to "anon";

grant truncate on table "public"."best_selling_sites" to "anon";

grant update on table "public"."best_selling_sites" to "anon";

grant delete on table "public"."best_selling_sites" to "authenticated";

grant insert on table "public"."best_selling_sites" to "authenticated";

grant references on table "public"."best_selling_sites" to "authenticated";

grant select on table "public"."best_selling_sites" to "authenticated";

grant trigger on table "public"."best_selling_sites" to "authenticated";

grant truncate on table "public"."best_selling_sites" to "authenticated";

grant update on table "public"."best_selling_sites" to "authenticated";

grant delete on table "public"."best_selling_sites" to "service_role";

grant insert on table "public"."best_selling_sites" to "service_role";

grant references on table "public"."best_selling_sites" to "service_role";

grant select on table "public"."best_selling_sites" to "service_role";

grant trigger on table "public"."best_selling_sites" to "service_role";

grant truncate on table "public"."best_selling_sites" to "service_role";

grant update on table "public"."best_selling_sites" to "service_role";

grant delete on table "public"."cart_checkout_resume" to "anon";

grant insert on table "public"."cart_checkout_resume" to "anon";

grant references on table "public"."cart_checkout_resume" to "anon";

grant select on table "public"."cart_checkout_resume" to "anon";

grant trigger on table "public"."cart_checkout_resume" to "anon";

grant truncate on table "public"."cart_checkout_resume" to "anon";

grant update on table "public"."cart_checkout_resume" to "anon";

grant delete on table "public"."cart_checkout_resume" to "authenticated";

grant insert on table "public"."cart_checkout_resume" to "authenticated";

grant references on table "public"."cart_checkout_resume" to "authenticated";

grant select on table "public"."cart_checkout_resume" to "authenticated";

grant trigger on table "public"."cart_checkout_resume" to "authenticated";

grant truncate on table "public"."cart_checkout_resume" to "authenticated";

grant update on table "public"."cart_checkout_resume" to "authenticated";

grant delete on table "public"."cart_checkout_resume" to "service_role";

grant insert on table "public"."cart_checkout_resume" to "service_role";

grant references on table "public"."cart_checkout_resume" to "service_role";

grant select on table "public"."cart_checkout_resume" to "service_role";

grant trigger on table "public"."cart_checkout_resume" to "service_role";

grant truncate on table "public"."cart_checkout_resume" to "service_role";

grant update on table "public"."cart_checkout_resume" to "service_role";

grant delete on table "public"."company_data" to "anon";

grant insert on table "public"."company_data" to "anon";

grant references on table "public"."company_data" to "anon";

grant select on table "public"."company_data" to "anon";

grant trigger on table "public"."company_data" to "anon";

grant truncate on table "public"."company_data" to "anon";

grant update on table "public"."company_data" to "anon";

grant delete on table "public"."company_data" to "authenticated";

grant insert on table "public"."company_data" to "authenticated";

grant references on table "public"."company_data" to "authenticated";

grant select on table "public"."company_data" to "authenticated";

grant trigger on table "public"."company_data" to "authenticated";

grant truncate on table "public"."company_data" to "authenticated";

grant update on table "public"."company_data" to "authenticated";

grant delete on table "public"."company_data" to "service_role";

grant insert on table "public"."company_data" to "service_role";

grant references on table "public"."company_data" to "service_role";

grant select on table "public"."company_data" to "service_role";

grant trigger on table "public"."company_data" to "service_role";

grant truncate on table "public"."company_data" to "service_role";

grant update on table "public"."company_data" to "service_role";

grant delete on table "public"."contracts" to "anon";

grant insert on table "public"."contracts" to "anon";

grant references on table "public"."contracts" to "anon";

grant select on table "public"."contracts" to "anon";

grant trigger on table "public"."contracts" to "anon";

grant truncate on table "public"."contracts" to "anon";

grant update on table "public"."contracts" to "anon";

grant delete on table "public"."contracts" to "authenticated";

grant insert on table "public"."contracts" to "authenticated";

grant references on table "public"."contracts" to "authenticated";

grant select on table "public"."contracts" to "authenticated";

grant trigger on table "public"."contracts" to "authenticated";

grant truncate on table "public"."contracts" to "authenticated";

grant update on table "public"."contracts" to "authenticated";

grant delete on table "public"."contracts" to "service_role";

grant insert on table "public"."contracts" to "service_role";

grant references on table "public"."contracts" to "service_role";

grant select on table "public"."contracts" to "service_role";

grant trigger on table "public"."contracts" to "service_role";

grant truncate on table "public"."contracts" to "service_role";

grant update on table "public"."contracts" to "service_role";

grant delete on table "public"."coupons" to "anon";

grant insert on table "public"."coupons" to "anon";

grant references on table "public"."coupons" to "anon";

grant select on table "public"."coupons" to "anon";

grant trigger on table "public"."coupons" to "anon";

grant truncate on table "public"."coupons" to "anon";

grant update on table "public"."coupons" to "anon";

grant delete on table "public"."coupons" to "authenticated";

grant insert on table "public"."coupons" to "authenticated";

grant references on table "public"."coupons" to "authenticated";

grant select on table "public"."coupons" to "authenticated";

grant trigger on table "public"."coupons" to "authenticated";

grant truncate on table "public"."coupons" to "authenticated";

grant update on table "public"."coupons" to "authenticated";

grant delete on table "public"."coupons" to "service_role";

grant insert on table "public"."coupons" to "service_role";

grant references on table "public"."coupons" to "service_role";

grant select on table "public"."coupons" to "service_role";

grant trigger on table "public"."coupons" to "service_role";

grant truncate on table "public"."coupons" to "service_role";

grant update on table "public"."coupons" to "service_role";

grant delete on table "public"."email_templates" to "anon";

grant insert on table "public"."email_templates" to "anon";

grant references on table "public"."email_templates" to "anon";

grant select on table "public"."email_templates" to "anon";

grant trigger on table "public"."email_templates" to "anon";

grant truncate on table "public"."email_templates" to "anon";

grant update on table "public"."email_templates" to "anon";

grant delete on table "public"."email_templates" to "authenticated";

grant insert on table "public"."email_templates" to "authenticated";

grant references on table "public"."email_templates" to "authenticated";

grant select on table "public"."email_templates" to "authenticated";

grant trigger on table "public"."email_templates" to "authenticated";

grant truncate on table "public"."email_templates" to "authenticated";

grant update on table "public"."email_templates" to "authenticated";

grant delete on table "public"."email_templates" to "service_role";

grant insert on table "public"."email_templates" to "service_role";

grant references on table "public"."email_templates" to "service_role";

grant select on table "public"."email_templates" to "service_role";

grant trigger on table "public"."email_templates" to "service_role";

grant truncate on table "public"."email_templates" to "service_role";

grant update on table "public"."email_templates" to "service_role";

grant delete on table "public"."favorite_sites" to "anon";

grant insert on table "public"."favorite_sites" to "anon";

grant references on table "public"."favorite_sites" to "anon";

grant select on table "public"."favorite_sites" to "anon";

grant trigger on table "public"."favorite_sites" to "anon";

grant truncate on table "public"."favorite_sites" to "anon";

grant update on table "public"."favorite_sites" to "anon";

grant delete on table "public"."favorite_sites" to "authenticated";

grant insert on table "public"."favorite_sites" to "authenticated";

grant references on table "public"."favorite_sites" to "authenticated";

grant select on table "public"."favorite_sites" to "authenticated";

grant trigger on table "public"."favorite_sites" to "authenticated";

grant truncate on table "public"."favorite_sites" to "authenticated";

grant update on table "public"."favorite_sites" to "authenticated";

grant delete on table "public"."favorite_sites" to "service_role";

grant insert on table "public"."favorite_sites" to "service_role";

grant references on table "public"."favorite_sites" to "service_role";

grant select on table "public"."favorite_sites" to "service_role";

grant trigger on table "public"."favorite_sites" to "service_role";

grant truncate on table "public"."favorite_sites" to "service_role";

grant update on table "public"."favorite_sites" to "service_role";

grant delete on table "public"."feedback_submissions" to "anon";

grant insert on table "public"."feedback_submissions" to "anon";

grant references on table "public"."feedback_submissions" to "anon";

grant select on table "public"."feedback_submissions" to "anon";

grant trigger on table "public"."feedback_submissions" to "anon";

grant truncate on table "public"."feedback_submissions" to "anon";

grant update on table "public"."feedback_submissions" to "anon";

grant delete on table "public"."feedback_submissions" to "authenticated";

grant insert on table "public"."feedback_submissions" to "authenticated";

grant references on table "public"."feedback_submissions" to "authenticated";

grant select on table "public"."feedback_submissions" to "authenticated";

grant trigger on table "public"."feedback_submissions" to "authenticated";

grant truncate on table "public"."feedback_submissions" to "authenticated";

grant update on table "public"."feedback_submissions" to "authenticated";

grant delete on table "public"."feedback_submissions" to "service_role";

grant insert on table "public"."feedback_submissions" to "service_role";

grant references on table "public"."feedback_submissions" to "service_role";

grant select on table "public"."feedback_submissions" to "service_role";

grant trigger on table "public"."feedback_submissions" to "service_role";

grant truncate on table "public"."feedback_submissions" to "service_role";

grant update on table "public"."feedback_submissions" to "service_role";

grant delete on table "public"."form_entries" to "anon";

grant insert on table "public"."form_entries" to "anon";

grant references on table "public"."form_entries" to "anon";

grant select on table "public"."form_entries" to "anon";

grant trigger on table "public"."form_entries" to "anon";

grant truncate on table "public"."form_entries" to "anon";

grant update on table "public"."form_entries" to "anon";

grant delete on table "public"."form_entries" to "authenticated";

grant insert on table "public"."form_entries" to "authenticated";

grant references on table "public"."form_entries" to "authenticated";

grant select on table "public"."form_entries" to "authenticated";

grant trigger on table "public"."form_entries" to "authenticated";

grant truncate on table "public"."form_entries" to "authenticated";

grant update on table "public"."form_entries" to "authenticated";

grant delete on table "public"."form_entries" to "service_role";

grant insert on table "public"."form_entries" to "service_role";

grant references on table "public"."form_entries" to "service_role";

grant select on table "public"."form_entries" to "service_role";

grant trigger on table "public"."form_entries" to "service_role";

grant truncate on table "public"."form_entries" to "service_role";

grant update on table "public"."form_entries" to "service_role";

grant delete on table "public"."form_entry_notes" to "anon";

grant insert on table "public"."form_entry_notes" to "anon";

grant references on table "public"."form_entry_notes" to "anon";

grant select on table "public"."form_entry_notes" to "anon";

grant trigger on table "public"."form_entry_notes" to "anon";

grant truncate on table "public"."form_entry_notes" to "anon";

grant update on table "public"."form_entry_notes" to "anon";

grant delete on table "public"."form_entry_notes" to "authenticated";

grant insert on table "public"."form_entry_notes" to "authenticated";

grant references on table "public"."form_entry_notes" to "authenticated";

grant select on table "public"."form_entry_notes" to "authenticated";

grant trigger on table "public"."form_entry_notes" to "authenticated";

grant truncate on table "public"."form_entry_notes" to "authenticated";

grant update on table "public"."form_entry_notes" to "authenticated";

grant delete on table "public"."form_entry_notes" to "service_role";

grant insert on table "public"."form_entry_notes" to "service_role";

grant references on table "public"."form_entry_notes" to "service_role";

grant select on table "public"."form_entry_notes" to "service_role";

grant trigger on table "public"."form_entry_notes" to "service_role";

grant truncate on table "public"."form_entry_notes" to "service_role";

grant update on table "public"."form_entry_notes" to "service_role";

grant delete on table "public"."form_entry_values" to "anon";

grant insert on table "public"."form_entry_values" to "anon";

grant references on table "public"."form_entry_values" to "anon";

grant select on table "public"."form_entry_values" to "anon";

grant trigger on table "public"."form_entry_values" to "anon";

grant truncate on table "public"."form_entry_values" to "anon";

grant update on table "public"."form_entry_values" to "anon";

grant delete on table "public"."form_entry_values" to "authenticated";

grant insert on table "public"."form_entry_values" to "authenticated";

grant references on table "public"."form_entry_values" to "authenticated";

grant select on table "public"."form_entry_values" to "authenticated";

grant trigger on table "public"."form_entry_values" to "authenticated";

grant truncate on table "public"."form_entry_values" to "authenticated";

grant update on table "public"."form_entry_values" to "authenticated";

grant delete on table "public"."form_entry_values" to "service_role";

grant insert on table "public"."form_entry_values" to "service_role";

grant references on table "public"."form_entry_values" to "service_role";

grant select on table "public"."form_entry_values" to "service_role";

grant trigger on table "public"."form_entry_values" to "service_role";

grant truncate on table "public"."form_entry_values" to "service_role";

grant update on table "public"."form_entry_values" to "service_role";

grant delete on table "public"."form_field_niche" to "anon";

grant insert on table "public"."form_field_niche" to "anon";

grant references on table "public"."form_field_niche" to "anon";

grant select on table "public"."form_field_niche" to "anon";

grant trigger on table "public"."form_field_niche" to "anon";

grant truncate on table "public"."form_field_niche" to "anon";

grant update on table "public"."form_field_niche" to "anon";

grant delete on table "public"."form_field_niche" to "authenticated";

grant insert on table "public"."form_field_niche" to "authenticated";

grant references on table "public"."form_field_niche" to "authenticated";

grant select on table "public"."form_field_niche" to "authenticated";

grant trigger on table "public"."form_field_niche" to "authenticated";

grant truncate on table "public"."form_field_niche" to "authenticated";

grant update on table "public"."form_field_niche" to "authenticated";

grant delete on table "public"."form_field_niche" to "service_role";

grant insert on table "public"."form_field_niche" to "service_role";

grant references on table "public"."form_field_niche" to "service_role";

grant select on table "public"."form_field_niche" to "service_role";

grant trigger on table "public"."form_field_niche" to "service_role";

grant truncate on table "public"."form_field_niche" to "service_role";

grant update on table "public"."form_field_niche" to "service_role";

grant delete on table "public"."form_field_settings" to "anon";

grant insert on table "public"."form_field_settings" to "anon";

grant references on table "public"."form_field_settings" to "anon";

grant select on table "public"."form_field_settings" to "anon";

grant trigger on table "public"."form_field_settings" to "anon";

grant truncate on table "public"."form_field_settings" to "anon";

grant update on table "public"."form_field_settings" to "anon";

grant delete on table "public"."form_field_settings" to "authenticated";

grant insert on table "public"."form_field_settings" to "authenticated";

grant references on table "public"."form_field_settings" to "authenticated";

grant select on table "public"."form_field_settings" to "authenticated";

grant trigger on table "public"."form_field_settings" to "authenticated";

grant truncate on table "public"."form_field_settings" to "authenticated";

grant update on table "public"."form_field_settings" to "authenticated";

grant delete on table "public"."form_field_settings" to "service_role";

grant insert on table "public"."form_field_settings" to "service_role";

grant references on table "public"."form_field_settings" to "service_role";

grant select on table "public"."form_field_settings" to "service_role";

grant trigger on table "public"."form_field_settings" to "service_role";

grant truncate on table "public"."form_field_settings" to "service_role";

grant update on table "public"."form_field_settings" to "service_role";

grant delete on table "public"."form_fields" to "anon";

grant insert on table "public"."form_fields" to "anon";

grant references on table "public"."form_fields" to "anon";

grant select on table "public"."form_fields" to "anon";

grant trigger on table "public"."form_fields" to "anon";

grant truncate on table "public"."form_fields" to "anon";

grant update on table "public"."form_fields" to "anon";

grant delete on table "public"."form_fields" to "authenticated";

grant insert on table "public"."form_fields" to "authenticated";

grant references on table "public"."form_fields" to "authenticated";

grant select on table "public"."form_fields" to "authenticated";

grant trigger on table "public"."form_fields" to "authenticated";

grant truncate on table "public"."form_fields" to "authenticated";

grant update on table "public"."form_fields" to "authenticated";

grant delete on table "public"."form_fields" to "service_role";

grant insert on table "public"."form_fields" to "service_role";

grant references on table "public"."form_fields" to "service_role";

grant select on table "public"."form_fields" to "service_role";

grant trigger on table "public"."form_fields" to "service_role";

grant truncate on table "public"."form_fields" to "service_role";

grant update on table "public"."form_fields" to "service_role";

grant delete on table "public"."forms" to "anon";

grant insert on table "public"."forms" to "anon";

grant references on table "public"."forms" to "anon";

grant select on table "public"."forms" to "anon";

grant trigger on table "public"."forms" to "anon";

grant truncate on table "public"."forms" to "anon";

grant update on table "public"."forms" to "anon";

grant delete on table "public"."forms" to "authenticated";

grant insert on table "public"."forms" to "authenticated";

grant references on table "public"."forms" to "authenticated";

grant select on table "public"."forms" to "authenticated";

grant trigger on table "public"."forms" to "authenticated";

grant truncate on table "public"."forms" to "authenticated";

grant update on table "public"."forms" to "authenticated";

grant delete on table "public"."forms" to "service_role";

grant insert on table "public"."forms" to "service_role";

grant references on table "public"."forms" to "service_role";

grant select on table "public"."forms" to "service_role";

grant trigger on table "public"."forms" to "service_role";

grant truncate on table "public"."forms" to "service_role";

grant update on table "public"."forms" to "service_role";

grant delete on table "public"."menu_items" to "anon";

grant insert on table "public"."menu_items" to "anon";

grant references on table "public"."menu_items" to "anon";

grant select on table "public"."menu_items" to "anon";

grant trigger on table "public"."menu_items" to "anon";

grant truncate on table "public"."menu_items" to "anon";

grant update on table "public"."menu_items" to "anon";

grant delete on table "public"."menu_items" to "authenticated";

grant insert on table "public"."menu_items" to "authenticated";

grant references on table "public"."menu_items" to "authenticated";

grant select on table "public"."menu_items" to "authenticated";

grant trigger on table "public"."menu_items" to "authenticated";

grant truncate on table "public"."menu_items" to "authenticated";

grant update on table "public"."menu_items" to "authenticated";

grant delete on table "public"."menu_items" to "service_role";

grant insert on table "public"."menu_items" to "service_role";

grant references on table "public"."menu_items" to "service_role";

grant select on table "public"."menu_items" to "service_role";

grant trigger on table "public"."menu_items" to "service_role";

grant truncate on table "public"."menu_items" to "service_role";

grant update on table "public"."menu_items" to "service_role";

grant delete on table "public"."order_chat" to "anon";

grant insert on table "public"."order_chat" to "anon";

grant references on table "public"."order_chat" to "anon";

grant select on table "public"."order_chat" to "anon";

grant trigger on table "public"."order_chat" to "anon";

grant truncate on table "public"."order_chat" to "anon";

grant update on table "public"."order_chat" to "anon";

grant delete on table "public"."order_chat" to "authenticated";

grant insert on table "public"."order_chat" to "authenticated";

grant references on table "public"."order_chat" to "authenticated";

grant select on table "public"."order_chat" to "authenticated";

grant trigger on table "public"."order_chat" to "authenticated";

grant truncate on table "public"."order_chat" to "authenticated";

grant update on table "public"."order_chat" to "authenticated";

grant delete on table "public"."order_chat" to "service_role";

grant insert on table "public"."order_chat" to "service_role";

grant references on table "public"."order_chat" to "service_role";

grant select on table "public"."order_chat" to "service_role";

grant trigger on table "public"."order_chat" to "service_role";

grant truncate on table "public"."order_chat" to "service_role";

grant update on table "public"."order_chat" to "service_role";

grant delete on table "public"."order_items" to "anon";

grant insert on table "public"."order_items" to "anon";

grant references on table "public"."order_items" to "anon";

grant select on table "public"."order_items" to "anon";

grant trigger on table "public"."order_items" to "anon";

grant truncate on table "public"."order_items" to "anon";

grant update on table "public"."order_items" to "anon";

grant delete on table "public"."order_items" to "authenticated";

grant insert on table "public"."order_items" to "authenticated";

grant references on table "public"."order_items" to "authenticated";

grant select on table "public"."order_items" to "authenticated";

grant trigger on table "public"."order_items" to "authenticated";

grant truncate on table "public"."order_items" to "authenticated";

grant update on table "public"."order_items" to "authenticated";

grant delete on table "public"."order_items" to "service_role";

grant insert on table "public"."order_items" to "service_role";

grant references on table "public"."order_items" to "service_role";

grant select on table "public"."order_items" to "service_role";

grant trigger on table "public"."order_items" to "service_role";

grant truncate on table "public"."order_items" to "service_role";

grant update on table "public"."order_items" to "service_role";

grant delete on table "public"."order_totals" to "anon";

grant insert on table "public"."order_totals" to "anon";

grant references on table "public"."order_totals" to "anon";

grant select on table "public"."order_totals" to "anon";

grant trigger on table "public"."order_totals" to "anon";

grant truncate on table "public"."order_totals" to "anon";

grant update on table "public"."order_totals" to "anon";

grant delete on table "public"."order_totals" to "authenticated";

grant insert on table "public"."order_totals" to "authenticated";

grant references on table "public"."order_totals" to "authenticated";

grant select on table "public"."order_totals" to "authenticated";

grant trigger on table "public"."order_totals" to "authenticated";

grant truncate on table "public"."order_totals" to "authenticated";

grant update on table "public"."order_totals" to "authenticated";

grant delete on table "public"."order_totals" to "service_role";

grant insert on table "public"."order_totals" to "service_role";

grant references on table "public"."order_totals" to "service_role";

grant select on table "public"."order_totals" to "service_role";

grant trigger on table "public"."order_totals" to "service_role";

grant truncate on table "public"."order_totals" to "service_role";

grant update on table "public"."order_totals" to "service_role";

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."pagarme_settings" to "anon";

grant insert on table "public"."pagarme_settings" to "anon";

grant references on table "public"."pagarme_settings" to "anon";

grant select on table "public"."pagarme_settings" to "anon";

grant trigger on table "public"."pagarme_settings" to "anon";

grant truncate on table "public"."pagarme_settings" to "anon";

grant update on table "public"."pagarme_settings" to "anon";

grant delete on table "public"."pagarme_settings" to "authenticated";

grant insert on table "public"."pagarme_settings" to "authenticated";

grant references on table "public"."pagarme_settings" to "authenticated";

grant select on table "public"."pagarme_settings" to "authenticated";

grant trigger on table "public"."pagarme_settings" to "authenticated";

grant truncate on table "public"."pagarme_settings" to "authenticated";

grant update on table "public"."pagarme_settings" to "authenticated";

grant delete on table "public"."pagarme_settings" to "service_role";

grant insert on table "public"."pagarme_settings" to "service_role";

grant references on table "public"."pagarme_settings" to "service_role";

grant select on table "public"."pagarme_settings" to "service_role";

grant trigger on table "public"."pagarme_settings" to "service_role";

grant truncate on table "public"."pagarme_settings" to "service_role";

grant update on table "public"."pagarme_settings" to "service_role";

grant delete on table "public"."pages" to "anon";

grant insert on table "public"."pages" to "anon";

grant references on table "public"."pages" to "anon";

grant select on table "public"."pages" to "anon";

grant trigger on table "public"."pages" to "anon";

grant truncate on table "public"."pages" to "anon";

grant update on table "public"."pages" to "anon";

grant delete on table "public"."pages" to "authenticated";

grant insert on table "public"."pages" to "authenticated";

grant references on table "public"."pages" to "authenticated";

grant select on table "public"."pages" to "authenticated";

grant trigger on table "public"."pages" to "authenticated";

grant truncate on table "public"."pages" to "authenticated";

grant update on table "public"."pages" to "authenticated";

grant delete on table "public"."pages" to "service_role";

grant insert on table "public"."pages" to "service_role";

grant references on table "public"."pages" to "service_role";

grant select on table "public"."pages" to "service_role";

grant trigger on table "public"."pages" to "service_role";

grant truncate on table "public"."pages" to "service_role";

grant update on table "public"."pages" to "service_role";

grant delete on table "public"."payment_settings" to "anon";

grant insert on table "public"."payment_settings" to "anon";

grant references on table "public"."payment_settings" to "anon";

grant select on table "public"."payment_settings" to "anon";

grant trigger on table "public"."payment_settings" to "anon";

grant truncate on table "public"."payment_settings" to "anon";

grant update on table "public"."payment_settings" to "anon";

grant delete on table "public"."payment_settings" to "authenticated";

grant insert on table "public"."payment_settings" to "authenticated";

grant references on table "public"."payment_settings" to "authenticated";

grant select on table "public"."payment_settings" to "authenticated";

grant trigger on table "public"."payment_settings" to "authenticated";

grant truncate on table "public"."payment_settings" to "authenticated";

grant update on table "public"."payment_settings" to "authenticated";

grant delete on table "public"."payment_settings" to "service_role";

grant insert on table "public"."payment_settings" to "service_role";

grant references on table "public"."payment_settings" to "service_role";

grant select on table "public"."payment_settings" to "service_role";

grant trigger on table "public"."payment_settings" to "service_role";

grant truncate on table "public"."payment_settings" to "service_role";

grant update on table "public"."payment_settings" to "service_role";

grant delete on table "public"."payments" to "anon";

grant insert on table "public"."payments" to "anon";

grant references on table "public"."payments" to "anon";

grant select on table "public"."payments" to "anon";

grant trigger on table "public"."payments" to "anon";

grant truncate on table "public"."payments" to "anon";

grant update on table "public"."payments" to "anon";

grant delete on table "public"."payments" to "authenticated";

grant insert on table "public"."payments" to "authenticated";

grant references on table "public"."payments" to "authenticated";

grant select on table "public"."payments" to "authenticated";

grant trigger on table "public"."payments" to "authenticated";

grant truncate on table "public"."payments" to "authenticated";

grant update on table "public"."payments" to "authenticated";

grant delete on table "public"."payments" to "service_role";

grant insert on table "public"."payments" to "service_role";

grant references on table "public"."payments" to "service_role";

grant select on table "public"."payments" to "service_role";

grant trigger on table "public"."payments" to "service_role";

grant truncate on table "public"."payments" to "service_role";

grant update on table "public"."payments" to "service_role";

grant delete on table "public"."permissions" to "anon";

grant insert on table "public"."permissions" to "anon";

grant references on table "public"."permissions" to "anon";

grant select on table "public"."permissions" to "anon";

grant trigger on table "public"."permissions" to "anon";

grant truncate on table "public"."permissions" to "anon";

grant update on table "public"."permissions" to "anon";

grant delete on table "public"."permissions" to "authenticated";

grant insert on table "public"."permissions" to "authenticated";

grant references on table "public"."permissions" to "authenticated";

grant select on table "public"."permissions" to "authenticated";

grant trigger on table "public"."permissions" to "authenticated";

grant truncate on table "public"."permissions" to "authenticated";

grant update on table "public"."permissions" to "authenticated";

grant delete on table "public"."permissions" to "service_role";

grant insert on table "public"."permissions" to "service_role";

grant references on table "public"."permissions" to "service_role";

grant select on table "public"."permissions" to "service_role";

grant trigger on table "public"."permissions" to "service_role";

grant truncate on table "public"."permissions" to "service_role";

grant update on table "public"."permissions" to "service_role";

grant delete on table "public"."platform_users" to "anon";

grant insert on table "public"."platform_users" to "anon";

grant references on table "public"."platform_users" to "anon";

grant select on table "public"."platform_users" to "anon";

grant trigger on table "public"."platform_users" to "anon";

grant truncate on table "public"."platform_users" to "anon";

grant update on table "public"."platform_users" to "anon";

grant delete on table "public"."platform_users" to "authenticated";

grant insert on table "public"."platform_users" to "authenticated";

grant references on table "public"."platform_users" to "authenticated";

grant select on table "public"."platform_users" to "authenticated";

grant trigger on table "public"."platform_users" to "authenticated";

grant truncate on table "public"."platform_users" to "authenticated";

grant update on table "public"."platform_users" to "authenticated";

grant delete on table "public"."platform_users" to "service_role";

grant insert on table "public"."platform_users" to "service_role";

grant references on table "public"."platform_users" to "service_role";

grant select on table "public"."platform_users" to "service_role";

grant trigger on table "public"."platform_users" to "service_role";

grant truncate on table "public"."platform_users" to "service_role";

grant update on table "public"."platform_users" to "service_role";

grant delete on table "public"."promotion_sites" to "anon";

grant insert on table "public"."promotion_sites" to "anon";

grant references on table "public"."promotion_sites" to "anon";

grant select on table "public"."promotion_sites" to "anon";

grant trigger on table "public"."promotion_sites" to "anon";

grant truncate on table "public"."promotion_sites" to "anon";

grant update on table "public"."promotion_sites" to "anon";

grant delete on table "public"."promotion_sites" to "authenticated";

grant insert on table "public"."promotion_sites" to "authenticated";

grant references on table "public"."promotion_sites" to "authenticated";

grant select on table "public"."promotion_sites" to "authenticated";

grant trigger on table "public"."promotion_sites" to "authenticated";

grant truncate on table "public"."promotion_sites" to "authenticated";

grant update on table "public"."promotion_sites" to "authenticated";

grant delete on table "public"."promotion_sites" to "service_role";

grant insert on table "public"."promotion_sites" to "service_role";

grant references on table "public"."promotion_sites" to "service_role";

grant select on table "public"."promotion_sites" to "service_role";

grant trigger on table "public"."promotion_sites" to "service_role";

grant truncate on table "public"."promotion_sites" to "service_role";

grant update on table "public"."promotion_sites" to "service_role";

grant delete on table "public"."publisher_services" to "anon";

grant insert on table "public"."publisher_services" to "anon";

grant references on table "public"."publisher_services" to "anon";

grant select on table "public"."publisher_services" to "anon";

grant trigger on table "public"."publisher_services" to "anon";

grant truncate on table "public"."publisher_services" to "anon";

grant update on table "public"."publisher_services" to "anon";

grant delete on table "public"."publisher_services" to "authenticated";

grant insert on table "public"."publisher_services" to "authenticated";

grant references on table "public"."publisher_services" to "authenticated";

grant select on table "public"."publisher_services" to "authenticated";

grant trigger on table "public"."publisher_services" to "authenticated";

grant truncate on table "public"."publisher_services" to "authenticated";

grant update on table "public"."publisher_services" to "authenticated";

grant delete on table "public"."publisher_services" to "service_role";

grant insert on table "public"."publisher_services" to "service_role";

grant references on table "public"."publisher_services" to "service_role";

grant select on table "public"."publisher_services" to "service_role";

grant trigger on table "public"."publisher_services" to "service_role";

grant truncate on table "public"."publisher_services" to "service_role";

grant update on table "public"."publisher_services" to "service_role";

grant delete on table "public"."role_permissions" to "anon";

grant insert on table "public"."role_permissions" to "anon";

grant references on table "public"."role_permissions" to "anon";

grant select on table "public"."role_permissions" to "anon";

grant trigger on table "public"."role_permissions" to "anon";

grant truncate on table "public"."role_permissions" to "anon";

grant update on table "public"."role_permissions" to "anon";

grant delete on table "public"."role_permissions" to "authenticated";

grant insert on table "public"."role_permissions" to "authenticated";

grant references on table "public"."role_permissions" to "authenticated";

grant select on table "public"."role_permissions" to "authenticated";

grant trigger on table "public"."role_permissions" to "authenticated";

grant truncate on table "public"."role_permissions" to "authenticated";

grant update on table "public"."role_permissions" to "authenticated";

grant delete on table "public"."role_permissions" to "service_role";

grant insert on table "public"."role_permissions" to "service_role";

grant references on table "public"."role_permissions" to "service_role";

grant select on table "public"."role_permissions" to "service_role";

grant trigger on table "public"."role_permissions" to "service_role";

grant truncate on table "public"."role_permissions" to "service_role";

grant update on table "public"."role_permissions" to "service_role";

grant delete on table "public"."roles" to "anon";

grant insert on table "public"."roles" to "anon";

grant references on table "public"."roles" to "anon";

grant select on table "public"."roles" to "anon";

grant trigger on table "public"."roles" to "anon";

grant truncate on table "public"."roles" to "anon";

grant update on table "public"."roles" to "anon";

grant delete on table "public"."roles" to "authenticated";

grant insert on table "public"."roles" to "authenticated";

grant references on table "public"."roles" to "authenticated";

grant select on table "public"."roles" to "authenticated";

grant trigger on table "public"."roles" to "authenticated";

grant truncate on table "public"."roles" to "authenticated";

grant update on table "public"."roles" to "authenticated";

grant delete on table "public"."roles" to "service_role";

grant insert on table "public"."roles" to "service_role";

grant references on table "public"."roles" to "service_role";

grant select on table "public"."roles" to "service_role";

grant trigger on table "public"."roles" to "service_role";

grant truncate on table "public"."roles" to "service_role";

grant update on table "public"."roles" to "service_role";

grant delete on table "public"."service_cards" to "anon";

grant insert on table "public"."service_cards" to "anon";

grant references on table "public"."service_cards" to "anon";

grant select on table "public"."service_cards" to "anon";

grant trigger on table "public"."service_cards" to "anon";

grant truncate on table "public"."service_cards" to "anon";

grant update on table "public"."service_cards" to "anon";

grant delete on table "public"."service_cards" to "authenticated";

grant insert on table "public"."service_cards" to "authenticated";

grant references on table "public"."service_cards" to "authenticated";

grant select on table "public"."service_cards" to "authenticated";

grant trigger on table "public"."service_cards" to "authenticated";

grant truncate on table "public"."service_cards" to "authenticated";

grant update on table "public"."service_cards" to "authenticated";

grant delete on table "public"."service_cards" to "service_role";

grant insert on table "public"."service_cards" to "service_role";

grant references on table "public"."service_cards" to "service_role";

grant select on table "public"."service_cards" to "service_role";

grant trigger on table "public"."service_cards" to "service_role";

grant truncate on table "public"."service_cards" to "service_role";

grant update on table "public"."service_cards" to "service_role";

grant delete on table "public"."services" to "anon";

grant insert on table "public"."services" to "anon";

grant references on table "public"."services" to "anon";

grant select on table "public"."services" to "anon";

grant trigger on table "public"."services" to "anon";

grant truncate on table "public"."services" to "anon";

grant update on table "public"."services" to "anon";

grant delete on table "public"."services" to "authenticated";

grant insert on table "public"."services" to "authenticated";

grant references on table "public"."services" to "authenticated";

grant select on table "public"."services" to "authenticated";

grant trigger on table "public"."services" to "authenticated";

grant truncate on table "public"."services" to "authenticated";

grant update on table "public"."services" to "authenticated";

grant delete on table "public"."services" to "service_role";

grant insert on table "public"."services" to "service_role";

grant references on table "public"."services" to "service_role";

grant select on table "public"."services" to "service_role";

grant trigger on table "public"."services" to "service_role";

grant truncate on table "public"."services" to "service_role";

grant update on table "public"."services" to "service_role";

grant delete on table "public"."settings" to "anon";

grant insert on table "public"."settings" to "anon";

grant references on table "public"."settings" to "anon";

grant select on table "public"."settings" to "anon";

grant trigger on table "public"."settings" to "anon";

grant truncate on table "public"."settings" to "anon";

grant update on table "public"."settings" to "anon";

grant delete on table "public"."settings" to "authenticated";

grant insert on table "public"."settings" to "authenticated";

grant references on table "public"."settings" to "authenticated";

grant select on table "public"."settings" to "authenticated";

grant trigger on table "public"."settings" to "authenticated";

grant truncate on table "public"."settings" to "authenticated";

grant update on table "public"."settings" to "authenticated";

grant delete on table "public"."settings" to "service_role";

grant insert on table "public"."settings" to "service_role";

grant references on table "public"."settings" to "service_role";

grant select on table "public"."settings" to "service_role";

grant trigger on table "public"."settings" to "service_role";

grant truncate on table "public"."settings" to "service_role";

grant update on table "public"."settings" to "service_role";

grant delete on table "public"."shopping_cart_items" to "anon";

grant insert on table "public"."shopping_cart_items" to "anon";

grant references on table "public"."shopping_cart_items" to "anon";

grant select on table "public"."shopping_cart_items" to "anon";

grant trigger on table "public"."shopping_cart_items" to "anon";

grant truncate on table "public"."shopping_cart_items" to "anon";

grant update on table "public"."shopping_cart_items" to "anon";

grant delete on table "public"."shopping_cart_items" to "authenticated";

grant insert on table "public"."shopping_cart_items" to "authenticated";

grant references on table "public"."shopping_cart_items" to "authenticated";

grant select on table "public"."shopping_cart_items" to "authenticated";

grant trigger on table "public"."shopping_cart_items" to "authenticated";

grant truncate on table "public"."shopping_cart_items" to "authenticated";

grant update on table "public"."shopping_cart_items" to "authenticated";

grant delete on table "public"."shopping_cart_items" to "service_role";

grant insert on table "public"."shopping_cart_items" to "service_role";

grant references on table "public"."shopping_cart_items" to "service_role";

grant select on table "public"."shopping_cart_items" to "service_role";

grant trigger on table "public"."shopping_cart_items" to "service_role";

grant truncate on table "public"."shopping_cart_items" to "service_role";

grant update on table "public"."shopping_cart_items" to "service_role";

grant delete on table "public"."trigger_debug_log" to "anon";

grant insert on table "public"."trigger_debug_log" to "anon";

grant references on table "public"."trigger_debug_log" to "anon";

grant select on table "public"."trigger_debug_log" to "anon";

grant trigger on table "public"."trigger_debug_log" to "anon";

grant truncate on table "public"."trigger_debug_log" to "anon";

grant update on table "public"."trigger_debug_log" to "anon";

grant delete on table "public"."trigger_debug_log" to "authenticated";

grant insert on table "public"."trigger_debug_log" to "authenticated";

grant references on table "public"."trigger_debug_log" to "authenticated";

grant select on table "public"."trigger_debug_log" to "authenticated";

grant trigger on table "public"."trigger_debug_log" to "authenticated";

grant truncate on table "public"."trigger_debug_log" to "authenticated";

grant update on table "public"."trigger_debug_log" to "authenticated";

grant delete on table "public"."trigger_debug_log" to "service_role";

grant insert on table "public"."trigger_debug_log" to "service_role";

grant references on table "public"."trigger_debug_log" to "service_role";

grant select on table "public"."trigger_debug_log" to "service_role";

grant trigger on table "public"."trigger_debug_log" to "service_role";

grant truncate on table "public"."trigger_debug_log" to "service_role";

grant update on table "public"."trigger_debug_log" to "service_role";

grant delete on table "public"."user_favorites" to "anon";

grant insert on table "public"."user_favorites" to "anon";

grant references on table "public"."user_favorites" to "anon";

grant select on table "public"."user_favorites" to "anon";

grant trigger on table "public"."user_favorites" to "anon";

grant truncate on table "public"."user_favorites" to "anon";

grant update on table "public"."user_favorites" to "anon";

grant delete on table "public"."user_favorites" to "authenticated";

grant insert on table "public"."user_favorites" to "authenticated";

grant references on table "public"."user_favorites" to "authenticated";

grant select on table "public"."user_favorites" to "authenticated";

grant trigger on table "public"."user_favorites" to "authenticated";

grant truncate on table "public"."user_favorites" to "authenticated";

grant update on table "public"."user_favorites" to "authenticated";

grant delete on table "public"."user_favorites" to "service_role";

grant insert on table "public"."user_favorites" to "service_role";

grant references on table "public"."user_favorites" to "service_role";

grant select on table "public"."user_favorites" to "service_role";

grant trigger on table "public"."user_favorites" to "service_role";

grant truncate on table "public"."user_favorites" to "service_role";

grant update on table "public"."user_favorites" to "service_role";

grant delete on table "public"."user_stats" to "anon";

grant insert on table "public"."user_stats" to "anon";

grant references on table "public"."user_stats" to "anon";

grant select on table "public"."user_stats" to "anon";

grant trigger on table "public"."user_stats" to "anon";

grant truncate on table "public"."user_stats" to "anon";

grant update on table "public"."user_stats" to "anon";

grant delete on table "public"."user_stats" to "authenticated";

grant insert on table "public"."user_stats" to "authenticated";

grant references on table "public"."user_stats" to "authenticated";

grant select on table "public"."user_stats" to "authenticated";

grant trigger on table "public"."user_stats" to "authenticated";

grant truncate on table "public"."user_stats" to "authenticated";

grant update on table "public"."user_stats" to "authenticated";

grant delete on table "public"."user_stats" to "service_role";

grant insert on table "public"."user_stats" to "service_role";

grant references on table "public"."user_stats" to "service_role";

grant select on table "public"."user_stats" to "service_role";

grant trigger on table "public"."user_stats" to "service_role";

grant truncate on table "public"."user_stats" to "service_role";

grant update on table "public"."user_stats" to "service_role";

create policy "Admins can delete their own account"
on "public"."admins"
as permissive
for delete
to authenticated
using ((auth.uid() = id));


create policy "Admins can read their own data"
on "public"."admins"
as permissive
for select
to authenticated
using ((auth.uid() = id));


create policy "Admins can update their own data"
on "public"."admins"
as permissive
for update
to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));


create policy "Admins podem inserir admins"
on "public"."admins"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM admins a
  WHERE (a.id = auth.uid()))));


create policy "Allow admin creation"
on "public"."admins"
as permissive
for insert
to authenticated
with check ((auth.uid() = id));


create policy "Public can verify admin emails"
on "public"."admins"
as permissive
for select
to public
using (true);


create policy "Authenticated users can delete best selling sites"
on "public"."best_selling_sites"
as permissive
for delete
to authenticated
using (true);


create policy "Authenticated users can insert best selling sites"
on "public"."best_selling_sites"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can read best selling sites"
on "public"."best_selling_sites"
as permissive
for select
to authenticated
using (true);


create policy "Authenticated users can update best selling sites"
on "public"."best_selling_sites"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "Permitir delete para autenticados"
on "public"."cart_checkout_resume"
as permissive
for delete
to public
using ((auth.uid() IS NOT NULL));


create policy "Permitir insert para autenticados"
on "public"."cart_checkout_resume"
as permissive
for insert
to public
with check ((auth.uid() IS NOT NULL));


create policy "Permitir select para autenticados"
on "public"."cart_checkout_resume"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "Permitir update para autenticados"
on "public"."cart_checkout_resume"
as permissive
for update
to public
using ((auth.uid() IS NOT NULL))
with check ((auth.uid() IS NOT NULL));


create policy "Admins can delete their own company data"
on "public"."company_data"
as permissive
for delete
to authenticated
using ((auth.uid() = admin_id));


create policy "Admins can insert their own company data"
on "public"."company_data"
as permissive
for insert
to authenticated
with check ((auth.uid() = admin_id));


create policy "Admins can read their own company data"
on "public"."company_data"
as permissive
for select
to authenticated
using ((auth.uid() = admin_id));


create policy "Admins can update their own company data"
on "public"."company_data"
as permissive
for update
to authenticated
using ((auth.uid() = admin_id))
with check ((auth.uid() = admin_id));


create policy "Allow authenticated delete own company_data"
on "public"."company_data"
as permissive
for delete
to public
using (((auth.role() = 'authenticated'::text) AND ((admin_id = auth.uid()) OR (user_id = auth.uid()))));


create policy "Allow authenticated insert own company_data"
on "public"."company_data"
as permissive
for insert
to public
with check (((auth.role() = 'authenticated'::text) AND ((admin_id = auth.uid()) OR (user_id = auth.uid()))));


create policy "Allow authenticated read own company_data"
on "public"."company_data"
as permissive
for select
to public
using (((auth.role() = 'authenticated'::text) AND ((admin_id = auth.uid()) OR (user_id = auth.uid()))));


create policy "Allow authenticated update own company_data"
on "public"."company_data"
as permissive
for update
to public
using (((auth.role() = 'authenticated'::text) AND ((admin_id = auth.uid()) OR (user_id = auth.uid()))));


create policy "Authenticated users can read privacy policy"
on "public"."contracts"
as permissive
for select
to authenticated
using ((type_of_contract = 'politica_privacidade'::text));


create policy "Authenticated users can read terms and conditions"
on "public"."contracts"
as permissive
for select
to authenticated
using ((type_of_contract = 'termos_condicoes'::text));


create policy "Only admins can delete contracts"
on "public"."contracts"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Only admins can insert contracts"
on "public"."contracts"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Only admins can read contracts"
on "public"."contracts"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Only admins can update contracts"
on "public"."contracts"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))))
with check ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Public can read privacy policy"
on "public"."contracts"
as permissive
for select
to anon
using ((type_of_contract = 'politica_privacidade'::text));


create policy "Public can read terms and conditions"
on "public"."contracts"
as permissive
for select
to anon
using ((type_of_contract = 'termos_condicoes'::text));


create policy "Admins can delete coupons"
on "public"."coupons"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can insert coupons"
on "public"."coupons"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can read coupons"
on "public"."coupons"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can update coupons"
on "public"."coupons"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Users can read active coupons for validation"
on "public"."coupons"
as permissive
for select
to authenticated
using ((is_active = true));


create policy "Admins can read email templates"
on "public"."email_templates"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can update email templates"
on "public"."email_templates"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Authenticated users can access their own favorite sites"
on "public"."favorite_sites"
as permissive
for all
to public
using (((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))) OR ((EXISTS ( SELECT 1
   FROM platform_users
  WHERE (platform_users.id = auth.uid()))) AND (user_id = auth.uid()))));


create policy "Authenticated users can insert favorite sites"
on "public"."favorite_sites"
as permissive
for insert
to public
with check ((((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM platform_users
  WHERE (platform_users.id = auth.uid())))) AND (user_id = auth.uid())));


create policy "Users can create own feedback_submissions"
on "public"."feedback_submissions"
as permissive
for insert
to public
with check (((auth.uid() = user_id) AND (auth.uid() IS NOT NULL)));


create policy "Users can delete own feedback_submissions"
on "public"."feedback_submissions"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can update own feedback_submissions"
on "public"."feedback_submissions"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can view own feedback_submissions"
on "public"."feedback_submissions"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Admins can delete form entries"
on "public"."form_entries"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can read form entries"
on "public"."form_entries"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can update form entries"
on "public"."form_entries"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Anyone can create form entries"
on "public"."form_entries"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM forms f
  WHERE ((f.id = form_entries.form_id) AND (f.status = 'published'::text)))));


create policy "Anyone can view all entries for marketplace"
on "public"."form_entries"
as permissive
for select
to public
using (true);


create policy "Anyone can view verified entries"
on "public"."form_entries"
as permissive
for select
to public
using ((status = 'verificado'::text));


create policy "Users can delete their own entries"
on "public"."form_entries"
as permissive
for delete
to authenticated
using ((auth.uid() = created_by));


create policy "Users can update their own entries"
on "public"."form_entries"
as permissive
for update
to authenticated
using ((auth.uid() = created_by));


create policy "Users can view their own entries"
on "public"."form_entries"
as permissive
for select
to authenticated
using ((auth.uid() = created_by));


create policy "Admins can create entry notes"
on "public"."form_entry_notes"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can delete entry notes"
on "public"."form_entry_notes"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can read entry notes"
on "public"."form_entry_notes"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can update entry notes"
on "public"."form_entry_notes"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Users can add notes to their own entries"
on "public"."form_entry_notes"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM form_entries fe
  WHERE ((fe.id = form_entry_notes.entry_id) AND (fe.created_by = auth.uid())))));


create policy "Users can view notes on their own entries"
on "public"."form_entry_notes"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM form_entries fe
  WHERE ((fe.id = form_entry_notes.entry_id) AND (fe.created_by = auth.uid())))));


create policy "Admins can read entry values"
on "public"."form_entry_values"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Allow admins and owners to delete form_entry_values"
on "public"."form_entry_values"
as permissive
for delete
to public
using (((EXISTS ( SELECT 1
   FROM (admins a
     JOIN roles r ON ((r.id = a.role_id)))
  WHERE ((a.id = auth.uid()) AND (r.name = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM form_entries fe
  WHERE ((fe.id = form_entry_values.entry_id) AND (fe.created_by = auth.uid()))))));


create policy "Allow admins and owners to insert form_entry_values"
on "public"."form_entry_values"
as permissive
for insert
to public
with check (((EXISTS ( SELECT 1
   FROM (admins a
     JOIN roles r ON ((r.id = a.role_id)))
  WHERE ((a.id = auth.uid()) AND (r.name = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM form_entries fe
  WHERE ((fe.id = form_entry_values.entry_id) AND (fe.created_by = auth.uid()))))));


create policy "Allow admins and owners to read form_entry_values"
on "public"."form_entry_values"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM (admins a
     JOIN roles r ON ((r.id = a.role_id)))
  WHERE ((a.id = auth.uid()) AND (r.name = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM form_entries fe
  WHERE ((fe.id = form_entry_values.entry_id) AND (fe.created_by = auth.uid()))))));


create policy "Allow admins and owners to update form_entry_values"
on "public"."form_entry_values"
as permissive
for update
to public
using (((EXISTS ( SELECT 1
   FROM (admins a
     JOIN roles r ON ((r.id = a.role_id)))
  WHERE ((a.id = auth.uid()) AND (r.name = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM form_entries fe
  WHERE ((fe.id = form_entry_values.entry_id) AND (fe.created_by = auth.uid()))))))
with check (((EXISTS ( SELECT 1
   FROM (admins a
     JOIN roles r ON ((r.id = a.role_id)))
  WHERE ((a.id = auth.uid()) AND (r.name = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM form_entries fe
  WHERE ((fe.id = form_entry_values.entry_id) AND (fe.created_by = auth.uid()))))));


create policy "Anyone can create entry values"
on "public"."form_entry_values"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM (form_entries fe
     JOIN forms f ON ((f.id = fe.form_id)))
  WHERE ((fe.id = form_entry_values.entry_id) AND (f.status = 'published'::text)))));


create policy "Anyone can view all entry values for marketplace"
on "public"."form_entry_values"
as permissive
for select
to public
using (true);


create policy "Anyone can view values of verified entries"
on "public"."form_entry_values"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM form_entries fe
  WHERE ((fe.id = form_entry_values.entry_id) AND (fe.status = 'verificado'::text)))));


create policy "Users can delete their own entry values"
on "public"."form_entry_values"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM form_entries fe
  WHERE ((fe.id = form_entry_values.entry_id) AND (fe.created_by = auth.uid())))));


create policy "Users can update their own entry values"
on "public"."form_entry_values"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM form_entries fe
  WHERE ((fe.id = form_entry_values.entry_id) AND (fe.created_by = auth.uid())))));


create policy "Users can view their own entry values"
on "public"."form_entry_values"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM form_entries fe
  WHERE ((fe.id = form_entry_values.entry_id) AND (fe.created_by = auth.uid())))));


create policy "Permitir delete para autenticados"
on "public"."form_field_niche"
as permissive
for delete
to public
using ((auth.uid() IS NOT NULL));


create policy "Permitir insert para autenticados"
on "public"."form_field_niche"
as permissive
for insert
to public
with check ((auth.uid() IS NOT NULL));


create policy "Permitir select para autenticados"
on "public"."form_field_niche"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "Permitir update para autenticados"
on "public"."form_field_niche"
as permissive
for update
to public
using ((auth.uid() IS NOT NULL))
with check ((auth.uid() IS NOT NULL));


create policy "Admins can delete form field settings"
on "public"."form_field_settings"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can insert form field settings"
on "public"."form_field_settings"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can update form field settings"
on "public"."form_field_settings"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Anyone can read form field settings"
on "public"."form_field_settings"
as permissive
for select
to public
using (true);


create policy "Admins can delete form fields"
on "public"."form_fields"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can insert form fields"
on "public"."form_fields"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can update form fields"
on "public"."form_fields"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Anyone can read form fields"
on "public"."form_fields"
as permissive
for select
to public
using (true);


create policy "Admins can delete forms"
on "public"."forms"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can insert forms"
on "public"."forms"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can update forms"
on "public"."forms"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Anyone can read published forms"
on "public"."forms"
as permissive
for select
to public
using (((status = 'published'::text) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid())))));


create policy "Admins can delete menu_items"
on "public"."menu_items"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can insert menu_items"
on "public"."menu_items"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can read menu_items"
on "public"."menu_items"
as permissive
for select
to authenticated
using (((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))) OR ((EXISTS ( SELECT 1
   FROM platform_users
  WHERE (platform_users.id = auth.uid()))) AND ((visible_to = 'all'::text) OR (visible_to = ( SELECT platform_users.role
   FROM platform_users
  WHERE (platform_users.id = auth.uid())))))));


create policy "Admins can update menu_items"
on "public"."menu_items"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can delete chat messages"
on "public"."order_chat"
as permissive
for delete
to public
using (((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM (admins a
     JOIN roles r ON ((a.role_id = r.id)))
  WHERE ((a.id = auth.uid()) AND (r.name = 'admin'::text))))));


create policy "Users can insert their own chat messages"
on "public"."order_chat"
as permissive
for insert
to public
with check (((auth.uid() IS NOT NULL) AND (sender_id = auth.uid()) AND ((((sender_type)::text = 'user'::text) AND (EXISTS ( SELECT 1
   FROM orders o
  WHERE ((o.id = order_chat.order_id) AND (o.user_id = auth.uid()))))) OR (((sender_type)::text = 'admin'::text) AND (EXISTS ( SELECT 1
   FROM (admins a
     JOIN roles r ON ((a.role_id = r.id)))
  WHERE ((a.id = auth.uid()) AND (r.name = 'admin'::text))))))));


create policy "Users can read their own chat messages"
on "public"."order_chat"
as permissive
for select
to public
using (((auth.uid() IS NOT NULL) AND ((EXISTS ( SELECT 1
   FROM orders o
  WHERE ((o.id = order_chat.order_id) AND (o.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (admins a
     JOIN roles r ON ((a.role_id = r.id)))
  WHERE ((a.id = auth.uid()) AND (r.name = 'admin'::text)))))));


create policy "Users can update chat messages"
on "public"."order_chat"
as permissive
for update
to public
using (((auth.uid() IS NOT NULL) AND ((EXISTS ( SELECT 1
   FROM orders o
  WHERE ((o.id = order_chat.order_id) AND (o.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (admins a
     JOIN roles r ON ((a.role_id = r.id)))
  WHERE ((a.id = auth.uid()) AND (r.name = 'admin'::text)))))))
with check (((auth.uid() IS NOT NULL) AND ((EXISTS ( SELECT 1
   FROM orders o
  WHERE ((o.id = order_chat.order_id) AND (o.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (admins a
     JOIN roles r ON ((a.role_id = r.id)))
  WHERE ((a.id = auth.uid()) AND (r.name = 'admin'::text)))))));


create policy "Admins can delete all order items"
on "public"."order_items"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can view all order items"
on "public"."order_items"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Allow delete for owner"
on "public"."order_items"
as permissive
for delete
to public
using (((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid()))))));


create policy "Allow insert for owner"
on "public"."order_items"
as permissive
for insert
to public
with check (((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid()))))));


create policy "Allow select for owner"
on "public"."order_items"
as permissive
for select
to public
using (((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid()))))));


create policy "Allow update for owner"
on "public"."order_items"
as permissive
for update
to public
using (((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid()))))))
with check (((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid()))))));


create policy "Users can delete their own order items"
on "public"."order_items"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));


create policy "Users can insert their own order items"
on "public"."order_items"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));


create policy "Users can view their own order items"
on "public"."order_items"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));


create policy "temp_allow_all_for_authenticated"
on "public"."order_items"
as permissive
for all
to public
using ((auth.uid() IS NOT NULL))
with check ((auth.uid() IS NOT NULL));


create policy "Allow delete for authenticated"
on "public"."order_totals"
as permissive
for delete
to public
using ((auth.uid() IS NOT NULL));


create policy "Allow insert for authenticated"
on "public"."order_totals"
as permissive
for insert
to public
with check ((auth.uid() IS NOT NULL));


create policy "Allow select for authenticated"
on "public"."order_totals"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "Allow update for authenticated"
on "public"."order_totals"
as permissive
for update
to public
using ((auth.uid() IS NOT NULL))
with check ((auth.uid() IS NOT NULL));


create policy "Admins can delete all orders"
on "public"."orders"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can update all orders"
on "public"."orders"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can view all orders"
on "public"."orders"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Users can create own orders"
on "public"."orders"
as permissive
for insert
to public
with check (((auth.uid() = user_id) AND (auth.uid() IS NOT NULL)));


create policy "Users can create their own orders"
on "public"."orders"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can delete own orders"
on "public"."orders"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can delete their own orders"
on "public"."orders"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can update own orders"
on "public"."orders"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can view own orders"
on "public"."orders"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can view their own orders"
on "public"."orders"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Allow authenticated users to manage pagarme settings"
on "public"."pagarme_settings"
as permissive
for all
to public
using ((auth.role() = 'authenticated'::text));


create policy "Allow read for authenticated users or service role"
on "public"."pagarme_settings"
as permissive
for select
to public
using (((auth.uid() IS NOT NULL) OR (current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text)));


create policy "Admins can delete pages"
on "public"."pages"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can insert pages"
on "public"."pages"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can read pages"
on "public"."pages"
as permissive
for select
to authenticated
using (((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))) OR ((EXISTS ( SELECT 1
   FROM platform_users
  WHERE (platform_users.id = auth.uid()))) AND (status = 'published'::text) AND ((visible_to = 'all'::text) OR (visible_to = ( SELECT platform_users.role
   FROM platform_users
  WHERE (platform_users.id = auth.uid())))))));


create policy "Admins can update pages"
on "public"."pages"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can manage payment settings"
on "public"."payment_settings"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Authenticated users can read payment settings"
on "public"."payment_settings"
as permissive
for select
to authenticated
using (true);


create policy "Admins can manage all payments"
on "public"."payments"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Users can view their own payments"
on "public"."payments"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Admins can read permissions"
on "public"."permissions"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can view platform users"
on "public"."platform_users"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Allow anonymous user creation"
on "public"."platform_users"
as permissive
for insert
to public
with check (true);


create policy "Public can verify user emails"
on "public"."platform_users"
as permissive
for select
to public
using (true);


create policy "Users can read their own data"
on "public"."platform_users"
as permissive
for select
to authenticated
using ((auth.uid() = id));


create policy "Users can update their own data"
on "public"."platform_users"
as permissive
for update
to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));


create policy "Admins can delete promotion sites"
on "public"."promotion_sites"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM (admins a
     JOIN roles r ON ((a.role_id = r.id)))
  WHERE ((a.id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Admins can read promotion sites"
on "public"."promotion_sites"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM (admins a
     JOIN roles r ON ((a.role_id = r.id)))
  WHERE ((a.id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Admins can update promotion sites"
on "public"."promotion_sites"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM (admins a
     JOIN roles r ON ((a.role_id = r.id)))
  WHERE ((a.id = auth.uid()) AND (r.name = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM (admins a
     JOIN roles r ON ((a.role_id = r.id)))
  WHERE ((a.id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Platform users can delete promotion sites"
on "public"."promotion_sites"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM platform_users
  WHERE (platform_users.id = auth.uid()))));


create policy "Platform users can insert promotion sites"
on "public"."promotion_sites"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM platform_users
  WHERE (platform_users.id = auth.uid()))));


create policy "Platform users can read promotion sites"
on "public"."promotion_sites"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM platform_users
  WHERE (platform_users.id = auth.uid()))));


create policy "Platform users can update promotion sites"
on "public"."promotion_sites"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM platform_users
  WHERE (platform_users.id = auth.uid()))))
with check ((EXISTS ( SELECT 1
   FROM platform_users
  WHERE (platform_users.id = auth.uid()))));


create policy "Test insert promotion sites"
on "public"."promotion_sites"
as permissive
for insert
to authenticated
with check (true);


create policy "Permitir delete para autenticados"
on "public"."publisher_services"
as permissive
for delete
to public
using ((auth.uid() IS NOT NULL));


create policy "Permitir insert para autenticados"
on "public"."publisher_services"
as permissive
for insert
to public
with check ((auth.uid() IS NOT NULL));


create policy "Permitir select para autenticados"
on "public"."publisher_services"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "Permitir update para autenticados"
on "public"."publisher_services"
as permissive
for update
to public
using ((auth.uid() IS NOT NULL))
with check ((auth.uid() IS NOT NULL));


create policy "Admins can read role_permissions"
on "public"."role_permissions"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can read roles"
on "public"."roles"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Allow anonymous read access to roles"
on "public"."roles"
as permissive
for select
to public
using (true);


create policy "Permitir delete para autenticados"
on "public"."service_cards"
as permissive
for delete
to public
using ((auth.uid() IS NOT NULL));


create policy "Permitir insert para autenticados"
on "public"."service_cards"
as permissive
for insert
to public
with check ((auth.uid() IS NOT NULL));


create policy "Permitir select para autenticados"
on "public"."service_cards"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "Permitir update para autenticados"
on "public"."service_cards"
as permissive
for update
to public
using ((auth.uid() IS NOT NULL))
with check ((auth.uid() IS NOT NULL));


create policy "Admins can delete services"
on "public"."services"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can insert services"
on "public"."services"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can read services"
on "public"."services"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can update services"
on "public"."services"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Admins can update settings"
on "public"."settings"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))))
with check ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))));


create policy "Anyone can read settings"
on "public"."settings"
as permissive
for select
to public
using (true);


create policy "Users can delete their own cart items"
on "public"."shopping_cart_items"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can insert their own cart items"
on "public"."shopping_cart_items"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can update their own cart items"
on "public"."shopping_cart_items"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));


create policy "Users can view their own cart items"
on "public"."shopping_cart_items"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Users can delete their own favorites"
on "public"."user_favorites"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can insert their own favorites"
on "public"."user_favorites"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can view their own favorites"
on "public"."user_favorites"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "No delete on user_stats"
on "public"."user_stats"
as permissive
for delete
to public
using (false);


create policy "No insert on user_stats"
on "public"."user_stats"
as permissive
for insert
to public
with check (false);


create policy "No update on user_stats"
on "public"."user_stats"
as permissive
for update
to public
using (false)
with check (false);


create policy "Todos autenticados podem ver user_stats"
on "public"."user_stats"
as permissive
for select
to authenticated
using (true);


CREATE TRIGGER admins_set_role BEFORE INSERT ON public.admins FOR EACH ROW EXECUTE FUNCTION set_admin_role();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER best_selling_sites_updated_at BEFORE UPDATE ON public.best_selling_sites FOR EACH ROW EXECUTE FUNCTION update_best_selling_sites_updated_at();

CREATE TRIGGER update_company_data_updated_at BEFORE UPDATE ON public.company_data FOR EACH ROW EXECUTE FUNCTION update_company_data_updated_at();

CREATE TRIGGER contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION update_contracts_updated_at();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION update_email_templates_updated_at();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON public.feedback_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_set_updated_at BEFORE UPDATE ON public.form_entries FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER auto_populate_promotion_sites AFTER INSERT OR UPDATE ON public.form_entry_values FOR EACH ROW EXECUTE FUNCTION populate_promotion_sites();

CREATE TRIGGER form_entry_values_updated_at BEFORE UPDATE ON public.form_entry_values FOR EACH ROW EXECUTE FUNCTION update_form_entry_values_updated_at();

CREATE TRIGGER populate_promotion_sites_on_insert AFTER INSERT ON public.form_entry_values FOR EACH ROW EXECUTE FUNCTION populate_promotion_sites_trigger();

CREATE TRIGGER populate_promotion_sites_on_update AFTER UPDATE ON public.form_entry_values FOR EACH ROW EXECUTE FUNCTION populate_promotion_sites_trigger();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.form_field_niche FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_field_settings_updated_at BEFORE UPDATE ON public.form_field_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_fields_updated_at BEFORE UPDATE ON public.form_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON public.forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_chat_updated_at_trigger BEFORE UPDATE ON public.order_chat FOR EACH ROW EXECUTE FUNCTION update_order_chat_updated_at();

CREATE TRIGGER trigger_auto_populate_best_selling_sites AFTER INSERT ON public.order_items FOR EACH ROW EXECUTE FUNCTION auto_populate_best_selling_sites();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.order_totals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_set_aprovment_payment BEFORE UPDATE OF payment_status ON public.orders FOR EACH ROW EXECUTE FUNCTION set_aprovment_payment();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at();

CREATE TRIGGER update_pagarme_settings_updated_at BEFORE UPDATE ON public.pagarme_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_settings_updated_at BEFORE UPDATE ON public.payment_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_users_updated_at BEFORE UPDATE ON public.platform_users FOR EACH ROW EXECUTE FUNCTION update_platform_users_updated_at();

CREATE TRIGGER promotion_sites_updated_at BEFORE UPDATE ON public.promotion_sites FOR EACH ROW EXECUTE FUNCTION update_promotion_sites_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.publisher_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_set_current_id BEFORE INSERT ON public.publisher_services FOR EACH ROW EXECUTE FUNCTION set_current_id();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_updated_at BEFORE UPDATE ON public.service_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at();

CREATE TRIGGER update_shopping_cart_items_updated_at BEFORE UPDATE ON public.shopping_cart_items FOR EACH ROW EXECUTE FUNCTION update_shopping_cart_items_updated_at();



