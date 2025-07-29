/**
 * Hook for form components to emit data sync events
 * Provides form-specific data sync functionality with single responsibility
 */

import { useCallback } from 'react';
import { useDataSync } from './useDataSync';

export function useFormDataSync(formId: string) {
  const dataSync = useDataSync();

  const emitEntrySubmitted = useCallback(async (entryId: string, isUpdate: boolean = false, data?: any) => {
    const eventType = isUpdate ? 'FORM_ENTRY_UPDATED' : 'FORM_ENTRY_CREATED';
    
    if (dataSync.isDebugMode) {
      console.log(
        `📝 [useFormDataSync] Emitting ${eventType} for entry: ${entryId} in form: ${formId}`
      );
    }

    dataSync.emitFormEntryUpdate({
      type: eventType,
      entryId,
      formId,
      data: {
        ...data,
        isFormSubmission: true,
        submissionTimestamp: Date.now()
      }
    });
  }, [dataSync, formId]);

  const emitEntryDeleted = useCallback(async (entryId: string, data?: any) => {
    if (dataSync.isDebugMode) {
      console.log(`🗑️ [useFormDataSync] Emitting deletion for entry: ${entryId} in form: ${formId}`);
    }

    dataSync.emitFormEntryUpdate({
      type: 'FORM_ENTRY_DELETED',
      entryId,
      formId,
      data: {
        ...data,
        isDeletion: true,
        deletionTimestamp: Date.now()
      }
    });
  }, [dataSync, formId]);

  const emitBulkUpdate = useCallback(async (entryIds: string[], data?: any) => {
    if (dataSync.isDebugMode) {
      console.log(
        `📦 [useFormDataSync] Emitting bulk update for ${entryIds.length} entries in form: ${formId}`
      );
    }

    // Emit individual events for each entry
    const promises = entryIds.map(entryId => 
      dataSync.emitFormEntryUpdate({
        type: 'FORM_ENTRY_UPDATED',
        entryId,
        formId,
        data: {
          ...data,
          isBulkUpdate: true,
          bulkUpdateTimestamp: Date.now()
        }
      })
    );

    await Promise.all(promises);
  }, [dataSync, formId]);

  const refreshFormTables = useCallback(async () => {
    if (dataSync.isDebugMode) {
      console.log(`🔄 [useFormDataSync] Refreshing all tables for form: ${formId}`);
    }

    await dataSync.refreshAllTables(formId);
  }, [dataSync, formId]);

  return {
    formId,
    emitEntrySubmitted,
    emitEntryDeleted,
    emitBulkUpdate,
    refreshFormTables,
    isDebugMode: dataSync.isDebugMode
  };
}
