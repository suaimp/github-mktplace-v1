// Teste para verificar se as imagens no storage estão acessíveis
const testStorageUrls = async () => {
  const urls = [
    'http://127.0.0.1:54321/storage/v1/object/public/logos/light-logo-1742053421407.svg',
    'http://127.0.0.1:54321/storage/v1/object/public/logos/dark-logo-1742053421661.svg',
    'http://127.0.0.1:54321/storage/v1/object/public/logos/platform-icon-1742053421911.png'
  ];

  console.log('🔍 Testando URLs do storage...');

  for (const url of urls) {
    try {
      console.log(`\n📍 Testando: ${url}`);
      
      const response = await fetch(url);
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      console.log(`Content-Length: ${response.headers.get('content-length')}`);
      
      if (response.ok) {
        console.log('✅ URL acessível');
      } else {
        console.log('❌ URL não acessível');
      }
      
    } catch (error) {
      console.error(`❌ Erro ao acessar ${url}:`, error);
    }
  }
};

// Execute o teste
testStorageUrls();
