import { PhoneInputCountry } from "../types/phone";

const countries: PhoneInputCountry[] = [
  { code: "BR", label: "+55" },
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

const usePhoneInput = {
  countries
};

export default usePhoneInput;
