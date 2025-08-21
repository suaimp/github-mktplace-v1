# Sistema de Notificações de Pedidos

## Resumo
Sistema implementado para envio automático de emails em diferentes etapas do processo de pedidos na rota `/orders/:id`.

## Funcionalidades Implementadas

### 📝 Nova Pauta Enviada
- **Quando**: Ao criar uma nova pauta através do PautaService
- **Destinatários**: Cliente + Admin (contato@suaimprensa.com.br)
- **Conteúdo**: Dados da pauta (palavra-chave, URL, texto âncora, requisitos especiais)

### 📄 Novo Artigo Enviado
- **Quando**: 
  - Upload de arquivo (document_path)
  - Envio de link (article_doc)
- **Destinatários**: Cliente + Admin (contato@suaimprensa.com.br)
- **Conteúdo**: 
  - Para upload: Nome do arquivo + botão de download
  - Para link: URL do artigo enviado

### 🚀 Artigo Publicado
- **Quando**: Atualização da URL final do artigo (article_url)
- **Destinatários**: Cliente + Admin (contato@suaimprensa.com.br)
- **Conteúdo**: Link do artigo publicado + botão para visualizar

### 💬 Nova Mensagem de Chat (NOVO!)
- **Quando**: Envio de mensagem no chat do pedido
- **Destinatários**: 
  - Cliente envia mensagem → Admin recebe email
  - Admin envia mensagem → Cliente recebe email
- **Conteúdo**: 
  - Texto da mensagem completa
  - Dados do remetente (nome e tipo)
  - Link direto para o chat do pedido
  - Badge visual identificando origem (Cliente/Suporte)

## Estrutura dos Arquivos

### Core Services
- `src/db-service/order-notifications/OrderNotificationService.ts` - Serviço principal
- `src/db-service/order-notifications/templates.ts` - Templates de email HTML
- `src/db-service/order-notifications/types.ts` - Tipos TypeScript
- `src/db-service/order-notifications/config.ts` - Configurações

### Edge Function
- `supabase/functions/send-order-notification-email/index.ts` - Função para envio via Resend

### Integrações
- `PautaService.createPauta()` - Envia notificação ao criar pauta
- `OrderItemService.uploadArticleDocument()` - Envia notificação ao fazer upload
- `OrderItemService.updateOrderItem()` - Envia notificação ao atualizar artigos
- `OrderChatService.createMessage()` - Envia notificação de nova mensagem (NOVO!)

## Como Funciona

1. **Trigger Automático**: Cada ação específica dispara uma notificação
2. **Coleta de Dados**: Sistema busca dados do pedido, usuário e item
3. **Geração de Template**: Template HTML específico é gerado com dados
4. **Envio de Email**: Função Edge envia email via Resend API
5. **Log de Erros**: Falhas são logadas, mas não impedem a operação principal

## Templates de Email

### Template de Pauta
- Header azul (#465fff)
- Dados da pauta organizados em boxes
- Informações do pedido e usuário
- **Link direto para plataforma**: https://cp.suaimprensa.com.br/

### Template de Artigo
- Header verde (#28a745)
- Diferenciação entre upload e link
- Botões de ação quando aplicável
- **Link direto para plataforma**: https://cp.suaimprensa.com.br/

### Template de Publicação
- Header azul-água (#17a2b8)
- Badge de sucesso
- Link clicável para o artigo
- **Link direto para plataforma**: https://cp.suaimprensa.com.br/

**Nota**: Todos os emails incluem um botão "🌐 Acessar Plataforma Sua Imprensa" que direciona para https://cp.suaimprensa.com.br/

## Configuração

### Variáveis de Ambiente (Supabase)
```
RESEND_API_KEY=sua_chave_resend
```

### Emails Configurados
- **Admin**: contato@suaimprensa.com.br
- **From**: noreply@cp.suaimprensa.com.br
- **Nome**: Marketplace Sua Imprensa

## Status do Deploy

- ✅ Função Edge deployada e atualizada
- ✅ Integrações implementadas
- ✅ Templates criados com links para plataforma
- ✅ Tipos definidos
- ✅ Build passando
- ✅ Links diretos para https://cp.suaimprensa.com.br/ adicionados

## Como Testar

1. **Criar Pauta**: Acesse um pedido e envie uma pauta
2. **Upload Artigo**: Faça upload de um documento
3. **Enviar Link**: Envie um link de artigo
4. **Publicar Artigo**: Defina a URL final do artigo

Cada ação deve gerar emails automáticos para cliente e admin.

## Logs e Debug

Os logs podem ser visualizados em:
- Console do navegador (frontend)
- Dashboard do Supabase > Functions (backend)
- Resend Dashboard (entrega de emails)

## Responsabilidade Única

O sistema foi desenvolvido seguindo o princípio de responsabilidade única:
- **OrderNotificationService**: Orquestra envios
- **EmailTemplateService**: Gera templates
- **Edge Function**: Entrega emails
- **Integrações**: Pontos de trigger específicos
