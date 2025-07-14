import React, { useState, useEffect } from "react";
import Input from "./InputField";
import {
  formatCPF,
  formatCNPJ,
  formatCEP,
  formatPhone,
  formatEmail,
  formatDocument,
  removeMask,
  validateCPF,
  validateCNPJ,
  validateCEP,
  validatePhone,
  validateEmail,
  validateDocument,
  isFieldComplete,
} from "../../../utils/inputMasks";

type MaskType = "cpf" | "cnpj" | "cep" | "phone" | "email" | "document" | "none";

interface MaskedInputProps {
  mask: MaskType;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  validateOnBlur?: boolean;
  type?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  hint?: string;
  autoComplete?: string;
}

const MaskedInput: React.FC<MaskedInputProps> = ({
  mask = "none",
  value = "",
  onChange,
  onBlur,
  validateOnBlur = true,
  type = "text",
  id,
  name,
  placeholder,
  className = "",
  disabled = false,
  required = false,
  maxLength,
  hint,
  autoComplete,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState("");

  // Atualiza o valor formatado quando o valor externo muda
  useEffect(() => {
    if (value !== displayValue) {
      setDisplayValue(formatValue(value));
    }
  }, [value]);

  // Função para aplicar a máscara baseada no tipo
  const formatValue = (val: string): string => {
    if (!val) return "";
    
    switch (mask) {
      case "cpf":
        return formatCPF(val);
      case "cnpj":
        return formatCNPJ(val);
      case "cep":
        return formatCEP(val);
      case "phone":
        return formatPhone(val);
      case "email":
        return formatEmail(val);
      case "document":
        return formatDocument(val);
      default:
        return val;
    }
  };

  // Função para validar baseada no tipo
  const validateValue = (val: string): { isValid: boolean; message: string } => {
    if (!val && !required) {
      return { isValid: true, message: "" };
    }

    if (!val && required) {
      return { isValid: false, message: "Este campo é obrigatório" };
    }

    switch (mask) {
      case "cpf":
        const cpfValid = validateCPF(val);
        return {
          isValid: cpfValid,
          message: cpfValid ? "" : "CPF inválido",
        };
      case "cnpj":
        const cnpjValid = validateCNPJ(val);
        return {
          isValid: cnpjValid,
          message: cnpjValid ? "" : "CNPJ inválido",
        };
      case "cep":
        const cepValid = validateCEP(val);
        return {
          isValid: cepValid,
          message: cepValid ? "" : "CEP deve ter 8 dígitos",
        };
      case "phone":
        const phoneValid = validatePhone(val);
        return {
          isValid: phoneValid,
          message: phoneValid ? "" : "Telefone deve ter 10 ou 11 dígitos",
        };
      case "email":
        const emailValid = validateEmail(val);
        return {
          isValid: emailValid,
          message: emailValid ? "" : "Email inválido",
        };
      case "document":
        const docValid = validateDocument(val);
        return {
          isValid: docValid,
          message: docValid ? "" : "CPF ou CNPJ inválido",
        };
      default:
        return { isValid: true, message: "" };
    }
  };

  // Obter placeholder baseado no tipo de máscara
  const getPlaceholder = (): string => {
    if (placeholder) return placeholder;
    
    switch (mask) {
      case "cpf":
        return "000.000.000-00";
      case "cnpj":
        return "00.000.000/0000-00";
      case "cep":
        return "00000-000";
      case "phone":
        return "(00) 00000-0000";
      case "email":
        return "exemplo@email.com";
      case "document":
        return "CPF ou CNPJ";
      default:
        return "";
    }
  };

  // Obter comprimento máximo baseado no tipo de máscara
  const getMaxLength = (): number => {
    if (maxLength) return maxLength;
    
    switch (mask) {
      case "cpf":
        return 14; // 000.000.000-00
      case "cnpj":
        return 18; // 00.000.000/0000-00
      case "cep":
        return 9; // 00000-000
      case "phone":
        return 15; // (00) 00000-0000
      case "document":
        return 18; // Máximo para CNPJ
      default:
        return 255;
    }
  };

  // Obter mensagem para campo incompleto
  const getIncompleteMessage = (): string => {
    switch (mask) {
      case "cpf":
        return "CPF deve ter 11 dígitos";
      case "cnpj":
        return "CNPJ deve ter 14 dígitos";
      case "cep":
        return "CEP deve ter 8 dígitos";
      case "phone":
        return "Telefone deve ter 10 ou 11 dígitos";
      case "email":
        return "Email inválido";
      case "document":
        return "CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos";
      default:
        return "Campo incompleto";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatValue(rawValue);
    
    setDisplayValue(formattedValue);
    
    // Para campos obrigatórios, validar de forma mais flexível durante a digitação
    if (required && formattedValue) {
      // Durante a digitação, considerar válido se há conteúdo
      // A validação completa será feita no onBlur
      setIsValid(true);
      setValidationMessage("");
    } else if (!required || !formattedValue) {
      // Resetar validação se não obrigatório ou vazio
      setIsValid(null);
      setValidationMessage("");
    }
    
    // Criar evento com valor sem máscara para uso interno
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: name || e.target.name, // Garantir que name nunca seja undefined
        value: mask === "email" ? formattedValue : removeMask(formattedValue),
      },
    };
    
    onChange?.(syntheticEvent);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // No blur, fazer validação completa
    if (required && displayValue) {
      // Usar a função isFieldComplete para verificar se está completo
      const isComplete = isFieldComplete(displayValue, mask);
      if (isComplete) {
        const validation = validateValue(displayValue);
        setIsValid(validation.isValid);
        setValidationMessage(validation.message);
      } else {
        // Campo incompleto - marcar como inválido
        setIsValid(false);
        setValidationMessage(getIncompleteMessage());
      }
    } else if (validateOnBlur) {
      const validation = validateValue(displayValue);
      setIsValid(validation.isValid);
      setValidationMessage(validation.message);
    }
    
    // Criar evento com valor sem máscara
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: name || e.target.name, // Garantir que name nunca seja undefined
        value: mask === "email" ? displayValue : removeMask(displayValue),
      },
    };
    
    onBlur?.(syntheticEvent);
  };

  // Mostrar feedback visual vermelho (sem ícone)
  const inputError = isValid === false;
  const inputHint = validationMessage || hint;

  return (
    <div className="relative">
      <Input
        type={mask === "email" ? "email" : mask === "phone" ? "tel" : type}
        id={id}
        name={name}
        placeholder={getPlaceholder()}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={className}
        disabled={disabled}
        required={required}
        maxLength={getMaxLength()}
        autoComplete={autoComplete}
        error={inputError}
        hint={inputHint}
      />
    </div>
  );
};

export default MaskedInput;
