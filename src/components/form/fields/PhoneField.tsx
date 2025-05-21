import PhoneInput from "../group-input/PhoneInput";

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorClear?: () => void;
}

const brazilianPhoneCodes = [
  { code: "BR", label: "+55" }, // Brazil first
  { code: "US", label: "+1" },
  { code: "GB", label: "+44" },
  { code: "PT", label: "+351" },
  { code: "ES", label: "+34" },
  { code: "FR", label: "+33" },
  { code: "DE", label: "+49" },
  { code: "IT", label: "+39" },
  { code: "JP", label: "+81" },
  { code: "CN", label: "+86" },
  { code: "AU", label: "+61" },
  { code: "CA", label: "+1" },
  { code: "MX", label: "+52" },
  { code: "AR", label: "+54" },
  { code: "CL", label: "+56" },
  { code: "CO", label: "+57" },
  { code: "PE", label: "+51" },
  { code: "UY", label: "+598" },
  { code: "PY", label: "+595" },
  { code: "BO", label: "+591" }
];

export default function PhoneField({
  value,
  onChange,
  error,
  onErrorClear
}: PhoneFieldProps) {
  return (
    <PhoneInput
      countries={brazilianPhoneCodes}
      value={value || ""}
      onChange={(value) => {
        onChange(value);
        if (error && onErrorClear) {
          onErrorClear();
        }
      }}
      placeholder="(99) 99999-9999"
    />
  );
}
