import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import FormSkeleton from "./FormSkeleton";
import * as FieldsImport from "./fields";

const Fields = FieldsImport as Record<string, React.ComponentType<any>>;

interface FormRendererProps {
  formId: string;
  isMarketplace?: boolean;
}

export default function FormRenderer({
  formId,
  isMarketplace = false
}: FormRendererProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formDeleted, setFormDeleted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [fieldSettings, setFieldSettings] = useState<Record<string, any>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadForm();
    getCurrentUser();
    checkUserRole();
  }, [formId]);

  async function getCurrentUser() {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        console.log(currentUser);
      }
    } catch (err) {
      console.error("Error getting current user:", err);
    }
  }

  async function checkUserRole() {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: adminData } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      setIsAdmin(!!adminData);
    } catch (err) {
      console.error("Error checking user role:", err);
    }
  }

  async function loadForm() {
    try {
      setLoading(true);
      setError("");

      // Load form data first to get no_data_message
      const { data: formData, error: formError } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .single();

      if (formError) throw formError;

      if (!formData) {
        setFormDeleted(true);
        return;
      }

      setForm(formData);

      // Load form fields with settings
      const { data: fieldsData, error: fieldsError } = await supabase
        .from("form_fields")
        .select(
          `
          *,
          form_field_settings (*)
        `
        )
        .eq("form_id", formId)
        .order("position", { ascending: true });

      if (fieldsError) throw fieldsError;

      // Create settings map
      const settingsMap: Record<string, any> = {};
      fieldsData.forEach((field: any) => {
        if (field.form_field_settings) {
          settingsMap[field.id] = field.form_field_settings;
        }
      });

      setFieldSettings(settingsMap);
      setFields(fieldsData || []);
    } catch (err) {
      console.error("Error loading form:", err);
      setError("Error loading form");
    } finally {
      setLoading(false);
    }
  }

  const validateField = (field: any, value: any): string | null => {
    const settings = fieldSettings[field.id];

    if (
      field.is_required &&
      (value === null || value === undefined || value === "")
    ) {
      return "This field is required";
    }

    if (!value) return null;

    switch (field.field_type) {
      case "email":
        if (!value.includes("@")) {
          return "Please enter a valid email address with @";
        }
        break;

      case "url":
        try {
          new URL(value);
          const validationType = field.validation_rules?.type;
          const pattern = field.validation_rules?.pattern;
          if (validationType === "url" && pattern) {
            if (!new RegExp(pattern).test(value)) {
              return "URL must start with http:// or https://";
            }
          }
        } catch {
          return "Please enter a valid URL";
        }
        break;

      case "multiselect":
      case "checkbox":
        if (
          settings?.max_selections &&
          Array.isArray(value) &&
          value.length > settings.max_selections
        ) {
          return `You can select up to ${settings.max_selections} options`;
        }
        break;

      case "file":
        if (!Array.isArray(value)) return null;

        const maxFiles = settings?.max_files || 1;
        const maxSize = (settings?.max_file_size || 5) * 1024 * 1024;
        const allowedExtensions =
          settings?.allowed_extensions
            ?.split(",")
            .map((ext: string) => ext.trim().toLowerCase()) || [];

        if (value.length > maxFiles) {
          return `You can upload up to ${maxFiles} file${
            maxFiles > 1 ? "s" : ""
          }`;
        }

        for (const file of value) {
          if (file.size > maxSize) {
            return `File size must be less than ${settings?.max_file_size}MB`;
          }

          if (allowedExtensions.length > 0) {
            const extension = file.name.split(".").pop()?.toLowerCase();
            if (extension && !allowedExtensions.includes(extension)) {
              return `Only ${allowedExtensions.join(", ")} files are allowed`;
            }
          }
        }
        break;

      case "commission":
        const commission = parseFloat(value);
        if (isNaN(commission) || commission < 0 || commission > 1000) {
          return "Commission must be between 0 and 1000";
        }
        break;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Clear previous validation errors
      setValidationErrors({});

      // Validate all fields
      const errors: Record<string, string> = {};
      fields.forEach((field) => {
        const error = validateField(field, formData[field.id]);
        if (error) {
          errors[field.id] = error;
        }
      });

      // If there are validation errors, show them and stop submission
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      setLoading(true);
      setError("");
      setSuccess(false);

      // Get user information
      const {
        data: { user }
      } = await supabase.auth.getUser();

      // Create form entry
      const { data: entry, error: entryError } = await supabase
        .from("form_entries")
        .insert([
          {
            form_id: formId,
            ip_address: null,
            user_agent: navigator.userAgent,
            created_by: user?.id || null, // Link the user ID if available
            status: "em_analise" // Ensure status is set
          }
        ])
        .select()
        .single();

      if (entryError) {
        console.error("Entry creation error:", entryError);
        throw new Error("Error creating form entry. Please try again.");
      }

      if (!entry) {
        throw new Error("Failed to create entry. Please try again.");
      }

      // Create entry values
      const values = [];
      for (const [fieldId, value] of Object.entries(formData)) {
        // Determine if value should be stored in value or value_json
        const isJsonValue = typeof value !== "string";

        values.push({
          entry_id: entry.id,
          field_id: fieldId,
          value: isJsonValue ? null : value,
          value_json: isJsonValue ? value : null
        });
      }

      const { error: valuesError } = await supabase
        .from("form_entry_values")
        .insert(values);

      if (valuesError) {
        console.error("Values insertion error:", valuesError);
        throw new Error("Error saving form data. Please try again.");
      }

      setSuccess(true);

      // If redirect page is set, navigate to it
      if (form.redirect_page) {
        navigate(`/pages/${form.redirect_page}`);
      } else {
        // Otherwise clear form data
        setFormData({});
      }
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setError(err.message || "Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: any) => {
    const settings = fieldSettings[field.id];

    // Check if field should be visible only in marketplace
    if (settings?.visibility === "marketplace" && !isMarketplace && !isAdmin) {
      return null;
    }

    // Check if field should be hidden
    if (settings?.visibility === "hidden") {
      return null;
    }

    // Check if field should be admin-only
    if (settings?.visibility === "admin" && !isAdmin) {
      return null;
    }

    const containerClasses = `${
      field.width === "half"
        ? "md:col-span-6"
        : field.width === "third"
        ? "md:col-span-4"
        : field.width === "quarter"
        ? "md:col-span-3"
        : "col-span-12"
    }`;

    // Map field type to component type
    const fieldTypeMapped = mapFieldType(field.field_type);

    const isNiche = fieldTypeMapped === "niche";
    const fieldProps = {
      field,
      settings: isNiche
        ? settings || { value: { niche: "", price: "" }, options: [], multiple: false }
        : settings,
      value: formData[field.id],
      onChange: (value: any) => {
        setFormData({ ...formData, [field.id]: value });
        if (validationErrors[field.id]) {
          setValidationErrors((prev) => {
            const next = { ...prev };
            delete next[field.id];
            return next;
          });
        }
      },
      error: validationErrors[field.id],
      onErrorClear: () => {
        if (validationErrors[field.id]) {
          setValidationErrors((prev) => {
            const next = { ...prev };
            delete next[field.id];
            return next;
          });
        }
      }
    };

    const renderFieldLabel = () => {
      if (field.field_type === "section" || field.field_type === "html") {
        return null;
      }

      // Check if label should be hidden
      if (settings?.label_visibility === "hidden") {
        return null;
      }

      return (
        <>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-400">
            {field.label}
            {field.is_required && (
              <span className="text-error-500 ml-1">*</span>
            )}
          </label>
          {field.description && field.field_type !== "toggle" && (
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              {field.description}
            </p>
          )}
        </>
      );
    };

    const FieldComponent = (Fields as Record<string, React.ComponentType<any>>)[
      `${
        fieldTypeMapped.charAt(0).toUpperCase() + fieldTypeMapped.slice(1)
      }Field`
    ];
    if (!FieldComponent) {
      console.error(
        `No component found for field type: ${field.field_type} (mapped to ${fieldTypeMapped})`
      );
      return null;
    }

    return (
      <div key={field.id} className={containerClasses}>
        {renderFieldLabel()}
        <FieldComponent {...fieldProps} />
      </div>
    );
  };

  // Map API field types to appropriate field components
  const mapFieldType = (fieldType: string): string => {
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

    // Map commission field to use CommissionField component
    if (fieldType === "commission") {
      return "commission";
    }

    // Map brazilian_states field to use BrazilianStatesField component
    if (fieldType === "brazilian_states") {
      return "brazilianStates";
    }

    // Map brand field to use BrandField component
    if (fieldType === "brand") {
      return "brand";
    }

    // Map button_buy field to use ButtonBuyField component
    if (fieldType === "button_buy") {
      return "buttonBuy";
    }

    // Map multiselect field to use MultiSelectField component
    if (fieldType === "multiselect") {
      return "multiSelect";
    }

     // Map niches end prices field to use NicheField component
    if (fieldType === "niche") {
      return "niche";
    }

    // Return original field type for standard fields
    return fieldType;
  };

  if (loading) {
    return <FormSkeleton />;
  }

  if (formDeleted) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            Este formulário foi excluído
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-error-500">{error}</div>;
  }

  if (!form) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Form not found
      </div>
    );
  }

  return (
    <div className="w-full">
      {success ? (
        <div className="p-6 text-center bg-success-50 dark:bg-success-500/15 rounded-lg">
          <h3 className="text-lg font-medium text-success-600 dark:text-success-500 mb-2">
            {form.success_message || "Form submitted successfully!"}
          </h3>
          {!form.redirect_page && (
            <button
              onClick={() => {
                setSuccess(false);
                loadForm();
              }}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-success-600 rounded-lg hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              Submit Another Response
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
              {error}
            </div>
          )}

          <div className="grid grid-cols-12 gap-6">
            {fields.map((field) => renderField(field))}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : form.submit_button_text || "Submit"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
