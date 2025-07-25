import { useState } from "react";
import { EntryCompatibilityAnalyzer } from "../EntryCompatibilityAnalyzer";
import { EntryCompatibilityFixer } from "../EntryCompatibilityFixer";
import { FormEntryComparisonResult } from "../types";

/**
 * Hook para gerenciar análise e correção de compatibilidade de entries
 */
export function useEntryCompatibility() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<FormEntryComparisonResult[]>([]);

  const analyzeEntry = async (entryId: string, formId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await EntryCompatibilityAnalyzer.analyzeEntry(entryId, formId);
      setAnalysisResults([result]);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzeBatch = async (entryIds: string[], formId: string) => {
    setLoading(true);
    setError(null);

    try {
      const results = await EntryCompatibilityAnalyzer.analyzeBatch(entryIds, formId);
      setAnalysisResults(results);
      return results;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fixEntry = async (entryId: string, formId: string) => {
    setLoading(true);
    setError(null);

    try {
      const success = await EntryCompatibilityFixer.fixEntry(entryId, formId);
      return success;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fixBatch = async (entryIds: string[], formId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await EntryCompatibilityFixer.fixBatch(entryIds, formId);
      return result;
    } catch (err: any) {
      setError(err.message);
      return { success: 0, failed: entryIds.length };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearResults = () => setAnalysisResults([]);

  return {
    loading,
    error,
    analysisResults,
    analyzeEntry,
    analyzeBatch,
    fixEntry,
    fixBatch,
    clearError,
    clearResults
  };
}
