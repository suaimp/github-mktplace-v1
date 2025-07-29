import React from "react";
import * as Fields from "../../../components/form/fields";
import { FormFieldsService } from "../services/formFieldsService";
import { FormValidationService } from "../services/formValidationService";

interface FieldEditorProps {
  field: any;
  fieldSettings: any;
  formValues: any;
  validationErrors: any;
  updateFormValue: (id: string, value: any) => void;
  clearValidationError: (id: string) => void;
  isAdmin: boolean;
  fields: any[];
}

const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  fieldSettings,
  formValues,
  validationErrors,
  updateFormValue,
  clearValidationError,
  isAdmin,
  fields
}) => {
  const settings = fieldSettings[field.id] || {};
  const value = formValues[field.id];
  const error = validationErrors[field.id];

  if (!FormFieldsService.shouldFieldBeVisible(settings, isAdmin)) {
    return null;
  }
  if (field.field_type === "button_buy") {
    return null;
  }

  const handleChange = (newValue: any) => {
    updateFormValue(field.id, newValue);
  };
  const handleErrorClear = () => {
    clearValidationError(field.id);
  };
  const extractProductDataFromForm = () => {
    const productField = fields.find((f) => f.field_type === "product");
    if (productField && formValues[productField.id]) {
      return formValues[productField.id];
    }
    return null;
  };
  const fieldProps = {
    field,
    settings,
    value,
    onChange: handleChange,
    error,
    onErrorClear: handleErrorClear,
    productData: extractProductDataFromForm()
  };
  const fieldTypeMapped = FormFieldsService.mapFieldType(field.field_type);
  const FieldComponent = (Fields as any)[
    `${fieldTypeMapped.charAt(0).toUpperCase() + fieldTypeMapped.slice(1)}Field`
  ];
  if (!FieldComponent) {
    return (
      <div className="text-error-500">
        Unknown field type: {field.field_type} (mapped to {fieldTypeMapped})
      </div>
    );
  }
  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
        {field.label}
        {FormValidationService.isFieldRequired(field) && <span className="text-error-500 ml-1">*</span>}
        {settings.visibility === "admin" && (
          <span className="ml-2 text-xs text-brand-500 dark:text-brand-400">(Admin Only)</span>
        )}
        {settings.visibility === "marketplace" && (
          <span className="ml-2 text-xs text-warning-500 dark:text-warning-400">(Marketplace Only)</span>
        )}
      </label>
      <FieldComponent {...fieldProps} />
    </div>
  );
};

export default FieldEditor; 