import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "./input/InputField";
import Label from "./Label";
import Select from "./Select";
import Switch from "./switch/Switch";
import CountrySettings from "./fields/settings/CountrySettings";
import BrazilianStatesSettings from "./fields/settings/BrazilianStatesSettings";
import ProductSettings from "./fields/settings/ProductSettings";
import DateTimeSettings from "./fields/settings/DateTimeSettings";
import FileSettings from "./fields/settings/FileSettings";
import InputMaskSettings from "./fields/settings/InputMaskSettings";
import OptionsSettings from "./fields/settings/OptionsSettings";
import ButtonBuySettings from "./fields/settings/ButtonBuySettings";
import BrandSettings from "./fields/settings/BrandSettings";
import ApiFieldSettings from "./fields/settings/ApiFieldSettings";
import UrlFieldSettings from "./fields/settings/UrlFieldSettings";
import { supabase } from "../../lib/supabase";
import NicheSettings from "./fields/settings/NicheSettings";
import {
  createFormFieldNiche,
  updateFormFieldNiche
} from "../../context/db-context/services/formFieldNicheService";

interface FormField {
  id: string;
  field_type: string;
  label: string;
  description?: string;
  placeholder?: string;
  default_value?: string;

  options?: any[];

  validation_rules?: Record<string, any>;
  is_required: boolean;
  position: number;
  width: "full" | "half" | "third" | "quarter";
  css_class?: string;
}

interface FormFieldSettings {
  id?: string;
  field_id: string;
  label_text: string;
  label_visibility: "visible" | "hidden";
  placeholder_text?: string;
  help_text?: string;
  is_required: boolean;
  no_duplicates: boolean;
  visibility: "visible" | "hidden" | "admin" | "marketplace";
  validation_type?: string;
  validation_regex?: string;
  field_identifier?: string;
  input_mask_enabled?: boolean;
  input_mask_pattern?: string;
  columns?: 1 | 2 | 3;
  max_selections?: number;
  inline_layout?: boolean;
  allowed_extensions?: string;
  multiple_files?: boolean;
  max_files?: number;
  max_file_size?: number;
  commission_rate?: number;
  product_currency?: string;
  product_description?: string;
  disable_quantity?: boolean;
  date_format?: string;
  time_format?: string;
  countries?: string[];
  show_percentage?: boolean;
  marketplace_label?: string;
  custom_button_text?: boolean;
  button_text?: string;
  position_last_column?: boolean;
  button_style?: string;
  sort_by_field?: boolean;
  is_product_name?: boolean;
  is_site_url?: boolean;
  options?: any[];
}

interface FormFieldSettingsProps {
  field: FormField;
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: FormField) => void;
}

interface Option {
  label: string;
  value: string;
}

