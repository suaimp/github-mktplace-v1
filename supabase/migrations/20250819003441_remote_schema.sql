alter table "auth"."users" alter column "email_confirmed_at" set default now();

create policy "Admins podem ver usuários"
on "auth"."users"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM (admins a
     JOIN roles r ON ((a.role_id = r.id)))
  WHERE ((a.id = auth.uid()) AND (r.name = 'admin'::text)))));



create policy "Admins can delete logos"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'logos'::text) AND (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid())))));


create policy "Allow admins full access to article_documents"
on "storage"."objects"
as permissive
for all
to authenticated
using (((bucket_id = 'article_documents'::text) AND (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid())))))
with check (((bucket_id = 'article_documents'::text) AND (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid())))));


create policy "Allow authenticated uploads to article_documents"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'article_documents'::text));


create policy "Allow users to delete own article_documents"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'article_documents'::text) AND (owner = auth.uid())));


create policy "Allow users to read own article_documents"
on "storage"."objects"
as permissive
for select
to authenticated
using (((bucket_id = 'article_documents'::text) AND (owner = auth.uid())));


create policy "Allow users to update own article_documents"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'article_documents'::text) AND (owner = auth.uid())))
with check ((bucket_id = 'article_documents'::text));


create policy "Authenticated users can update logos"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'logos'::text) AND (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid())))));


create policy "Authenticated users can upload logos"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'logos'::text) AND (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid())))));


create policy "Public users can read avatars"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'avatars'::text));


create policy "Public users can read brand logos"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'brand_logos'::text));


create policy "Public users can read logos"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'logos'::text));


create policy "Users can delete avatars"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'avatars'::text) AND ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM platform_users
  WHERE (platform_users.id = auth.uid()))))));


create policy "Users can delete brand logos"
on "storage"."objects"
as permissive
for delete
to authenticated
using ((bucket_id = 'brand_logos'::text));


create policy "Users can read their own article documents"
on "storage"."objects"
as permissive
for select
to authenticated
using (((bucket_id = 'article_documents'::text) AND (((auth.uid())::text = (storage.foldername(name))[1]) OR (EXISTS ( SELECT 1
   FROM (order_items oi
     JOIN orders o ON ((o.id = oi.order_id)))
  WHERE ((oi.article_document_path = objects.name) AND (o.user_id = auth.uid())))))));


create policy "Users can update avatars"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'avatars'::text) AND ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM platform_users
  WHERE (platform_users.id = auth.uid()))))));


create policy "Users can update brand logos"
on "storage"."objects"
as permissive
for update
to authenticated
using ((bucket_id = 'brand_logos'::text));


create policy "Users can upload avatars"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'avatars'::text) AND ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM platform_users
  WHERE (platform_users.id = auth.uid()))))));


create policy "Users can upload brand logos"
on "storage"."objects"
as permissive
for insert
to public
with check ((bucket_id = 'brand_logos'::text));



