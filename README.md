# 🛒 GitHub Marketplace v1

> 🌐 **Produção:** [https://cp.suaimprensa.com.br/](https://cp.suaimprensa.com.br/)

Um marketplace completo e moderno para compra e venda de artigos digitais, desenvolvido com React, TypeScript, Supabase e Tailwind CSS. O sistema oferece uma experiência completa de e-commerce com carrinho de compras, checkout integrado, sistema de pedidos e painel administrativo. 

**🔄 Sistema de Comunicação:** O sistema também conta com um fluxo completo de envio de artigo, onde acontece a fase de comunicação e troca de arquivos entre comprador e publicador do artigo, contando com um chat desenvolvido do zero utilizando protocolo WebSocket para comunicação em tempo real.



## 🚀 Tecnologias Principais

- **Frontend:** React 18 + TypeScript + Vite
- **UI/Styling:** Tailwind CSS + HeadlessUI
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Autenticação:** Supabase Auth
- **Pagamentos:** Pagar.me Integration
- **Deploy:** Netlify
- **Testes:** Jest + React Testing Library

## 📋 Funcionalidades

### 🛍️ Marketplace
- **Tabela dinâmica** com dados do Supabase
- **Sistema de filtros** avançados (país, categoria, preço, etc.)
- **Ordenação** por múltiplos campos
- **Paginação** otimizada
- **Busca em tempo real**
- **Seleção em massa** de itens
- **Sistema de favoritos**
- **Tooltips informativos** com posicionamento inteligente

### 🛒 Carrinho & Checkout
- **Carrinho persistente** com Context API
- **Resumo de pedido** com cálculos automáticos
- **Múltiplas formas de pagamento** (PIX, Cartão)
- **Validação de formulários** com feedback visual
- **Processamento seguro** via Edge Functions

### 📦 Sistema de Pedidos
- **Gestão completa** de pedidos
- **Status tracking** em tempo real
- **Histórico de transações**
- **Notificações automáticas**
- **Painéis de administração**

### ⚙️ Configurações & Admin
- **Painel de configurações** modular
- **Sistema de modos** (Teste/Manutenção)
- **Configuração de headers/footers** personalizados
- **Gerenciamento de usuários**
- **Analytics e relatórios**

## 🏗️ Arquitetura

### 📁 Estrutura do Projeto
```
src/
├── components/           # Componentes reutilizáveis
│   ├── marketplace/     # Sistema do marketplace
│   │   ├── filters/     # Filtros modulares
│   │   ├── sorting/     # Sistema de ordenação
│   │   ├── selection/   # Seleção de itens
│   │   ├── navigation/  # Navegação por abas
│   │   └── Tooltip/     # Sistema de tooltips
│   ├── Checkout/        # Fluxo de checkout
│   └── ui/             # Componentes base
├── pages/              # Páginas da aplicação
│   ├── auth/           # Autenticação
│   ├── Orders/         # Gestão de pedidos
│   └── Settings/       # Configurações
├── services/           # Serviços de dados
│   └── db-services/    # Integração Supabase
├── hooks/              # Hooks customizados
├── utils/              # Utilitários
└── lib/                # Configurações
```

### 🎯 Princípios SOLID
O projeto segue rigorosamente os princípios SOLID:

- **Single Responsibility:** Cada componente tem uma responsabilidade específica
- **Open/Closed:** Extensível sem modificar código existente
- **Liskov Substitution:** Interfaces consistentes e substituíveis
- **Interface Segregation:** Interfaces específicas e enxutas
- **Dependency Inversion:** Dependências baseadas em abstrações

### 🔄 Padrões de Design
- **Custom Hooks** para lógica de negócio
- **Context API** para estado global
- **Service Layer** para comunicação com APIs
- **Component Composition** para reutilização
- **Error Boundaries** para tratamento de erros

## 🛠️ Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev              # Servidor de desenvolvimento
npm run dev:local        # Desenvolvimento com Supabase local
npm run dev:prod         # Desenvolvimento com produção
```

### Build & Deploy
```bash
npm run build           # Build para produção
npm run preview         # Preview do build
npm run deploy          # Deploy via GitHub Pages
```

### Testes
```bash
npm test               # Executar todos os testes
npm run test:watch     # Modo watch
npm run test:coverage  # Relatório de cobertura
```

### Supabase
```bash
npm run supabase:start  # Iniciar Supabase local
npm run supabase:reset  # Reset do banco local
npm run supabase:sync   # Sincronizar com produção
```

## 🔧 Configuração

### 1. Clonar e Instalar
```bash
git clone https://github.com/suaimp/github-mktplace-v1.git
cd github-mktplace-v1
npm install
```

### 2. Variáveis de Ambiente
```bash
# .env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_FUNCTIONS_URL=your_functions_url
```

### 3. Configuração do Banco
```bash
# Inicializar Supabase
npm run supabase:start

# Aplicar migrações
npm run supabase:reset
```

### 4. Executar Projeto
```bash
npm run dev
```

## 🌟 Funcionalidades Avançadas

### 🎛️ Sistema de Filtros
- **Filtros por botões** para seleção rápida
- **Filtros básicos** com dropdown
- **Combinação de filtros** para busca precisa
- **Cache inteligente** para performance

### 📊 Métricas e APIs
- **Integração com Moz** para DA (Domain Authority)
- **Dados de tráfego** via APIs externas
- **Badges de status** em tempo real
- **Caching otimizado** para APIs

### 🎨 UI/UX
- **Dark mode** completo
- **Responsivo** para todos os dispositivos
- **Animações fluidas** com Tailwind
- **Loading states** e skeletons
- **Feedback visual** em todas as interações

### 🔒 Segurança
- **Autenticação JWT** via Supabase
- **Row Level Security** no banco
- **Validação** client-side e server-side
- **Rate limiting** nas APIs
- **Sanitização** de dados

## 🧪 Testes

O projeto possui uma suíte completa de testes:

- **Unit Tests** para componentes isolados
- **Integration Tests** para fluxos completos
- **Service Tests** para camada de dados
- **Hook Tests** para lógica customizada

### Executar Testes Específicos
```bash
npm run test:checkout        # Testes do checkout
npm run test:notifications   # Sistema de notificações
npm run test:services        # Serviços de dados
npm run test:header-footer   # Configurações
```

## 📚 Documentação Detalhada

Cada módulo principal possui documentação específica:

- [Sistema de Modos](./MARKETPLACE_MODES_README.md)
- [Filtros do Marketplace](./src/components/marketplace/filters/README.md)
- [Sistema de Ordenação](./src/components/marketplace/sorting/README.md)
- [Sistema de Seleção](./src/components/marketplace/selection/README.md)
- [Navegação por Abas](./src/components/marketplace/navigation/README.md)
- [Sistema de Tooltips](./src/components/marketplace/Tooltip/README.md)

## 🚀 Deploy

### Netlify
1. Configure as variáveis de ambiente no painel Netlify
2. Build automático via GitHub integration
3. Deploy contínuo na branch `main`

### Variáveis Netlify
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_FUNCTIONS_URL=your_functions_url
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE.md) para detalhes.

## 👥 Equipe

- **Desenvolvimento:** Equipe SUA Imprensa
- **Design:** Interface moderna e responsiva
- **Backend:** Arquitetura serverless com Supabase

---

<div align="center">
  <strong>🌟 Marketplace moderno, escalável e performático 🌟</strong><br>
  Desenvolvido com as melhores práticas e tecnologias atuais
</div>