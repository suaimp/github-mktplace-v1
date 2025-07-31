# Settings - Carregamento de Metadados do Banco

Esta documentação descreve como os metadados do site são carregados automaticamente do banco de dados, seguindo os princípios de responsabilidade única e estrutura modular.

## 📁 Estrutura Atualizada

```
src/pages/Settings/
├── LogoSettings.tsx              # Componente principal (refatorado)
├── index.ts                      # Exportações centralizadas
├── README.md                     # Documentação principal
├── METADATA_LOADING.md           # Esta documentação específica
├── components/                   # Componentes específicos
│   ├── SiteMetaContainer.tsx     # Container dos metadados
│   └── SiteMetaForm.tsx          # Formulário controlado
├── hooks/                        # Hooks por responsabilidade
│   ├── useSiteMeta.ts           # ✨ Carregamento de metadados
│   ├── useLogoSettings.ts       # ✨ NOVO - Carregamento de logos
│   └── useSettingsToast.ts     # Notificações toast
└── types/                        # Interfaces
    └── index.ts                  

src/services/db-services/settings-services/
├── siteSettingsService.ts        # CRUD de metadados
└── logoService.ts                # ✨ NOVO - CRUD de logos
```

## 🎯 Carregamento Automático Implementado

### ✅ Hook `useSiteMeta` 
**Responsabilidade**: Gerenciar estado e carregamento dos metadados

```tsx
const { metaData, loading, error, success, updateMetaData } = useSiteMeta();

// Carregamento automático no mount:
useEffect(() => {
  loadSiteMetaData(); // Busca do banco automaticamente
}, []);
```

**Fluxo de Carregamento**:
1. **Mount do componente** → `useEffect` dispara
2. **`loadSiteMetaData()`** → chama `SiteSettingsService.getSiteMetaData()`
3. **Service consulta DB** → `settings` table, campos `site_title` e `site_description`
4. **Estado atualizado** → `metaData` recebe valores do banco
5. **Form populado** → inputs mostram dados atuais

### ✅ Hook `useLogoSettings`
**Responsabilidade**: Gerenciar configurações e URLs de logos

```tsx
const { settings, currentLogos, loading, loadSettings } = useLogoSettings();

// Carregamento automático com URLs públicas:
// - Busca settings da tabela
// - Gera URLs públicas do Supabase Storage
// - Atualiza estado com URLs das imagens
```

## 🔧 Service Layer Especializado

### **SiteSettingsService.getSiteMetaData()**
```tsx
static async getSiteMetaData(): Promise<SiteMetaData | null> {
  // 1. Consulta apenas campos necessários
  const { data, error } = await supabase
    .from('settings')
    .select('site_title, site_description')
    .single();

  // 2. Tratamento de casos especiais
  if (error.code === 'PGRST116') {
    // Cria configuração inicial se não existir
    await this.createInitialSettings();
    return defaultValues;
  }

  // 3. Retorna dados com fallbacks
  return {
    site_title: data.site_title || 'Marketplace Platform',
    site_description: data.site_description || 'Descrição padrão'
  };
}
```

### **LogoService** ✨ NOVO
**Responsabilidade**: Upload, validação e gerenciamento de logos

```tsx
// Upload múltiplo com validação
static async uploadMultipleLogos(logoFiles: LogoFile[]): Promise<LogoUploadData>

// Validação de tipos e tamanhos
static validateMultipleLogos(logoFiles: LogoFile[]): string[]

// Atualização no banco
static updateLogosInDatabase(settingsId: string, logoData: LogoUploadData): Promise<void>
```

## 🎨 Interface Atualizada

### **Carregamento Visual**
```tsx
// Estados de loading são tratados automaticamente
{loading && <LoadingSpinner />}

// Dados são populados automaticamente nos inputs
<Input 
  value={metaData.site_title}  // ← Vem do banco automaticamente
  onChange={handleChange}
/>
```

### **Experiência do Usuário**
1. **Página carrega** → Loading aparece brevemente
2. **Dados populam** → Inputs mostram valores do banco
3. **Usuário edita** → Mudanças em tempo real
4. **Salva tudo** → Um clique salva metadados + logos
5. **Toast aparece** → Feedback unificado de sucesso

## 🏗️ Princípios Aplicados

### ✅ **Responsabilidade Única**
- **`useSiteMeta`**: Apenas metadados (título/descrição)
- **`useLogoSettings`**: Apenas configurações de logos
- **`SiteSettingsService`**: Apenas CRUD de metadados
- **`LogoService`**: Apenas operações com logos

### ✅ **Separação de Concerns**
```
┌─ UI Components ────────────────┐
│ ├─ SiteMetaContainer          │
│ └─ SiteMetaForm               │
├─ Business Logic ──────────────┤
│ ├─ useSiteMeta (metadados)    │
│ └─ useLogoSettings (logos)    │
├─ Data Services ───────────────┤
│ ├─ SiteSettingsService        │
│ └─ LogoService                │
└─ Database Layer ──────────────┘
  └─ Supabase (settings table)
```

### ✅ **Modularidade**
- Cada hook pode ser usado independentemente
- Services são reutilizáveis em outros contextos
- Componentes têm interfaces bem definidas

## 🚀 Fluxo Completo

### **Inicialização da Página**
```
1. LogoSettings.tsx monta
2. useLogoSettings → carrega settings + URLs de logos
3. SiteMetaContainer monta  
4. useSiteMeta → carrega metadados do banco
5. SiteMetaForm recebe initialData
6. Inputs populados com dados reais
```

### **Salvamento Unificado**
```
1. Usuário preenche/altera dados
2. Clica "Salvar Todas as Configurações"
3. Metadados → SiteSettingsService.updateSiteMetaData()
4. Logos → LogoService.uploadMultipleLogos() + updateDatabase()
5. Toast de sucesso aparece
6. Dados recarregados para atualizar UI
```

## ✨ Benefícios Alcançados

### 🎯 **Para o Usuário**
- **Dados sempre atualizados**: Carregamento automático do banco
- **Interface responsiva**: Loading states e populações suaves
- **Experiência unificada**: Um botão salva tudo
- **Feedback claro**: Toast profissional

### 🏗️ **Para o Desenvolvimento**
- **Código organizado**: Cada arquivo tem responsabilidade específica
- **Fácil manutenção**: Mudanças isoladas por funcionalidade
- **Testabilidade**: Hooks e services independentes
- **Reutilização**: Components e services modulares

### 🔧 **Para a Arquitetura**
- **Princípios SOLID**: Responsabilidade única rigorosamente aplicada
- **Separation of Concerns**: UI, lógica, dados separados
- **Extensibilidade**: Fácil adicionar novos tipos de configuração

O sistema agora **carrega automaticamente** todos os dados do banco e mantém a interface sempre sincronizada! 🎯
