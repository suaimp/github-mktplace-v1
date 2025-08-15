# 🧪 Guia de Teste - Funcionalidade Header & Footer Scripts

## 📋 **Pré-requisitos para Teste**

### 1. Servidor Rodando
- ✅ Servidor dev rodando em: http://localhost:5174/
- ✅ Banco de dados conectado
- ✅ Migração aplicada (colunas header_scripts e footer_scripts criadas)

### 2. Acesso de Administrador
- Você precisa estar logado como **administrador** para acessar as configurações

---

## 🔍 **Roteiro de Teste Completo**

### **Teste 1: Acesso à Nova Aba**
1. Acesse: http://localhost:5174/
2. Faça login como administrador
3. Vá para **Configurações** (Settings)
4. ✅ **Verificar**: Nova aba "Header & Footer" aparece após "Contratos"
5. ✅ **Verificar**: Ao clicar, carrega o formulário com dois campos grandes

### **Teste 2: Interface do Formulário**
1. Clique na aba "Header & Footer"
2. ✅ **Verificar** elementos presentes:
   - Campo "Scripts dentro do <head>"
   - Campo "Scripts antes do </body>"
   - Placeholders com exemplos de código
   - Contador de caracteres (máx: 10.000)
   - Aviso de segurança em amarelo
   - Botão "Salvar Configurações"
   - Botão "Limpar Status"

### **Teste 3: Validação de Formulário**
1. Tente inserir mais de 10.000 caracteres em um campo
2. ✅ **Verificar**: Mensagem de erro aparece
3. Tente inserir scripts maliciosos como:
   ```javascript
   <script>document.write('teste')</script>
   ```
4. ✅ **Verificar**: Validação bloqueia scripts perigosos

### **Teste 4: Salvamento de Dados**
1. Insira um script válido no header (exemplo Google Analytics):
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'GA_TRACKING_ID');
   </script>
   ```
2. Insira um script no footer (exemplo chat widget):
   ```html
   <!-- Chat Widget -->
   <script>
     console.log('Chat widget carregado!');
   </script>
   ```
3. Clique em "Salvar Configurações"
4. ✅ **Verificar**: Mensagem de sucesso aparece
5. ✅ **Verificar**: Recarregue a página e os dados permanecem

### **Teste 5: Injeção Dinâmica de Scripts**
1. Abra as **Ferramentas do Desenvolvedor** (F12)
2. Vá para **Console**
3. Recarregue a página
4. ✅ **Verificar** logs no console:
   - "✅ Scripts de header injetados com sucesso"
   - "✅ Scripts de footer injetados com sucesso"
5. ✅ **Verificar** no HTML:
   - Vá para aba **Elements**
   - Procure por `[data-dynamic-header="true"]` no `<head>`
   - Procure por `[data-dynamic-footer="true"]` no final do `<body>`

### **Teste 6: Persistência no Banco**
1. Abra o console do navegador
2. Execute:
   ```javascript
   // Verificar se scripts estão sendo carregados
   console.log('Header scripts:', document.querySelectorAll('[data-dynamic-header="true"]'));
   console.log('Footer scripts:', document.querySelectorAll('[data-dynamic-footer="true"]'));
   ```
3. ✅ **Verificar**: Scripts aparecem listados

### **Teste 7: Teste Real com Google Analytics**
1. Crie uma conta Google Analytics (ou use uma existente)
2. Obtenha o código de rastreamento
3. Insira no campo "Scripts dentro do <head>"
4. Salve as configurações
5. Navegue pelo site
6. ✅ **Verificar**: No Google Analytics, dados aparecem em tempo real

---

## 🔧 **Testes de Desenvolvimento**

### **Verificar Banco de Dados**
```sql
-- Verificar se as colunas foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'settings' 
AND column_name IN ('header_scripts', 'footer_scripts');

-- Verificar dados salvos
SELECT id, header_scripts, footer_scripts 
FROM settings 
LIMIT 1;
```

### **Verificar Logs no Console**
- Logs de sucesso: ✅ Scripts injetados
- Logs de erro: ❌ Falhas na injeção
- Logs de validação: ⚠️ Scripts bloqueados

### **Verificar Network Tab**
- Requests para salvar: POST /rest/v1/settings
- Status 200: Salvamento bem-sucedido
- Status 4xx/5xx: Erros

---

## 🚨 **Possíveis Problemas e Soluções**

### **Problema**: Aba não aparece
- **Solução**: Verificar se o componente foi importado corretamente no Settings.tsx

### **Problema**: Erro "Cannot read properties of undefined"
- **Solução**: Verificar se o hook useHeaderFooterScripts está carregando dados

### **Problema**: Scripts não injetam no HTML
- **Solução**: Verificar se useScriptInjection está sendo chamado no App.tsx

### **Problema**: Erro de permissão no banco
- **Solução**: Verificar se usuário é administrador

### **Problema**: Scripts são sanitizados demais
- **Solução**: Ajustar validação no HeaderFooterScriptsService

---

## ✅ **Checklist Final**

- [ ] Aba "Header & Footer" visível
- [ ] Formulário carrega/salva corretamente
- [ ] Validação funciona (caracteres/segurança)
- [ ] Scripts injetam no HTML dinamicamente
- [ ] Dados persistem no banco
- [ ] Console mostra logs de sucesso
- [ ] Teste real com Google Analytics funciona
- [ ] Não há erros no console do navegador
- [ ] Interface responsiva (desktop/mobile)

---

## 🎯 **Teste Rápido de 2 Minutos**

1. Acesse http://localhost:5174/settings
2. Clique em "Header & Footer"
3. Cole no header: `<script>console.log('Header OK!');</script>`
4. Cole no footer: `<script>console.log('Footer OK!');</script>`
5. Salve
6. Abra F12 > Console
7. Recarregue a página
8. ✅ Deve ver: "Header OK!" e "Footer OK!" nos logs

**Se isso funcionar, a implementação está 100% operacional!** 🎉
