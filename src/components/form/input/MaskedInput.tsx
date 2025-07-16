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

  // Atualiza a validação sempre que displayValue mudar
  useEffect(() => {
    const { isValid, message } = validateValue(displayValue);
    setIsValid(isValid);
    setValidationMessage(message);
  }, [displayValue]);

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
    const cleaned = mask === "phone" ? removeMask(val) : val;
    if (!cleaned && !required) {
      return { isValid: true, message: "" };
    }
    if (!cleaned && required) {
      return { isValid: false, message: "Este campo é obrigatório" };
    }
    switch (mask) {
      case "phone": {
        // Validar apenas a quantidade de dígitos (após remover máscara), aceitando DDI
        const phoneDigits = removeMask(val);
        const phoneValid = phoneDigits.length >= 10 && phoneDigits.length <= 15;
        return {
          isValid: phoneValid,
          message: !val ? "" : (phoneValid ? "" : "Telefone deve conter entre 10 e 15 dígitos"),
        };
      }
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
        return "+99 (99) 99999-9999";
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
        return 25; // Permite DDI internacional completo com formatação
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
        return "Telefone deve conter entre 10 e 15 dígitos";
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
      // Para telefone, validar apenas a quantidade de dígitos (10 a 15)
      if (mask === "phone") {
        const validation = validateValue(displayValue);
        setIsValid(validation.isValid);
        setValidationMessage(validation.message);
      } else {
        // Usar a função isFieldComplete para outros casos
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

  
 
  // Exibir mensagem de erro apenas se o campo não estiver vazio e for inválido
  const showError = isValid === false && displayValue && displayValue.length > 0;
  // Só mostra hint se não for erro
  const inputHint = showError ? undefined : (validationMessage || hint);

  return (
    <div className={"relative w-full"}>
      <Input
        type={mask === "email" ? "email" : mask === "phone" ? "tel" : type}
        id={id}
        name={name}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={getPlaceholder()}
        className={className}
        disabled={disabled}
        required={required}
        maxLength={getMaxLength()}
        autoComplete={autoComplete}
        error={!!showError}
        hint={inputHint}
      />
      {showError && (
        <span className="text-xs text-error-500 absolute left-0 -bottom-5">
          {validationMessage}
        </span>
      )}
    </div>
  );
};

export default MaskedInput;
