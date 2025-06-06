import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";
import InputMask from "react-input-mask";

interface CompanyData {
  legal_status: "business" | "individual";
  country: string;
  company_name?: string;
  city: string;
  zip_code: string;
  address: string;
  document_number: string;
}

interface CompanyInfoFormProps {
  data: CompanyData;
  onChange: (data: CompanyData) => void;
}

const countries = [
  // América do Sul
  {
    value: "BR",
    label: "Brasil",
    icon: (
      <img
        src="https://flagcdn.com/br.svg"
        width="20"
        alt="Brasil"
        className="mr-2"
      />
    )
  },
  {
    value: "AR",
    label: "Argentina",
    icon: (
      <img
        src="https://flagcdn.com/ar.svg"
        width="20"
        alt="Argentina"
        className="mr-2"
      />
    )
  },
  {
    value: "BO",
    label: "Bolívia",
    icon: (
      <img
        src="https://flagcdn.com/bo.svg"
        width="20"
        alt="Bolívia"
        className="mr-2"
      />
    )
  },
  {
    value: "CL",
    label: "Chile",
    icon: (
      <img
        src="https://flagcdn.com/cl.svg"
        width="20"
        alt="Chile"
        className="mr-2"
      />
    )
  },
  {
    value: "CO",
    label: "Colômbia",
    icon: (
      <img
        src="https://flagcdn.com/co.svg"
        width="20"
        alt="Colômbia"
        className="mr-2"
      />
    )
  },
  {
    value: "EC",
    label: "Equador",
    icon: (
      <img
        src="https://flagcdn.com/ec.svg"
        width="20"
        alt="Equador"
        className="mr-2"
      />
    )
  },
  {
    value: "GY",
    label: "Guiana",
    icon: (
      <img
        src="https://flagcdn.com/gy.svg"
        width="20"
        alt="Guiana"
        className="mr-2"
      />
    )
  },
  {
    value: "PY",
    label: "Paraguai",
    icon: (
      <img
        src="https://flagcdn.com/py.svg"
        width="20"
        alt="Paraguai"
        className="mr-2"
      />
    )
  },
  {
    value: "PE",
    label: "Peru",
    icon: (
      <img
        src="https://flagcdn.com/pe.svg"
        width="20"
        alt="Peru"
        className="mr-2"
      />
    )
  },
  {
    value: "SR",
    label: "Suriname",
    icon: (
      <img
        src="https://flagcdn.com/sr.svg"
        width="20"
        alt="Suriname"
        className="mr-2"
      />
    )
  },
  {
    value: "UY",
    label: "Uruguai",
    icon: (
      <img
        src="https://flagcdn.com/uy.svg"
        width="20"
        alt="Uruguai"
        className="mr-2"
      />
    )
  },
  {
    value: "VE",
    label: "Venezuela",
    icon: (
      <img
        src="https://flagcdn.com/ve.svg"
        width="20"
        alt="Venezuela"
        className="mr-2"
      />
    )
  },

  // América do Norte
  {
    value: "US",
    label: "Estados Unidos",
    icon: (
      <img
        src="https://flagcdn.com/us.svg"
        width="20"
        alt="Estados Unidos"
        className="mr-2"
      />
    )
  },
  {
    value: "CA",
    label: "Canadá",
    icon: (
      <img
        src="https://flagcdn.com/ca.svg"
        width="20"
        alt="Canadá"
        className="mr-2"
      />
    )
  },
  {
    value: "MX",
    label: "México",
    icon: (
      <img
        src="https://flagcdn.com/mx.svg"
        width="20"
        alt="México"
        className="mr-2"
      />
    )
  },

  // América Central
  {
    value: "CR",
    label: "Costa Rica",
    icon: (
      <img
        src="https://flagcdn.com/cr.svg"
        width="20"
        alt="Costa Rica"
        className="mr-2"
      />
    )
  },
  {
    value: "CU",
    label: "Cuba",
    icon: (
      <img
        src="https://flagcdn.com/cu.svg"
        width="20"
        alt="Cuba"
        className="mr-2"
      />
    )
  },
  {
    value: "SV",
    label: "El Salvador",
    icon: (
      <img
        src="https://flagcdn.com/sv.svg"
        width="20"
        alt="El Salvador"
        className="mr-2"
      />
    )
  },
  {
    value: "GT",
    label: "Guatemala",
    icon: (
      <img
        src="https://flagcdn.com/gt.svg"
        width="20"
        alt="Guatemala"
        className="mr-2"
      />
    )
  },
  {
    value: "HT",
    label: "Haiti",
    icon: (
      <img
        src="https://flagcdn.com/ht.svg"
        width="20"
        alt="Haiti"
        className="mr-2"
      />
    )
  },
  {
    value: "HN",
    label: "Honduras",
    icon: (
      <img
        src="https://flagcdn.com/hn.svg"
        width="20"
        alt="Honduras"
        className="mr-2"
      />
    )
  },
  {
    value: "NI",
    label: "Nicarágua",
    icon: (
      <img
        src="https://flagcdn.com/ni.svg"
        width="20"
        alt="Nicarágua"
        className="mr-2"
      />
    )
  },
  {
    value: "PA",
    label: "Panamá",
    icon: (
      <img
        src="https://flagcdn.com/pa.svg"
        width="20"
        alt="Panamá"
        className="mr-2"
      />
    )
  },
  {
    value: "DO",
    label: "República Dominicana",
    icon: (
      <img
        src="https://flagcdn.com/do.svg"
        width="20"
        alt="República Dominicana"
        className="mr-2"
      />
    )
  },

  // Europa
  {
    value: "DE",
    label: "Alemanha",
    icon: (
      <img
        src="https://flagcdn.com/de.svg"
        width="20"
        alt="Alemanha"
        className="mr-2"
      />
    )
  },
  {
    value: "AT",
    label: "Áustria",
    icon: (
      <img
        src="https://flagcdn.com/at.svg"
        width="20"
        alt="Áustria"
        className="mr-2"
      />
    )
  },
  {
    value: "BE",
    label: "Bélgica",
    icon: (
      <img
        src="https://flagcdn.com/be.svg"
        width="20"
        alt="Bélgica"
        className="mr-2"
      />
    )
  },
  {
    value: "BG",
    label: "Bulgária",
    icon: (
      <img
        src="https://flagcdn.com/bg.svg"
        width="20"
        alt="Bulgária"
        className="mr-2"
      />
    )
  },
  {
    value: "DK",
    label: "Dinamarca",
    icon: (
      <img
        src="https://flagcdn.com/dk.svg"
        width="20"
        alt="Dinamarca"
        className="mr-2"
      />
    )
  },
  {
    value: "SK",
    label: "Eslováquia",
    icon: (
      <img
        src="https://flagcdn.com/sk.svg"
        width="20"
        alt="Eslováquia"
        className="mr-2"
      />
    )
  },
  {
    value: "SI",
    label: "Eslovênia",
    icon: (
      <img
        src="https://flagcdn.com/si.svg"
        width="20"
        alt="Eslovênia"
        className="mr-2"
      />
    )
  },
  {
    value: "ES",
    label: "Espanha",
    icon: (
      <img
        src="https://flagcdn.com/es.svg"
        width="20"
        alt="Espanha"
        className="mr-2"
      />
    )
  },
  {
    value: "FI",
    label: "Finlândia",
    icon: (
      <img
        src="https://flagcdn.com/fi.svg"
        width="20"
        alt="Finlândia"
        className="mr-2"
      />
    )
  },
  {
    value: "FR",
    label: "França",
    icon: (
      <img
        src="https://flagcdn.com/fr.svg"
        width="20"
        alt="França"
        className="mr-2"
      />
    )
  },
  {
    value: "GR",
    label: "Grécia",
    icon: (
      <img
        src="https://flagcdn.com/gr.svg"
        width="20"
        alt="Grécia"
        className="mr-2"
      />
    )
  },
  {
    value: "HU",
    label: "Hungria",
    icon: (
      <img
        src="https://flagcdn.com/hu.svg"
        width="20"
        alt="Hungria"
        className="mr-2"
      />
    )
  },
  {
    value: "IE",
    label: "Irlanda",
    icon: (
      <img
        src="https://flagcdn.com/ie.svg"
        width="20"
        alt="Irlanda"
        className="mr-2"
      />
    )
  },
  {
    value: "IT",
    label: "Itália",
    icon: (
      <img
        src="https://flagcdn.com/it.svg"
        width="20"
        alt="Itália"
        className="mr-2"
      />
    )
  },
  {
    value: "LU",
    label: "Luxemburgo",
    icon: (
      <img
        src="https://flagcdn.com/lu.svg"
        width="20"
        alt="Luxemburgo"
        className="mr-2"
      />
    )
  },
  {
    value: "NO",
    label: "Noruega",
    icon: (
      <img
        src="https://flagcdn.com/no.svg"
        width="20"
        alt="Noruega"
        className="mr-2"
      />
    )
  },
  {
    value: "NL",
    label: "Países Baixos",
    icon: (
      <img
        src="https://flagcdn.com/nl.svg"
        width="20"
        alt="Países Baixos"
        className="mr-2"
      />
    )
  },
  {
    value: "PL",
    label: "Polônia",
    icon: (
      <img
        src="https://flagcdn.com/pl.svg"
        width="20"
        alt="Polônia"
        className="mr-2"
      />
    )
  },
  {
    value: "PT",
    label: "Portugal",
    icon: (
      <img
        src="https://flagcdn.com/pt.svg"
        width="20"
        alt="Portugal"
        className="mr-2"
      />
    )
  },
  {
    value: "GB",
    label: "Reino Unido",
    icon: (
      <img
        src="https://flagcdn.com/gb.svg"
        width="20"
        alt="Reino Unido"
        className="mr-2"
      />
    )
  },
  {
    value: "CZ",
    label: "República Tcheca",
    icon: (
      <img
        src="https://flagcdn.com/cz.svg"
        width="20"
        alt="República Tcheca"
        className="mr-2"
      />
    )
  },
  {
    value: "RO",
    label: "Romênia",
    icon: (
      <img
        src="https://flagcdn.com/ro.svg"
        width="20"
        alt="Romênia"
        className="mr-2"
      />
    )
  },
  {
    value: "SE",
    label: "Suécia",
    icon: (
      <img
        src="https://flagcdn.com/se.svg"
        width="20"
        alt="Suécia"
        className="mr-2"
      />
    )
  },
  {
    value: "CH",
    label: "Suíça",
    icon: (
      <img
        src="https://flagcdn.com/ch.svg"
        width="20"
        alt="Suíça"
        className="mr-2"
      />
    )
  },

  // Ásia
  {
    value: "CN",
    label: "China",
    icon: (
      <img
        src="https://flagcdn.com/cn.svg"
        width="20"
        alt="China"
        className="mr-2"
      />
    )
  },
  {
    value: "KR",
    label: "Coreia do Sul",
    icon: (
      <img
        src="https://flagcdn.com/kr.svg"
        width="20"
        alt="Coreia do Sul"
        className="mr-2"
      />
    )
  },
  {
    value: "AE",
    label: "Emirados Árabes Unidos",
    icon: (
      <img
        src="https://flagcdn.com/ae.svg"
        width="20"
        alt="Emirados Árabes Unidos"
        className="mr-2"
      />
    )
  },
  {
    value: "HK",
    label: "Hong Kong",
    icon: (
      <img
        src="https://flagcdn.com/hk.svg"
        width="20"
        alt="Hong Kong"
        className="mr-2"
      />
    )
  },
  {
    value: "IN",
    label: "Índia",
    icon: (
      <img
        src="https://flagcdn.com/in.svg"
        width="20"
        alt="Índia"
        className="mr-2"
      />
    )
  },
  {
    value: "ID",
    label: "Indonésia",
    icon: (
      <img
        src="https://flagcdn.com/id.svg"
        width="20"
        alt="Indonésia"
        className="mr-2"
      />
    )
  },
  {
    value: "IL",
    label: "Israel",
    icon: (
      <img
        src="https://flagcdn.com/il.svg"
        width="20"
        alt="Israel"
        className="mr-2"
      />
    )
  },
  {
    value: "JP",
    label: "Japão",
    icon: (
      <img
        src="https://flagcdn.com/jp.svg"
        width="20"
        alt="Japão"
        className="mr-2"
      />
    )
  },
  {
    value: "MY",
    label: "Malásia",
    icon: (
      <img
        src="https://flagcdn.com/my.svg"
        width="20"
        alt="Malásia"
        className="mr-2"
      />
    )
  },
  {
    value: "SG",
    label: "Singapura",
    icon: (
      <img
        src="https://flagcdn.com/sg.svg"
        width="20"
        alt="Singapura"
        className="mr-2"
      />
    )
  },
  {
    value: "TH",
    label: "Tailândia",
    icon: (
      <img
        src="https://flagcdn.com/th.svg"
        width="20"
        alt="Tailândia"
        className="mr-2"
      />
    )
  },
  {
    value: "TR",
    label: "Turquia",
    icon: (
      <img
        src="https://flagcdn.com/tr.svg"
        width="20"
        alt="Turquia"
        className="mr-2"
      />
    )
  },
  {
    value: "VN",
    label: "Vietnã",
    icon: (
      <img
        src="https://flagcdn.com/vn.svg"
        width="20"
        alt="Vietnã"
        className="mr-2"
      />
    )
  },

  // Oceania
  {
    value: "AU",
    label: "Austrália",
    icon: (
      <img
        src="https://flagcdn.com/au.svg"
        width="20"
        alt="Austrália"
        className="mr-2"
      />
    )
  },
  {
    value: "NZ",
    label: "Nova Zelândia",
    icon: (
      <img
        src="https://flagcdn.com/nz.svg"
        width="20"
        alt="Nova Zelândia"
        className="mr-2"
      />
    )
  },

  // África
  {
    value: "ZA",
    label: "África do Sul",
    icon: (
      <img
        src="https://flagcdn.com/za.svg"
        width="20"
        alt="África do Sul"
        className="mr-2"
      />
    )
  },
  {
    value: "AO",
    label: "Angola",
    icon: (
      <img
        src="https://flagcdn.com/ao.svg"
        width="20"
        alt="Angola"
        className="mr-2"
      />
    )
  },
  {
    value: "CM",
    label: "Camarões",
    icon: (
      <img
        src="https://flagcdn.com/cm.svg"
        width="20"
        alt="Camarões"
        className="mr-2"
      />
    )
  },
  {
    value: "EG",
    label: "Egito",
    icon: (
      <img
        src="https://flagcdn.com/eg.svg"
        width="20"
        alt="Egito"
        className="mr-2"
      />
    )
  },
  {
    value: "ET",
    label: "Etiópia",
    icon: (
      <img
        src="https://flagcdn.com/et.svg"
        width="20"
        alt="Etiópia"
        className="mr-2"
      />
    )
  },
  {
    value: "GH",
    label: "Gana",
    icon: (
      <img
        src="https://flagcdn.com/gh.svg"
        width="20"
        alt="Gana"
        className="mr-2"
      />
    )
  },
  {
    value: "KE",
    label: "Quênia",
    icon: (
      <img
        src="https://flagcdn.com/ke.svg"
        width="20"
        alt="Quênia"
        className="mr-2"
      />
    )
  },
  {
    value: "MA",
    label: "Marrocos",
    icon: (
      <img
        src="https://flagcdn.com/ma.svg"
        width="20"
        alt="Marrocos"
        className="mr-2"
      />
    )
  },
  {
    value: "MZ",
    label: "Moçambique",
    icon: (
      <img
        src="https://flagcdn.com/mz.svg"
        width="20"
        alt="Moçambique"
        className="mr-2"
      />
    )
  },
  {
    value: "NG",
    label: "Nigéria",
    icon: (
      <img
        src="https://flagcdn.com/ng.svg"
        width="20"
        alt="Nigéria"
        className="mr-2"
      />
    )
  },
  {
    value: "SN",
    label: "Senegal",
    icon: (
      <img
        src="https://flagcdn.com/sn.svg"
        width="20"
        alt="Senegal"
        className="mr-2"
      />
    )
  },
  {
    value: "TN",
    label: "Tunísia",
    icon: (
      <img
        src="https://flagcdn.com/tn.svg"
        width="20"
        alt="Tunísia"
        className="mr-2"
      />
    )
  }
].sort((a, b) => a.label.localeCompare(b.label));

