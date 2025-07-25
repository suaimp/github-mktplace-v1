import { supabase } from "../../../lib/supabase";
import { FormEntryValue, UpsertFormEntryValue } from "../types/entryTypes";

/**
 * Service responsible for form_entry_values database operations
 * Implements UPSERT strategy to prevent duplicates when multiple admins edit the same entry
 */
export class FormEntryValuesService {
  /**
   * Updates or inserts form entry values using UPSERT strategy
   * This prevents the duplication problem when multiple admins edit the same entry
   * 
   * @param entryId - The entry ID to update values for
   * @param values - Array of form entry values to upsert
   * @returns Promise with success/error result
   */
  static async upsertFormEntryValues(
    entryId: string, 
    values: FormEntryValue[]
  ): Promise<{ success: boolean; error?: any }> {
    try {
      // Prepare data for upsert with entry_id
      const upsertValues: UpsertFormEntryValue[] = values.map(value => ({
        entry_id: entryId,
        field_id: value.field_id,
        value: value.value,
        value_json: value.value_json
      }));

      // Use UPSERT with composite key (entry_id, field_id)
      // This ensures each field per entry is unique and prevents duplicates
      const { error: upsertError } = await supabase
        .from("form_entry_values")
        .upsert(upsertValues, {
          onConflict: 'entry_id,field_id', // Composite unique constraint
          ignoreDuplicates: false          // Update existing records
        });

      if (upsertError) {
        console.error("FormEntryValuesService - Upsert error:", upsertError);
        return { success: false, error: upsertError };
      }

      return { success: true };
    } catch (error) {
      console.error("FormEntryValuesService - Unexpected error:", error);
      return { success: false, error };
    }
  }

  /**
   * Legacy method - DELETE + INSERT (deprecated due to duplication issues)
   * This method is kept for reference but should not be used
   * 
   * @deprecated Use upsertFormEntryValues instead
   */
  static async deleteAndInsertFormEntryValues(
    entryId: string, 
    values: FormEntryValue[]
  ): Promise<{ success: boolean; error?: any }> {
    try {
      // Delete existing values - PROBLEMATIC with concurrent edits
      const { error: deleteError } = await supabase
        .from("form_entry_values")
        .delete()
        .eq("entry_id", entryId);

      if (deleteError) {
        return { success: false, error: deleteError };
      }

      // Insert new values - Creates duplicates with concurrent edits
      const { error: insertError } = await supabase
        .from("form_entry_values")
        .insert(values);

      if (insertError) {
        return { success: false, error: insertError };
      }

      return { success: true };
    } catch (error) {
      console.error("FormEntryValuesService - Legacy method error:", error);
      return { success: false, error };
    }
  }

  /**
   * Gets existing form entry values for an entry
   * Useful for debugging or validation purposes
   */
  static async getFormEntryValues(entryId: string) {
    try {
      const { data, error } = await supabase
        .from("form_entry_values")
        .select("*")
        .eq("entry_id", entryId)
        .order("field_id");

      if (error) {
        console.error("FormEntryValuesService - Get values error:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("FormEntryValuesService - Unexpected get error:", error);
      return { data: null, error };
    }
  }

  /**
   * Validates form entry values before upsert
   * Ensures data integrity and proper field mapping
   */
  static validateFormEntryValues(values: FormEntryValue[]): { 
    isValid: boolean; 
    errors: string[] 
  } {
    const errors: string[] = [];

    for (const value of values) {
      if (!value.entry_id) {
        errors.push("entry_id is required for all values");
      }
      
      if (!value.field_id) {
        errors.push("field_id is required for all values");
      }

      // Permitir campos vazios (ambos null) para campos opcionais
      // Apenas exigir pelo menos um valor se for um campo que realmente deveria ter dados
      if (value.value === null && value.value_json === null) {
        // Para campos vazios, apenas log de informação, sem erro
        console.log(`ℹ️ [FormEntryValuesService] Campo ${value.field_id} vazio (value=null, value_json=null)`);
      }

      if (value.value !== null && value.value_json !== null) {
        errors.push(`Only one of value or value_json should be provided for field ${value.field_id}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
