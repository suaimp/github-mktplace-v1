import { supabase } from "../../../lib/supabase";
import { FormField } from "../types/entryTypes";

/**
 * Service responsible for form fields operations
 */
export class FormFieldsService {
  /**
   * Loads form fields with their settings for a specific form
   */
  static async loadFormFields(formId: string): Promise<{
    fields: FormField[];
    fieldSettings: Record<string, any>;
    error?: any;
  }> {
    try {
      const { data: fieldsData, error: fieldsError } = await supabase
        .from("form_fields")
        .select(`
          *,
          form_field_settings (*)
        `)
        .eq("form_id", formId)
        .order("position", { ascending: true });

      if (fieldsError) {
        console.error("FormFieldsService - Load fields error:", fieldsError);
        return { fields: [], fieldSettings: {}, error: fieldsError };
      }

      // Create settings map
      const fieldSettings: Record<string, any> = {};
      fieldsData?.forEach((field: any) => {
        if (field.form_field_settings) {
          fieldSettings[field.id] = field.form_field_settings;
        }
      });

      return {
        fields: fieldsData || [],
        fieldSettings,
        error: null
      };
    } catch (error) {
      console.error("FormFieldsService - Unexpected error:", error);
      return { fields: [], fieldSettings: {}, error };
    }
  }

  /**
   * Validates if a field should be visible based on user permissions
   */
  static shouldFieldBeVisible(fieldSettings: any, isAdmin: boolean): boolean {
    // Skip fields with visibility set to 'hidden' unless user is admin
    if (fieldSettings.visibility === "hidden" && !isAdmin) {
      return false;
    }

    // Skip fields with visibility set to 'admin' unless user is admin
    if (fieldSettings.visibility === "admin" && !isAdmin) {
      return false;
    }

    // Skip fields with visibility set to 'marketplace' unless in marketplace context
    if (fieldSettings.visibility === "marketplace" && !isAdmin) {
      return false;
    }

    return true;
  }

  /**
   * Maps API field types to appropriate field components
   */
  static mapFieldType(fieldType: string): string {
    // Map API field types to use ApiField component
    const apiFieldTypes = [
      "moz_da",
      "semrush_as", 
      "ahrefs_dr",
      "ahrefs_traffic",
      "similarweb_traffic",
      "google_traffic"
    ];

    if (apiFieldTypes.includes(fieldType)) {
      return "api";
    }

    // Map specific field types
    const fieldTypeMap: Record<string, string> = {
      "commission": "commission",
      "brazilian_states": "brazilianStates",
      "brand": "brand",
      "button_buy": "buttonBuy",
      "multiselect": "multiSelect",
      "youtube_url": "youtubeUrl",
  "channel_name": "channelName",
  "channel_logo": "channelLogo",
  "subscriber_count": "SubscriberCount",
  "engagement": "Engagement"
    };

    return fieldTypeMap[fieldType] || fieldType;
  }
}
