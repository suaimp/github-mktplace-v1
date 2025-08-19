alter table "public"."order_chat" drop constraint "order_chat_sender_type_check";

alter table "public"."order_chat" add constraint "order_chat_sender_type_check" CHECK (((sender_type)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[]))) not valid;

alter table "public"."order_chat" validate constraint "order_chat_sender_type_check";


