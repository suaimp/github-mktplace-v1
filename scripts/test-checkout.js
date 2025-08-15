#!/usr/bin/env node

/**
 * Script para executar testes de checkout de forma organizada
 */

const { execSync } = require('child_process');
const path = require('path');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🔄 ${description}`, 'cyan');
  log(`Executando: ${command}`, 'yellow');
  
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    log(`✅ ${description} - Concluído`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - Falhou`, 'red');
    log(`Erro: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🧪 EXECUTANDO TESTES DE CHECKOUT', 'magenta');
  log('=====================================', 'magenta');

  const testSuites = [
    {
      name: 'Testes de Utilidades',
      command: 'npm test -- src/utils/__tests__',
      description: 'Testando funções utilitárias (formatação, validação)'
    },
    {
      name: 'Testes de Serviços',
      command: 'npm test -- src/services/db-services/marketplace-services',
      description: 'Testando serviços de banco de dados'
    },
    {
      name: 'Testes de Hooks',
      command: 'npm test -- src/components/Checkout/hooks/__tests__',
      description: 'Testando hooks customizados do checkout'
    },
    {
      name: 'Testes de Componentes',
      command: 'npm test -- src/components/Checkout/__tests__',
      description: 'Testando componentes React do checkout'
    },
    {
      name: 'Testes da ResumeTable',
      command: 'npm run test:checkout:resume-table',
      description: 'Testando tabela de resumo e seus hooks/serviços'
    },
    {
      name: 'Testes de PIX',
      command: 'npm test -- src/pages/Checkout/Payment/pix',
      description: 'Testando funcionalidades de pagamento PIX'
    },
    {
      name: 'Testes de Integração',
      command: 'npm test -- src/components/Checkout/__tests__/integration',
      description: 'Testando fluxos completos de checkout'
    }
  ];

  let passed = 0;
  let failed = 0;

  // Executar cada suite de testes
  for (const suite of testSuites) {
    log(`\n📋 ${suite.name}`, 'blue');
    log('─'.repeat(50), 'blue');
    
    const success = runCommand(suite.command, suite.description);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  // Relatório final
  log('\n📊 RELATÓRIO FINAL', 'magenta');
  log('==================', 'magenta');
  log(`✅ Suites Aprovadas: ${passed}`, 'green');
  log(`❌ Suites Falharam: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`📈 Taxa de Sucesso: ${((passed / testSuites.length) * 100).toFixed(1)}%`, 
      failed === 0 ? 'green' : 'yellow');

  if (failed === 0) {
    log('\n🎉 TODOS OS TESTES PASSARAM!', 'green');
    log('O sistema de checkout está funcionando corretamente.', 'green');
  } else {
    log('\n⚠️  ALGUNS TESTES FALHARAM', 'yellow');
    log('Verifique os erros acima e corrija antes de fazer deploy.', 'yellow');
  }

  // Gerar relatório de cobertura se todos os testes passaram
  if (failed === 0) {
    log('\n📈 Gerando relatório de cobertura...', 'cyan');
    runCommand('npm run test:coverage', 'Relatório de cobertura');
  }

  process.exit(failed === 0 ? 0 : 1);
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { runCommand, log };
