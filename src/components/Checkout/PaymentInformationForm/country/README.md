# Country Select Module

Este módulo fornece um componente de seleção de país com bandeiras para o formulário de informações de pagamento do checkout.

## Estrutura

```
country/
├── CountrySelect.tsx      # Componente principal de seleção
├── types.ts              # Interfaces e tipos TypeScript
├── useCountrySelect.ts   # Hook para gerenciar dados de países
├── utils.tsx             # Utilitários para formatação
├── index.ts              # Exportações do módulo
└── README.md             # Documentação
```

## Componentes

### 1. CountrySelect (Principal)
**Arquivo:** `CountrySelect.tsx`

Componente principal que renderiza um campo de seleção de país com bandeiras.

**Props:**
- `value: string` - Código do país selecionado (ex: "BR")
- `onChange: (value: string) => void` - Callback para mudanças
- `required?: boolean` - Se o campo é obrigatório (padrão: false)
- `disabled?: boolean` - Se o campo está desabilitado (padrão: false)

**Exemplo de uso:**
```tsx
<CountrySelect
  value={selectedCountry}
  onChange={setSelectedCountry}
  required={true}
/>
```

### 2. useCountrySelect (Hook)
**Arquivo:** `useCountrySelect.ts`

Hook para carregar e gerenciar dados de países.

**Retorna:**
- `countries: CountrySelectOption[]` - Lista de países formatados
- `loading: boolean` - Estado de carregamento
- `getCountryByCode: (code: string) => Country | undefined` - Busca país por código

### 3. Utilitários
**Arquivo:** `utils.tsx`

Funções auxiliares para formatação de países:
- `renderCountryFlag()` - Renderiza bandeira do país
- `createCountryOption()` - Cria opção formatada
- `formatCountriesForSelect()` - Formata lista para Select

## Integração

### Com CountriesService
O módulo utiliza o `CountriesService` da pasta `db-services/common/` para obter dados dos países.

### Com PaymentInformationForm
Substituiu o campo de país original por um componente modular com bandeiras.

## Arquitetura

Segue o **Princípio da Responsabilidade Única**:
- **CountrySelect**: Responsável apenas pela renderização
- **useCountrySelect**: Responsável apenas pelo gerenciamento de dados
- **utils**: Responsável apenas pelas formatações
- **types**: Responsável apenas pelas definições de tipos

## Características

✅ **Modular**: Estrutura organizada em módulos específicos  
✅ **Reutilizável**: Pode ser usado em outros formulários  
✅ **Tipado**: Interfaces TypeScript bem definidas  
✅ **Performático**: Hook otimizado para carregamento  
✅ **Acessível**: Suporte a fallback de imagens  
✅ **Consistente**: Segue padrões do projeto  

## Bandeiras

Utiliza o serviço [flagcdn.com](https://flagcdn.com) para as imagens das bandeiras:
- Formato SVG para melhor qualidade
- Fallback caso a imagem não carregue
- Dimensões otimizadas (20x15px)

## Países Suportados

O componente suporta os principais países de:
- América do Sul (Brasil, Argentina, Chile, etc.)
- América do Norte (EUA, Canadá, México)
- Europa (Alemanha, França, Reino Unido, etc.)
- Ásia (China, Japão, Índia, etc.)
- Oceania (Austrália, Nova Zelândia)

## Diferenças da Implementação Anterior

### Antes:
- Mostrava apenas códigos de países (ex: "BR")
- Sem bandeiras
- Código acoplado no componente principal

### Agora:
- Mostra nomes completos dos países (ex: "Brasil")
- Inclui bandeiras para identificação visual
- Estrutura modular e reutilizável
- Melhor experiência do usuário
