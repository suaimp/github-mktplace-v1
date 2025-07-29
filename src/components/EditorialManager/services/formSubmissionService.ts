import { supabase } from "../../../lib/supabase";
import { FormField, FormEntryValue } from "../types/entryTypes";
import { FormEntryValuesService } from "./formEntryValuesService";
import { FormValidationService } from "./formValidationService";
import { getCommissionField } from "../../../services/db-services/form-services/formFieldsService";
import { applyCommissionToFormValues } from "../actions/commissionLogic";

/**
 * Service responsible for form submission logic
 * Implements UPSERT strategy to prevent duplicate entries
 */
export class FormSubmissionService {
  /**
   * Submits form entry with UPSERT strategy
   * This prevents the duplication problem when multiple admins edit the same entry
   */
  static async submitFormEntry(params: {
    entry: any;
    status: string;
    note: string;
    formValues: Record<string, any>;
    fields: FormField[];
    fieldSettings: Record<string, any>;
    syncPriceFromValue: (entryId: string) => Promise<void>;
  }): Promise<{ success: boolean; error?: string }> {
    const { 
      entry, 
      status, 
      note, 
      formValues, 
      fields, 
      fieldSettings, 
      syncPriceFromValue 
    } = params;

    try {
      // 1. Get commission field
      const commissionField = await getCommissionField();
      const commissionFieldId = commissionField?.id;

      // 2. Validate all fields
      const validationErrors = FormValidationService.validateAllFields(
        fields, 
        formValues, 
        fieldSettings
      );

      if (FormValidationService.hasValidationErrors(validationErrors)) {
        console.error("❌ [FormSubmissionService] Erros de validação:", validationErrors);
        
        // Criar mensagem de erro mais específica
        const errorMessages = Object.entries(validationErrors).map(([fieldId, error]) => {
          const field = fields.find(f => f.id === fieldId);
          return `${field?.label || fieldId}: ${error}`;
        });
        
        return { 
          success: false, 
          error: `Erros de validação encontrados:\n${errorMessages.join('\n')}` 
        };
      }

      // 3. Update entry status
      const { error: updateError } = await supabase
        .from("form_entries")
        .update({ status })
        .eq("id", entry.id);

      if (updateError) {
        console.error("FormSubmissionService - Status update error:", updateError);
        return { success: false, error: "Failed to update entry status" };
      }

      // 4. Apply commission to form values
      const formValuesWithCommission = applyCommissionToFormValues(
        formValues,
        commissionFieldId || null
      );

      // 5. Prepare values for UPSERT
      const entryValues: FormEntryValue[] = [];

      for (const [fieldId, value] of Object.entries(formValuesWithCommission)) {
        const field = fields.find((f) => f.id === fieldId);
        if (!field) continue;

        // Special handling for niche fields
        if (field.field_type === "niche" && Array.isArray(value)) {
          value.forEach((item) => {
            if (item && typeof item === "object" && item.icon) {
              // Icon preserved in niche item
              console.log("Niche item with icon preserved:", item);
            }
          });
        }

        // Determine if value should be stored in value or value_json
        const isJsonValue = typeof value !== "string";

        entryValues.push({
          entry_id: entry.id,
          field_id: fieldId,
          value: isJsonValue ? null : value,
          value_json: isJsonValue ? value : null
        });
      }

      // 6. Validate entry values
      const validation = FormEntryValuesService.validateFormEntryValues(entryValues);
      if (!validation.isValid) {
        console.error("FormSubmissionService - Validation errors:", validation.errors);
        return { success: false, error: "Invalid form entry values" };
      }

      // 7. UPSERT form entry values (prevents duplicates)
      const upsertResult = await FormEntryValuesService.upsertFormEntryValues(
        entry.id, 
        entryValues
      );

      if (!upsertResult.success) {
        console.error("FormSubmissionService - Upsert error:", upsertResult.error);
        return { success: false, error: "Failed to save form values" };
      }

      // 8. Add note if provided
      if (note.trim()) {
        const noteResult = await this.addEntryNote(entry.id, note.trim());
        if (!noteResult.success) {
          console.warn("FormSubmissionService - Note creation failed:", noteResult.error);
          // Don't fail the entire submission for note errors
        }
      }

      // 9. Sync prices in cart_checkout_resume
      if (entry.entry_id) {
        try {
          await syncPriceFromValue(entry.entry_id);
        } catch (syncError) {
          console.warn("FormSubmissionService - Price sync failed:", syncError);
          // Don't fail the entire submission for sync errors
        }
      }

      console.log(`✅ [FormSubmissionService] Entry submission completed successfully for entry: ${entry.id}`);
      return { success: true };
    } catch (error) {
      console.error("FormSubmissionService - Unexpected error:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  }

  /**
   * Adds a note to the form entry
   */
  private static async addEntryNote(
    entryId: string, 
    note: string
  ): Promise<{ success: boolean; error?: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      const { error: noteError } = await supabase
        .from("form_entry_notes")
        .insert([
          {
            entry_id: entryId,
            note: note,
            created_by: user.id
          }
        ]);

      if (noteError) {
        return { success: false, error: noteError };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
}