export default function FormFieldSettings({
  field,
  isOpen,
  onClose,
  onSave
}: FormFieldSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [options, setOptions] = useState<Option[]>(field.options || []);
  const [settings, setSettings] = useState<FormFieldSettings>({
    field_id: field.id,
    label_text: field.label,
    label_visibility: "visible",
    placeholder_text: field.placeholder,
    help_text: field.description,
    is_required: field.is_required,
    no_duplicates: false,
    visibility: "visible",
    validation_type: field.field_type === "url" ? "url" : undefined,
    validation_regex: field.field_type === "url" ? "^https?://" : undefined,
    field_identifier:
      field.field_type === "button_buy" ? "botao_comprar" : field.css_class,
    input_mask_enabled: false,
    input_mask_pattern: "",
    columns: 1,
    max_selections: undefined,
    inline_layout: false,
    allowed_extensions: "",
    multiple_files: false,
    max_files: 1,
    max_file_size: 5,
    commission_rate: 0,
    product_currency: "BRL",
    product_description: "",
    disable_quantity: false,
    date_format: "dd/mm/yyyy",
    time_format: "HH:mm",
    countries: [],
    show_percentage: false,
    marketplace_label: "",
    custom_button_text: false,
    button_text: "",
    position_last_column: false,
    button_style: "primary",
    sort_by_field: false,
    is_product_name: false,
    is_site_url: false
  });

  useEffect(() => {
    if (isOpen) {
      loadFieldSettings();
    }
  }, [isOpen, field.id]);

  // Sincroniza options com settings.options para campo niche
  useEffect(() => {
    if (field.field_type === "niche" && Array.isArray(settings.options)) {
      setOptions(settings.options);
    }
  }, [settings.options, field.field_type]);

  async function loadFieldSettings() {
    try {
      setLoading(true);
      setError("");

      const { data: fieldSettings, error: settingsError } = await supabase
        .from("form_field_settings")
        .select("*")
        .eq("field_id", field.id)
        .maybeSingle();

      if (settingsError) throw settingsError;

      if (fieldSettings) {
        setSettings(fieldSettings);
      } else if (field.field_type === "button_buy") {
        // Set default field identifier for button_buy field type
        setSettings((prev) => ({
          ...prev,
          field_identifier: "botao_comprar"
        }));
      }

      setOptions(field.options || []);
    } catch (err) {
      console.error("Error loading field settings:", err);
      setError("Error loading field settings");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Loga as opções recebidas do NicheSettings no momento do submit
    console.log("[FormFieldSettings] options prop on submit:", options);

    try {
      setLoading(true);
      setError("");

      // Log the settings being saved
      console.log("Saving settings:", settings);

      // Se for campo niche, usa o state 'options' para atualizar a tabela form_field_niche
      if (field.field_type === "niche" && options && options.length > 0) {
        try {
          // Garante que options é um array de string
          const optionsArr = options.map((opt) =>
            typeof opt === "string" ? opt : opt.value || opt.label || ""
          );
          console.log("Niche options:", optionsArr);
          // Salva options na tabela form_field_niche
          // Primeiro tenta atualizar, se não existir faz insert
          const updateResult = await updateFormFieldNiche(field.id, {
            options: optionsArr
          });
          if (!updateResult) {
            await createFormFieldNiche({
              form_field_id: field.id,
              options: optionsArr
            });
          }
        } catch (err) {
          setError(
            "Erro ao atualizar nichos: " +
              (err instanceof Error ? err.message : String(err))
          );
          setLoading(false);
          return;
        }
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Remove options e id antes de salvar em form_field_settings
      const {
        options: _options,
        id: _id,
        ...settingsWithoutOptions
      } = settings;

      const { error: updateError } = await supabase
        .from("form_field_settings")
        .upsert(
          {
            ...settingsWithoutOptions,
            field_id: field.id
          },
          { onConflict: "field_id" }
        );

      if (updateError) throw updateError;

      let width: "full" | "half" | "third" | "quarter";
      switch (settings.columns) {
        case 2:
          width = "half";
          break;
        case 3:
          width = "third";
          break;
        default:
          width = "full";
      }

      const updatedField: FormField = {
        ...field,
        label: settings.label_text,
        description:
          field.field_type === "section"
            ? field.description
            : settings.help_text,
        placeholder: settings.placeholder_text,
        is_required: settings.is_required,
        width,
        css_class: settings.field_identifier,
        options,
        validation_rules: {
          ...field.validation_rules,
          type: settings.validation_type,
          pattern: settings.validation_regex,
          input_mask: settings.input_mask_enabled
            ? settings.input_mask_pattern
            : undefined,
          max_selections: settings.max_selections,
          inline_layout: settings.inline_layout,
          allowed_extensions: settings.allowed_extensions,
          multiple_files: settings.multiple_files,
          max_files: settings.max_files,
          max_file_size: settings.max_file_size,
          commission_rate: settings.commission_rate,
          product_currency: settings.product_currency,
          product_description: settings.product_description,
          disable_quantity: settings.disable_quantity,
          date_format: settings.date_format,
          time_format: settings.time_format,
          countries: settings.countries,
          show_percentage: settings.show_percentage,
          marketplace_label: settings.marketplace_label,
          sort_by_field: settings.sort_by_field,
          is_product_name: settings.is_product_name,
          is_site_url: settings.is_site_url
        }
      };

      onSave(updatedField);
      onClose();
    } catch (err) {
      console.error("Error saving field settings:", err);
      setError("Error saving field settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[900px] m-4">
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-8">
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Field Settings
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure field properties
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>
                Label Text <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                value={settings.label_text}
                onChange={(e) =>
                  setSettings({ ...settings, label_text: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Marketplace Label</Label>
              <Input
                type="text"
                value={settings.marketplace_label || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    marketplace_label: e.target.value
                  })
                }
                placeholder="Custom label for marketplace table"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Custom label to display in marketplace tables (leave empty to
                use default label)
              </p>
            </div>

            <div>
              <Label>Field Identifier</Label>
              <Input
                type="text"
                value={settings.field_identifier || ""}
                onChange={(e) =>
                  setSettings({ ...settings, field_identifier: e.target.value })
                }
                placeholder={
                  field.field_type === "button_buy"
                    ? "botao_comprar"
                    : "website_url"
                }
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Um identificador único para este campo (opcional)
              </p>
            </div>

            <div>
              <Label>Label Visibility</Label>
              <Select
                options={[
                  { value: "visible", label: "Visible" },
                  { value: "hidden", label: "Hidden" }
                ]}
                value={settings.label_visibility}
                onChange={(value) =>
                  setSettings({
                    ...settings,
                    label_visibility: value as "visible" | "hidden"
                  })
                }
              />
            </div>

            <div>
              <Label>Columns</Label>
              <Select
                options={[
                  { value: "1", label: "1 Column (100% width)" },
                  { value: "2", label: "2 Columns (50% width)" },
                  { value: "3", label: "3 Columns (33% width)" }
                ]}
                value={settings.columns?.toString() || "1"}
                onChange={(value) =>
                  setSettings({
                    ...settings,
                    columns: parseInt(value) as 1 | 2 | 3
                  })
                }
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Define how many columns this field should span
              </p>
            </div>

            {field.field_type !== "section" &&
              field.field_type !== "html" &&
              field.field_type !== "button_buy" && (
                <>
                  <div>
                    <Label>Placeholder Text</Label>
                    <Input
                      type="text"
                      value={settings.placeholder_text || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          placeholder_text: e.target.value
                        })
                      }
                      placeholder={
                        field.field_type === "url"
                          ? "https://example.com"
                          : "Enter placeholder text"
                      }
                    />
                  </div>

                  <div>
                    <Label>Help Text</Label>
                    <Input
                      type="text"
                      value={settings.help_text || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, help_text: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

            <div>
              <Label>Visibility</Label>
              <Select
                options={[
                  { value: "visible", label: "Visible" },
                  { value: "hidden", label: "Hidden" },
                  { value: "admin", label: "Admin Only" },
                  { value: "marketplace", label: "Marketplace Only" }
                ]}
                value={settings.visibility}
                onChange={(value) =>
                  setSettings({
                    ...settings,
                    visibility: value as
                      | "visible"
                      | "hidden"
                      | "admin"
                      | "marketplace"
                  })
                }
              />
            </div>

            {field.field_type === "url" && (
              <div>
                <Label>URL Validation</Label>
                <Select
                  options={[
                    { value: "url", label: "Require HTTPS" },
                    { value: "any_url", label: "Allow any URL" }
                  ]}
                  value={settings.validation_type}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      validation_type: value,
                      validation_regex:
                        value === "url" ? "^https?://" : undefined
                    })
                  }
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Choose how URLs should be validated in this field
                </p>
              </div>
            )}

            {field.field_type === "text" && (
              <InputMaskSettings settings={settings} onChange={setSettings} />
            )}

            {field.field_type !== "section" &&
              field.field_type !== "html" &&
              field.field_type !== "button_buy" && (
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      label="Required Field"
                      checked={settings.is_required}
                      onChange={(checked) =>
                        setSettings({ ...settings, is_required: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      label="No Duplicates"
                      checked={settings.no_duplicates}
                      onChange={(checked) =>
                        setSettings({ ...settings, no_duplicates: checked })
                      }
                    />
                  </div>
                </div>
              )}

            {field.field_type === "file" && (
              <FileSettings settings={settings} onChange={setSettings} />
            )}

            {(field.field_type === "select" ||
              field.field_type === "multiselect" ||
              field.field_type === "radio" ||
              field.field_type === "checkbox") && (
              <OptionsSettings
                settings={settings}
                options={options}
                onChange={setSettings}
                onOptionsChange={setOptions}
                fieldType={field.field_type as any}
              />
            )}

            {field.field_type === "product" && (
              <ProductSettings settings={settings} onChange={setSettings} />
            )}

            {(field.field_type === "date" || field.field_type === "time") && (
              <DateTimeSettings
                settings={settings}
                onChange={setSettings}
                type={field.field_type}
              />
            )}

            {field.field_type === "country" && (
              <CountrySettings settings={settings} onChange={setSettings} />
            )}

            {field.field_type === "brazilian_states" && (
              <BrazilianStatesSettings
                settings={settings}
                onChange={setSettings}
              />
            )}

            {field.field_type === "button_buy" && (
              <ButtonBuySettings settings={settings} onChange={setSettings} />
            )}

            {field.field_type === "brand" && (
              <BrandSettings settings={settings} onChange={setSettings} />
            )}

            {[
              "moz_da",
              "semrush_as",
              "ahrefs_dr",
              "ahrefs_traffic",
              "similarweb_traffic",
              "google_traffic"
            ].includes(field.field_type) && (
              <ApiFieldSettings settings={settings} onChange={setSettings} />
            )}

            {field.field_type === "url" && (
              <UrlFieldSettings settings={settings} onChange={setSettings} />
            )}

            {field.field_type === "niche" && (
              <NicheSettings
                settings={settings || { niche: "", price: "" }}
                onChange={setSettings}
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
