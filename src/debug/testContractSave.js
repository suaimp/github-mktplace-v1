/**
 * Script de teste para verificar o funcionamento do save de contratos
 * Execute no console do navegador para diagnosticar o problema
 */

console.log('🧪 [TESTE] Iniciando teste de diagnóstico do save de contratos');

// Teste 1: Verificar se o componente está renderizando
console.log('📋 [TESTE] 1. Verificando se componente EnhancedContractEditor existe na página');
const editorElements = document.querySelectorAll('[data-component="enhanced-contract-editor"]');
console.log('📋 [TESTE] Elementos encontrados:', editorElements.length);

// Teste 2: Verificar botão de salvar
console.log('🔘 [TESTE] 2. Verificando botão "Salvar Contrato"');
const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
  btn.textContent.includes('Salvar Contrato') || btn.textContent.includes('Salvando')
);
console.log('🔘 [TESTE] Botões de salvar encontrados:', saveButtons.length);
saveButtons.forEach((btn, index) => {
  console.log(`🔘 [TESTE] Botão ${index + 1}:`, {
    text: btn.textContent,
    disabled: btn.disabled,
    className: btn.className
  });
});

// Teste 3: Simular clique no botão
if (saveButtons.length > 0) {
  console.log('🖱️ [TESTE] 3. Simulando clique no primeiro botão de salvar');
  console.log('🖱️ [TESTE] ATENÇÃO: Observe o console para logs do componente!');
  
  // Adicionar listener temporário para capturar eventos
  const originalLog = console.log;
  const logs = [];
  console.log = function(...args) {
    logs.push(args.join(' '));
    originalLog.apply(console, args);
  };
  
  // Simular clique
  setTimeout(() => {
    saveButtons[0].click();
    
    // Aguardar um pouco e mostrar logs capturados
    setTimeout(() => {
      console.log = originalLog;
      console.log('📊 [TESTE] Logs capturados após clique:');
      logs.forEach((log, index) => {
        if (log.includes('[EnhancedContractEditor]') || log.includes('[useContracts]') || log.includes('[ContractDbService]')) {
          console.log(`📊 [TESTE] Log ${index + 1}: ${log}`);
        }
      });
    }, 2000);
  }, 1000);
}

// Teste 4: Verificar console para erros
console.log('❌ [TESTE] 4. Verificando erros no console');
console.log('❌ [TESTE] Se houver erros, eles aparecerão acima desta mensagem');

console.log('🧪 [TESTE] Teste de diagnóstico iniciado. Aguarde os resultados...');