export default function CompanyInfoForm({
  data,
  onChange
}: CompanyInfoFormProps) {
  const handleChange = (field: keyof CompanyData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  // Format document number based on type (CPF or CNPJ)
  const formatDocumentNumber = (value: string): string => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    if (data.legal_status === 'business') {
      // CNPJ format: 00.000.000/0000-00
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
      if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
      if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
    } else {
      // CPF format: 000.000.000-00
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    }
  };

  // Format ZIP code (CEP)
  const formatZipCode = (value: string): string => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    if (data.country === 'BR') {
      // CEP format: 00000-000
      if (digits.length <= 5) return digits;
      return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
    }
    
    return value; // For other countries, return as is
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <Label>
            Tipo de Pessoa <span className="text-error-500">*</span>
          </Label>
          <Select
            options={[
              { value: "individual", label: "Pessoa Física" },
              { value: "business", label: "Pessoa Jurídica" }
            ]}
            value={data.legal_status}
            onChange={(value) => handleChange("legal_status", value)}
          />
        </div>

        <div>
          <Label>
            País <span className="text-error-500">*</span>
          </Label>
          <Select
            options={countries}
            value={data.country}
            onChange={(value) => handleChange("country", value)}
          />
        </div>

        {data.legal_status === "business" && (
          <div className="lg:col-span-2">
            <Label>
              Nome da Empresa <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              value={data.company_name || ""}
              onChange={(e) => handleChange("company_name", e.target.value)}
              required={data.legal_status === "business"}
            />
          </div>
        )}

        <div>
          <Label>
            Cidade <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            value={data.city}
            onChange={(e) => handleChange("city", e.target.value)}
            required
          />
        </div>

        <div>
          <Label>
            {data.country === "BR" ? "CEP" : "Código Postal"}
            {data.country === "BR" && <span className="text-error-500">*</span>}
          </Label>
          <div className="relative">
            {data.country === "BR" ? (
              <InputMask
                mask="99999-999"
                value={data.zip_code}
                onChange={(e) => handleChange("zip_code", e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="00000-000"
                required={data.country === "BR"}
              />
            ) : (
              <Input
                type="text"
                value={data.zip_code}
                onChange={(e) => handleChange("zip_code", e.target.value)}
                required={data.country === "BR"}
                maxLength={10}
                placeholder="Enter postal/zip code"
              />
            )}
          </div>
          {/* Substitui isRequiredField("zipcode") por checagem inline */}
          {data.country !== "BR" && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Optional for non-Brazilian addresses
            </p>
          )}
        </div>

        <div className="lg:col-span-2">
          <Label>
            Endereço <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            value={data.address}
            onChange={(e) => handleChange("address", e.target.value)}
            required
          />
        </div>

        <div>
          <Label>
            {data.country === "BR" ? (data.legal_status === "business" ? "CNPJ" : "CPF") : (data.legal_status === "business" ? "Tax ID" : "Document Number")}
            {data.country === "BR" && <span className="text-error-500">*</span>}
          </Label>
          <div className="relative">
            {data.country === "BR" ? (
              <InputMask
                mask={data.legal_status === "business" ? "99.999.999/9999-99" : "999.999.999-99"}
                value={data.document_number}
                onChange={(e) => handleChange("document_number", e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder={data.legal_status === "business" ? "00.000.000/0000-00" : "000.000.000-00"}
                required={data.country === "BR"}
              />
            ) : (
              <Input
                type="text"
                value={data.document_number}
                onChange={(e) => handleChange("document_number", e.target.value)}
                required={data.country === "BR"}
                maxLength={20}
                placeholder={`Enter ${
                  data.legal_status === "business"
                    ? "tax ID"
                    : "document number"
                }`}
              />
            )}
          </div>
          {/* Substitui isRequiredField("document") por checagem inline */}
          {data.country !== "BR" && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Optional for non-Brazilian{" "}
              {data.legal_status === "business" ? "companies" : "individuals"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}