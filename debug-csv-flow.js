// Debug do fluxo CSV - executar no console do navegador

// 1. Simular dados CSV processados
const csvData = {
  headers: ['site_url', 'domain_authority', 'price'],
  rows: [
    ['https://example1.com', '45', '100'],
    ['https://example2.com', '67', '150'],
    ['https://example3.com', '23', '80']
  ]
};

// 2. Simular mapping
const mapping = {
  url: 'site_url',
  da: 'domain_authority', 
  preco: 'price'
};

// 3. Simular formFields
const formFields = [
  { id: 'field-1', key: 'url', type: 'text', label: 'URL do Site' },
  { id: 'field-2', key: 'da', type: 'number', label: 'DA' },
  { id: 'field-3', key: 'preco', type: 'price', label: 'Preço' }
];

// 4. Simular useCsvMapping.mapCsvData
function mapCsvData(csvData, mapping) {
  const result = { url: [], da: [], preco: [] };
  
  Object.entries(mapping).forEach(([fieldKey, columnHeader]) => {
    if (!columnHeader) return;
    
    const columnIndex = csvData.headers.indexOf(columnHeader);
    if (columnIndex === -1) return;
    
    const columnValues = csvData.rows.map(row => row[columnIndex] || "");
    result[fieldKey] = columnValues;
  });
  
  return result;
}

// 5. Testar mapeamento
const mappedData = mapCsvData(csvData, mapping);
console.log("🔍 Dados mapeados:", mappedData);

// 6. Simular processamento do CsvImportService
function simulateImportService(csvData, formFields) {
  const fieldMap = new Map();
  formFields.forEach(field => {
    fieldMap.set(field.key, field.id);
  });
  
  console.log("🗺️ Field Map:", Object.fromEntries(fieldMap));
  
  const recordCount = Math.max(
    csvData.url?.length || 0,
    csvData.da?.length || 0,
    csvData.preco?.length || 0
  );
  
  console.log("📊 Record Count:", recordCount);
  
  const formEntryValues = [];
  const entryIds = [];
  
  for (let i = 0; i < recordCount; i++) {
    const entryId = `entry-${i + 1}`;
    entryIds.push(entryId);
    
    // URL
    if (csvData.url && csvData.url[i]) {
      formEntryValues.push({
        entry_id: entryId,
        field_id: fieldMap.get('url'),
        value: csvData.url[i],
        value_json: null
      });
    }
    
    // DA  
    if (csvData.da && csvData.da[i]) {
      formEntryValues.push({
        entry_id: entryId,
        field_id: fieldMap.get('da'),
        value: csvData.da[i],
        value_json: null
      });
    }
    
    // Preço
    if (csvData.preco && csvData.preco[i]) {
      const precoValue = csvData.preco[i];
      formEntryValues.push({
        entry_id: entryId,
        field_id: fieldMap.get('preco'),
        value: null,
        value_json: {
          price: precoValue,
          old_price: precoValue,
          promotional_price: precoValue,
          old_promotional_price: precoValue
        }
      });
    }
  }
  
  return { formEntryValues, entryIds };
}

// 7. Executar simulação
const { formEntryValues, entryIds } = simulateImportService(mappedData, formFields);

console.log("💾 Payload para inserção:", formEntryValues);
console.log("🆔 Entry IDs:", entryIds);

// 8. Verificar se está chamando o Supabase insert
console.log("❓ Deveria chamar:", "supabase.from('form_entry_values').insert(formEntryValues)");
