-- Inserir uma notificação de teste
INSERT INTO "public"."notifications" (user_id, type, title, subtitle, content)
VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'chat',
    'Teste de Notificação',
    'Sistema funcionando',
    'Esta é uma notificação de teste para verificar se o sistema está funcionando.'
);
