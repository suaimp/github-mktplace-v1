/**
 * Arquivo de documentação e teste das funcionalidades implementadas
 * 
 * FUNCIONALIDADES IMPLEMENTADAS:
 * 
 * 1. Componente TabNavigation reutilizável:
 *    - Localização: src/components/tables/TabNavigation/
 *    - Estrutura modular seguindo princípio de responsabilidade única
 *    - Suporte a tema dark/light
 *    - Largura mínima fixa para evitar quebra em telas estreitas
 *    - Logs detalhados para debugging
 *    - Suporte a tabs desabilitadas
 *    - Modo compacto
 *    - Scrolling horizontal automático
 *    - Acessibilidade (ARIA)
 * 
 * 2. Integração com EntriesTable:
 *    - Tabs específicas para filtro por status: "Todos os sites", "Em Análise", "Verificado", "Reprovado"
 *    - Posicionamento ao lado esquerdo do input de pesquisa
 *    - Largura mínima de 120px para os botões
 *    - Callback para filtro por status
 * 
 * 3. Logs implementados:
 *    - Log quando uma tab é alternada
 *    - Log com timestamp
 *    - Log mostrando transição de/para qual tab
 *    - Log de aviso para tabs não encontradas ou desabilitadas
 * 
 * COMO TESTAR:
 * 1. Execute o projeto: npm run dev
 * 2. Navegue até uma página que contenha EntriesTable
 * 3. Clique nas diferentes tabs para ver os logs no console
 * 4. Teste em diferentes tamanhos de tela para verificar responsividade
 * 
 * EXEMPLO DE LOG NO CONSOLE:
 * 🔄 [TabNavigation] Alternando tabs:
 *    De: Todos os sites (todos)
 *    Para: Em Análise (em_analise)
 *    Timestamp: 2025-07-28T...
 */

export const TabNavigationDocumentation = {
  // Documentação apenas - não é código executável
} as const;
