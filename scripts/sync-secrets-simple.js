import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SECRET_NAMES = [
    'PAGARME',
    'PAGARME_PUBLIC_KEY',
    'PAGARME_TEST_PUBLIC',
    'PAGARME_TEST_SECRET',
    'RESEND_API_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_ANON_KEY',
    'SUPABASE_DB_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_URL'
];

async function getSecretValue(secretName) {
    return new Promise((resolve, reject) => {
        exec(`supabase secrets get ${secretName}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Erro ao obter secret ${secretName}:`, error.message);
                resolve(null);
                return;
            }
            
            const value = stdout.trim();
            resolve(value || null);
        });
    });
}

async function main() {
    try {
        console.log('🔐 Obtendo secrets de produção...');
        
        const secretValues = {};
        
        for (const secretName of SECRET_NAMES) {
            console.log(`🔍 Obtendo valor para: ${secretName}`);
            const value = await getSecretValue(secretName);
            if (value) {
                secretValues[secretName] = value;
                console.log(`✅ Obtido: ${secretName}`);
            } else {
                console.log(`⚠️ Não foi possível obter: ${secretName}`);
            }
        }
        
        // Ler arquivo .env.local atual
        const envPath = path.join(path.dirname(__dirname), '.env.local');
        let currentContent = '';
        
        if (fs.existsSync(envPath)) {
            currentContent = fs.readFileSync(envPath, 'utf8');
        }
        
        // Adicionar secrets ao arquivo
        let newContent = currentContent;
        
        console.log('\n📝 Adicionando secrets ao .env.local...');
        
        for (const [key, value] of Object.entries(secretValues)) {
            const secretLine = `${key}=${value}`;
            
            if (!newContent.includes(`${key}=`)) {
                newContent += `\n${secretLine}`;
                console.log(`✅ Adicionado: ${key}`);
            } else {
                console.log(`⚠️ Já existe: ${key} - substituindo...`);
                // Substituir valor existente
                const regex = new RegExp(`^${key}=.*$`, 'm');
                if (regex.test(newContent)) {
                    newContent = newContent.replace(regex, secretLine);
                    console.log(`✅ Substituído: ${key}`);
                }
            }
        }
        
        // Adicionar secrets específicas para Edge Functions
        const additionalSecrets = {
            'SUPABASE_PROD_SERVICE_ROLE_KEY': secretValues['SUPABASE_SERVICE_ROLE_KEY'] || '',
            'SUPABASE_PROD_URL': secretValues['SUPABASE_URL'] || ''
        };
        
        for (const [key, value] of Object.entries(additionalSecrets)) {
            if (value && !newContent.includes(`${key}=`)) {
                newContent += `\n${key}=${value}`;
                console.log(`✅ Adicionado: ${key}`);
            }
        }
        
        fs.writeFileSync(envPath, newContent, 'utf8');
        console.log(`\n✅ Arquivo .env.local atualizado!`);
        
        // Criar arquivo de secrets para functions
        const functionsEnvPath = path.join(path.dirname(__dirname), 'supabase', 'functions', '.env');
        let functionsEnvContent = '';
        
        for (const [key, value] of Object.entries(secretValues)) {
            functionsEnvContent += `${key}=${value}\n`;
        }
        
        // Criar diretório se não existir
        const functionsDir = path.dirname(functionsEnvPath);
        if (!fs.existsSync(functionsDir)) {
            fs.mkdirSync(functionsDir, { recursive: true });
        }
        
        fs.writeFileSync(functionsEnvPath, functionsEnvContent, 'utf8');
        console.log(`✅ Arquivo de secrets para functions criado: ${functionsEnvPath}`);
        
        console.log('\n🔄 Agora vamos sincronizar as Edge Functions...');
        
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

main();
