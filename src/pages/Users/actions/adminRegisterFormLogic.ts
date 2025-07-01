import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitAdminRegister } from "./adminRegisterSubmit";

export function useAdminRegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await submitAdminRegister({
        firstName,
        lastName,
        email,
        password,
        phone
      });
      if (!result.success) {
        if (result.error && typeof result.error === 'string' && result.error.toLowerCase().includes('already')) {
          setError("Este e-mail já está cadastrado. Faça login ou use outro e-mail.");
        } else {
          setError(result.error || "Erro ao cadastrar administrador.");
        }
      } else {
        navigate("/verify-email");
      }
    } catch (err: any) {
      if (err && typeof err.message === 'string' && err.message.toLowerCase().includes('already')) {
        setError("Este e-mail já está cadastrado. Faça login ou use outro e-mail.");
      } else {
        setError(err.message || "Erro ao cadastrar administrador.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    phone,
    setPhone,
    termsAccepted,
    setTermsAccepted,
    loading,
    error,
    handleSubmit
  };
} 