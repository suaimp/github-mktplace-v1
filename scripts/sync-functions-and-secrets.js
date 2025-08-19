const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração da produção e local
const PRODUCTION_URL = 'https://uxbeaslwirkepnowydfu.supabase.co';
const PRODUCTION_KEY = process.env.SUPABASE_PROD_SERVICE_ROLE_KEY;
const LOCAL_URL = 'http://127.0.0.1:54321';
const LOCAL_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const prodClient = createClient(PRODUCTION_URL, PRODUCTION_KEY);
const localClient = createClient(LOCAL_URL, LOCAL_KEY);

async function downloadAndSyncFunction(functionName) {
    try {
        console.log(`\n📥 Baixando função: ${functionName}`);
        
        // Criar diretório da função se não existir
        const functionDir = path.join(process.cwd(), 'supabase', 'functions', functionName);
        if (!fs.existsSync(functionDir)) {
            fs.mkdirSync(functionDir, { recursive: true });
        }

        // Download via CLI da função de produção
        const { exec } = require('child_process');
        
        return new Promise((resolve, reject) => {
            exec(`supabase functions download ${functionName}`, { cwd: process.cwd() }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Erro ao baixar ${functionName}:`, error.message);
                    reject(error);
                } else {
                    console.log(`✅ Função ${functionName} baixada com sucesso`);
                    resolve(stdout);
                }
            });
        });
    } catch (error) {
        console.error(`❌ Erro na função ${functionName}:`, error.message);
        throw error;
    }
}

async function syncAllFunctions() {
    const functionsInProduction = [
        'smtp-test',
        'test-smtp', 
        'create-payment-intent',
        'stripe-webhook',
        'create-pix-qrcode',
        'send-order-email',
        'delete-user',
        'feedback-email',
        'pagarme-payment',
        'test-auth',
        'pagarme-pix-payment',
        'pagarme-pix-status',
        'test-pix-simple',
        'pagarme-pix-webhook',
        'pagarme-installments',
        'send-order-notification-email'
    ];

    console.log('🔄 Iniciando sincronização de Edge Functions...');

    for (const functionName of functionsInProduction) {
        try {
            await downloadAndSyncFunction(functionName);
        } catch (error) {
            console.error(`❌ Falha ao sincronizar ${functionName}:`, error.message);
        }
    }

    console.log('\n✅ Sincronização de Edge Functions concluída!');
}

async function createLocalSecretsFile() {
    const secrets = {
        'PAGARME': process.env.PAGARME,
        'PAGARME_PUBLIC_KEY': process.env.PAGARME_PUBLIC_KEY,
        'PAGARME_TEST_PUBLIC': process.env.PAGARME_TEST_PUBLIC,
        'PAGARME_TEST_SECRET': process.env.PAGARME_TEST_SECRET,
        'RESEND_API_KEY': process.env.RESEND_API_KEY,
        'STRIPE_WEBHOOK_SECRET': process.env.STRIPE_WEBHOOK_SECRET,
        'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY,
        'SUPABASE_DB_URL': process.env.SUPABASE_DB_URL,
        'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'SUPABASE_URL': process.env.SUPABASE_URL
    };

    console.log('\n🔐 Criando arquivo de secrets local...');

    // Criar arquivo .env para funções
    const functionsEnvPath = path.join(process.cwd(), 'supabase', 'functions', '.env');
    let envContent = '';

    for (const [key, value] of Object.entries(secrets)) {
        if (value) {
            envContent += `${key}=${value}\n`;
            console.log(`✅ Secret adicionada: ${key}`);
        } else {
            console.log(`⚠️ Secret não encontrada: ${key}`);
        }
    }

    fs.writeFileSync(functionsEnvPath, envContent, 'utf8');
    console.log(`✅ Arquivo de secrets criado em: ${functionsEnvPath}`);
}

async function main() {
    try {
        console.log('🚀 Iniciando sincronização completa de Functions e Secrets...');
        
        await syncAllFunctions();
        await createLocalSecretsFile();
        
        console.log('\n🎉 Sincronização completa finalizada!');
        console.log('\n📝 Próximos passos:');
        console.log('1. Execute: supabase stop');
        console.log('2. Execute: supabase start');
        console.log('3. Verifique no Studio: http://127.0.0.1:54323');
        
    } catch (error) {
        console.error('❌ Erro durante a sincronização:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
