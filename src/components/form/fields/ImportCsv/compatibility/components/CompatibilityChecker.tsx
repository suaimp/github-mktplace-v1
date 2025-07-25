import { useState, useEffect } from "react";
import { useEntryCompatibility } from "../hooks/useEntryCompatibility";

interface CompatibilityCheckerProps {
  entryIds: string[];
  formId: string;
  onCompatibilityFixed?: () => void;
}

export default function CompatibilityChecker({
  entryIds,
  formId,
  onCompatibilityFixed
}: CompatibilityCheckerProps) {
  const {
    loading,
    error,
    analysisResults,
    analyzeBatch,
    fixBatch,
    clearError
  } = useEntryCompatibility();

  const [showDetails, setShowDetails] = useState(false);
  const [fixing, setFixing] = useState(false);

  useEffect(() => {
    if (entryIds.length > 0 && formId) {
      analyzeBatch(entryIds, formId);
    }
  }, [entryIds, formId]);

  const handleFixAll = async () => {
    setFixing(true);
    try {
      const incompatibleEntries = analysisResults
        .map((result, index) => ({ result, entryId: entryIds[index] }))
        .filter(({ result }) => !result.isComplete)
        .map(({ entryId }) => entryId);

      if (incompatibleEntries.length > 0) {
        const result = await fixBatch(incompatibleEntries, formId);
        console.log(`✅ Correção concluída: ${result.success} sucessos, ${result.failed} falhas`);
        
        if (onCompatibilityFixed) {
          onCompatibilityFixed();
        }
        
        // Re-analisar após correção
        await analyzeBatch(entryIds, formId);
      }
    } catch (err) {
      console.error("Erro ao corrigir entradas:", err);
    } finally {
      setFixing(false);
    }
  };

  const incompatibleCount = analysisResults.filter(r => !r.isComplete).length;
  const compatibleCount = analysisResults.filter(r => r.isComplete).length;

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-800">Analisando compatibilidade dos registros...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-red-800">Erro na análise: {error}</span>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (analysisResults.length === 0) {
    return null;
  }

  const allCompatible = incompatibleCount === 0;

  return (
    <div className={`border rounded-lg p-4 ${
      allCompatible 
        ? 'bg-green-50 border-green-200' 
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-medium ${
          allCompatible ? 'text-green-800' : 'text-yellow-800'
        }`}>
          {allCompatible ? '✅ Todos os registros são compatíveis' : '⚠️ Problemas de compatibilidade detectados'}
        </h3>
        
        {!allCompatible && (
          <button
            onClick={handleFixAll}
            disabled={fixing}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {fixing ? 'Corrigindo...' : 'Corrigir Todos'}
          </button>
        )}
      </div>

      <div className={`text-sm ${allCompatible ? 'text-green-700' : 'text-yellow-700'}`}>
        <span>✅ {compatibleCount} compatíveis</span>
        {incompatibleCount > 0 && (
          <span className="ml-4">⚠️ {incompatibleCount} precisam de correção</span>
        )}
      </div>

      {!allCompatible && (
        <div className="mt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-2">
              {analysisResults.map((result, index) => (
                !result.isComplete && (
                  <div key={index} className="bg-white border border-yellow-300 rounded p-3 text-sm">
                    <div className="font-medium text-gray-800 mb-1">
                      Registro {index + 1}
                    </div>
                    
                    {result.missingFields.length > 0 && (
                      <div className="text-orange-700 mb-1">
                        <span className="font-medium">Campos faltantes:</span> {result.missingFields.join(', ')}
                      </div>
                    )}
                    
                    {result.incompatibleValues.length > 0 && (
                      <div className="text-red-700 mb-1">
                        <span className="font-medium">Valores incompatíveis:</span>
                        <ul className="list-disc list-inside ml-2">
                          {result.incompatibleValues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.recommendations.length > 0 && (
                      <div className="text-blue-700">
                        <span className="font-medium">Recomendações:</span>
                        <ul className="list-disc list-inside ml-2">
                          {result.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
