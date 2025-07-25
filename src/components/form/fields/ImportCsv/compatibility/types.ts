/**
 * Tipos para o sistema de compatibilidade entre CSV Import e EntriesEditModal
 */

export interface FormEntryComparisonResult {
  isComplete: boolean;
  missingFields: string[];
  incompatibleValues: string[];
  recommendations: string[];
}

export interface EntryCompatibilityFix {
  entryId: string;
  fieldsToAdd: Array<{
    fieldId: string;
    value: string | null;
    valueJson: any;
  }>;
  fieldsToUpdate: Array<{
    fieldId: string;
    currentValue: any;
    newValue: any;
    reason: string;
  }>;
}

export interface CompatibilityReport {
  totalEntries: number;
  compatibleEntries: number;
  incompatibleEntries: number;
  fixes: EntryCompatibilityFix[];
  summary: {
    commonMissingFields: string[];
    commonIssues: string[];
  };
}
