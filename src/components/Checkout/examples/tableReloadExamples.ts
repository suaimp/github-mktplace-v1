/**
 * Exemplo de uso do sistema de recarregamento isolado da tabela
 * Demonstra como usar os novos eventos para controlar recarregamento
 */

export class TableReloadExample {
  /**
   * Exemplo 1: Recarregar tudo (comportamento antigo)
   * Use quando precisar atualizar tanto dados quanto controles
   */
  static reloadEverything() {
    console.log('🔄 Recarregando tabela completa (dados + controles)...');
    window.dispatchEvent(new Event("resume-table-reload"));
  }

  /**
   * Exemplo 2: Recarregar apenas dados da tabela (NOVO)
   * Use quando apenas dados mudaram, mantendo controles intactos
   */
  static reloadTableDataOnly() {
    console.log('🎯 Recarregando apenas dados da tabela...');
    window.dispatchEvent(new Event("resume-table-data-only-reload"));
  }

  /**
   * Exemplo 3: Cenário de pesquisa otimizada
   * Quando dados retornam do banco após busca
   */
  static handleSearchResults() {
    console.log('🔍 Processando resultados da pesquisa...');
    
    // Simula dados retornando do banco
    setTimeout(() => {
      console.log('📥 Dados recebidos do banco de dados');
      
      // ANTES: Recarregava tudo
      // window.dispatchEvent(new Event("resume-table-reload"));
      
      // AGORA: Recarrega apenas a tabela (otimizado)
      this.reloadTableDataOnly();
      
      console.log('✅ Tabela atualizada sem recarregar controles!');
    }, 1000);
  }

  /**
   * Exemplo 4: Cache invalidation
   * Força busca nova do banco invalidando cache
   */
  static forceRefreshFromDatabase() {
    console.log('💾 Invalidando cache e forçando busca do banco...');
    
    // Invalida cache antes de recarregar
    import('../services/ResumeTableCacheService').then(({ default: CacheService }) => {
      const cache = CacheService.getInstance();
      cache.invalidateAllCache();
      
      // Recarrega dados frescos
      this.reloadTableDataOnly();
    });
  }

  /**
   * Exemplo 5: Monitoramento de eventos
   * Como escutar os eventos de recarregamento
   */
  static setupEventListeners() {
    console.log('👂 Configurando listeners de recarregamento...');

    // Listener para recarregamento completo
    window.addEventListener('resume-table-reload', () => {
      console.log('📡 Evento: Recarregamento completo detectado');
    });

    // Listener para recarregamento apenas de dados
    window.addEventListener('resume-table-data-only-reload', () => {
      console.log('📡 Evento: Recarregamento de dados detectado');
    });

    console.log('✅ Listeners configurados!');
  }

  /**
   * Exemplo 6: Demonstração interativa
   * Execute no console para testar
   */
  static runDemo() {
    console.log('🎭 Iniciando demonstração do sistema de recarregamento...\n');

    this.setupEventListeners();

    console.log('1️⃣ Teste 1: Recarregamento completo');
    this.reloadEverything();

    setTimeout(() => {
      console.log('\n2️⃣ Teste 2: Recarregamento apenas de dados');
      this.reloadTableDataOnly();
    }, 2000);

    setTimeout(() => {
      console.log('\n3️⃣ Teste 3: Simulação de pesquisa');
      this.handleSearchResults();
    }, 4000);

    setTimeout(() => {
      console.log('\n4️⃣ Teste 4: Invalidação de cache');
      this.forceRefreshFromDatabase();
    }, 7000);

    console.log('\n🎬 Demonstração iniciada! Acompanhe os logs...');
  }
}

/**
 * Exemplo de integração com componentes React
 */
export const useTableReloadExamples = () => {
  const handleDataUpdate = () => {
    // Quando dados são atualizados via formulário
    console.log('📝 Dados atualizados, recarregando tabela...');
    TableReloadExample.reloadTableDataOnly();
  };

  const handleFilterChange = () => {
    // Quando filtros mudam, pode precisar recarregar controles também
    console.log('🔍 Filtros alterados, recarregamento completo...');
    TableReloadExample.reloadEverything();
  };

  const handleCacheInvalidation = () => {
    // Quando precisa de dados frescos do banco
    console.log('🔄 Invalidando cache...');
    TableReloadExample.forceRefreshFromDatabase();
  };

  return {
    handleDataUpdate,
    handleFilterChange,
    handleCacheInvalidation
  };
};

/**
 * Comparação: Antes vs Depois
 */
export const performanceComparison = {
  antes: {
    description: 'Comportamento anterior',
    recarregamento: 'Tabela + Controles sempre',
    performance: 'Mais lenta',
    eventos: 1,
    granularidade: 'Baixa'
  },
  depois: {
    description: 'Comportamento otimizado',
    recarregamento: 'Seletivo (Tabela OU Completo)',
    performance: 'Mais rápida',
    eventos: 2,
    granularidade: 'Alta'
  }
};

// Para usar no console do navegador:
// import('./tableReloadExamples').then(module => module.TableReloadExample.runDemo())
