import { FormEntryService } from "./FormEntryService";
import { FormEntryValueService } from "./FormEntryValueService";
import { CsvDataProcessor } from "./CsvDataProcessor";
import { CsvImportRequest, CsvImportResult } from "../types";

/**
 * Orquestrador principal do processo de importação CSV
 * Segue a mesma estratégia do FormRenderer: cria form_entry primeiro, depois form_entry_values
 */
export class CsvImportOrchestrator {
  /**
   * Executa o processo completo de importação CSV
   */
  static async importCsvData(request: CsvImportRequest): Promise<CsvImportResult> {
    try {
      console.log("🚀 [CsvImportOrchestrator] Iniciando importação CSV");
      console.log("📥 [CsvImportOrchestrator] csvData:", request.csvData);
      console.log("📋 [CsvImportOrchestrator] formFields:", request.formFields);

      // 1. Validar se há dados para importar
      const recordCount = Math.max(
        request.csvData.url?.length || 0,
        request.csvData.da?.length || 0,
        request.csvData.preco?.length || 0
      );

      if (recordCount === 0) {
        return { success: false, error: "Nenhum dado para importar" };
      }

      // 2. Processar dados CSV para FormEntryValue (agora inclui TODOS os campos)
      const { entryValues, entryIds } = await CsvDataProcessor.processCSVData(
        request.csvData, 
        request.formId
      );

      // 3. Criar form_entries para cada site importado
      console.log("📝 [CsvImportOrchestrator] Criando form_entries...");
      const createdEntries: string[] = [];
      
      for (const entryId of entryIds) {
        try {
          const entry = await FormEntryService.createFormEntry(request.formId, request.userId);
          createdEntries.push(entry.id);
          
          // Atualizar os entry_values com o ID real do banco
          entryValues.forEach(value => {
            if (value.entry_id === entryId) {
              value.entry_id = entry.id;
            }
          });
        } catch (error) {
          console.error(`❌ [CsvImportOrchestrator] Erro ao criar entry ${entryId}:`, error);
          throw error;
        }
      }

      // 4. Inserir valores dos campos
      console.log("💾 [CsvImportOrchestrator] Inserindo form_entry_values...");
      await FormEntryValueService.insertEntryValues(entryValues);

      console.log("✅ [CsvImportOrchestrator] Importação concluída com sucesso!");
      return {
        success: true,
        entries: createdEntries
      };

    } catch (error: any) {
      console.error("❌ [CsvImportOrchestrator] Erro na importação:", error);
      return { success: false, error: error.message };
    }
  }
}
