import React, { useState } from 'react';
import ImportCsvField from '../src/components/form/fields/ImportCsvField';

// Exemplo de como usar o ImportCsvField corretamente
export default function TestCsvImport() {
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Dados de exemplo dos campos do formulário (devem vir do banco)
  const formFields = [
    { 
      id: 'field-url-123',      // ID real do banco
      key: 'url',               // Chave do campo para mapeamento
      type: 'text',             // Tipo do campo
      label: 'URL do Site'      // Label para exibição
    },
    { 
      id: 'field-da-456', 
      key: 'da', 
      type: 'number', 
      label: 'DA (Domain Authority)' 
    },
    { 
      id: 'field-preco-789', 
      key: 'preco', 
      type: 'price', 
      label: 'Preço' 
    }
  ];

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Teste de Importação CSV</h2>
      
      <ImportCsvField
        field={{}}                    // Campo do formulário (pode ser vazio para teste)
        value={csvFile}               // Arquivo atual
        onChange={setCsvFile}         // Callback quando arquivo muda
        error={undefined}             // Erro atual (se houver)
        formFields={formFields}       // ⭐ IMPORTANTE: Passar os campos do formulário
      />
      
      <div className="mt-4 p-3 bg-gray-100 rounded">
        <h3 className="font-medium">Status:</h3>
        <p>Arquivo: {csvFile ? csvFile.name : 'Nenhum arquivo selecionado'}</p>
        <p>FormFields: {formFields.length} campos configurados</p>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <h3 className="font-medium">Como testar:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Clique no botão "Importar CSV"</li>
          <li>Faça upload de um arquivo CSV com colunas: site_url, domain_authority, price</li>
          <li>Mapeie as colunas nos selects</li>
          <li>Clique em "Salvar mapeamento"</li>
          <li>Verifique o console para logs detalhados</li>
        </ol>
      </div>
    </div>
  );
}

/*
EXEMPLO DE CSV PARA TESTAR:
site_url,domain_authority,price
https://example1.com,45,100
https://example2.com,67,150
https://example3.com,23,80
*/
