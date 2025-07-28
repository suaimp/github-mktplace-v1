# Instalação de Dependências para Exportação PDF

Para que a funcionalidade de exportação PDF funcione corretamente, é necessário instalar as seguintes dependências:

## Dependências NPM necessárias:

```bash
npm install jspdf jspdf-autotable
npm install --save-dev @types/jspdf
```

## Descrição das dependências:

- `jspdf`: Biblioteca principal para geração de PDFs
- `jspdf-autotable`: Plugin para criação de tabelas no jsPDF
- `@types/jspdf`: Tipos TypeScript para jsPDF (dev dependency)

## Após a instalação:

1. Reinicie o servidor de desenvolvimento
2. A funcionalidade de exportação PDF estará disponível
3. O botão "Exportar" aparecerá ao lado do botão "Importar" na tabela

## Funcionalidades do botão de exportar:

- ✅ Ícone de download (seta para baixo)
- ✅ Mesmo design do botão de importar
- ✅ Gera PDF com dados da tabela atual
- ✅ Inclui campos dinâmicos do formulário
- ✅ Formatação automática baseada no tipo de campo
- ✅ Cabeçalho com título e data
- ✅ Rodapé com total de registros
- ✅ Numeração de páginas
- ✅ Nome de arquivo automático com timestamp

## Estrutura de arquivos criada:

```
src/components/EditorialManager/table/export/
├── components/
│   └── PdfExportButton.tsx
├── hooks/
│   └── usePdfExport.ts
├── services/
│   └── PdfExportService.ts
├── types/
│   └── exportTypes.ts
└── index.ts
```

## Princípios seguidos:

- ✅ Responsabilidade única
- ✅ Estrutura modular
- ✅ Separação de concerns
- ✅ Tipagem TypeScript
- ✅ Reutilização de componentes
