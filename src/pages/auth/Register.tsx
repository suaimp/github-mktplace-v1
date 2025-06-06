import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthLayout";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import PhoneInput from "../../components/form/group-input/PhoneInput";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import { supabase } from "../../lib/supabase";
import { EyeIcon, EyeCloseIcon } from "../../icons";
import { Link } from "react-router-dom";

const accountTypes = [
  {
    value: "advertiser",
    label: "Anunciante",
    description: "Crie e gerencie campanhas publicitárias"
  },
  {
    value: "publisher",
    label: "Publisher",
    description: "Monetize seu conteúdo com anúncios"
  }
];

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

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  accountType?: string;
  terms?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const validatePassword = (password: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;

    return (
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar &&
      hasMinLength
    );
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (!firstName.trim()) {
      errors.firstName = "Nome é obrigatório";
      isValid = false;
    }

    if (!lastName.trim()) {
      errors.lastName = "Sobrenome é obrigatório";
      isValid = false;
    }

    if (!email.trim()) {
      errors.email = "Email é obrigatório";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Email inválido";
      isValid = false;
    }

    if (!password) {
      errors.password = "Senha é obrigatória";
      isValid = false;
    } else if (!validatePassword(password)) {
      errors.password =
        "A senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais";
      isValid = false;
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirmação de senha é obrigatória";
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem";
      isValid = false;
    }

    if (!phone.trim()) {
      errors.phone = "Telefone é obrigatório";
      isValid = false;
    }

    if (!accountType) {
      errors.accountType = "Tipo de conta é obrigatório";
      isValid = false;
    }

    if (!termsAccepted) {
      errors.terms = "Você precisa aceitar os termos de uso";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setError("");

      // Create auth user first
      const {
        data: { user },
        error: signUpError
      } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim()
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error("Erro ao criar usuário");

      // Create platform user
      const { error: userError } = await supabase
        .from("platform_users")
        .insert([
          {
            id: user.id,
            email: email.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: phone.trim(),
            role: accountType,
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString()
          }
        ]);

      if (userError) throw userError;

      // Redirect to email verification page
      navigate("/verify-email");
    } catch (err: any) {
      console.error("Erro ao criar conta:", err);
      setError(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Criar Conta | Platform"
        description="Crie sua conta na plataforma"
      />
      <AuthLayout>
        <div className="flex flex-col flex-1">
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  Criar Conta
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Preencha os dados abaixo para criar sua conta
                </p>
              </div>

              {error && (
                <div className="p-3 mb-6 text-sm text-white bg-error-500 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <Label>
                        Nome <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        error={!!validationErrors.firstName}
                        hint={validationErrors.firstName}
                        required
                      />
                    </div>

                    <div>
                      <Label>
                        Sobrenome <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        error={!!validationErrors.lastName}
                        hint={validationErrors.lastName}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>
                      Email <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={!!validationErrors.email}
                      hint={validationErrors.email}
                      required
                    />
                  </div>

                  <div>
                    <Label>
                      Senha <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!validationErrors.password}
                        hint={validationErrors.password}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label>
                      Confirmar Senha <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={!!validationErrors.confirmPassword}
                        hint={validationErrors.confirmPassword}
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label>
                      Telefone <span className="text-error-500">*</span>
                    </Label>
                    <PhoneInput
                      countries={brazilianPhoneCodes}
                      value={phone}
                      onChange={(value) => setPhone(value)}
                      placeholder="(99) 99999-9999"
                    />
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-error-500">
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>
                      Tipo de Conta <span className="text-error-500">*</span>
                    </Label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {accountTypes.map((type) => (
                        <div
                          key={type.value}
                          className={`relative flex flex-col p-4 cursor-pointer rounded-lg border transition-colors ${
                            accountType === type.value
                              ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/10"
                              : "border-gray-200 hover:border-brand-500 dark:border-gray-700 dark:hover:border-brand-400"
                          }`}
                          onClick={() => setAccountType(type.value)}
                        >
                          <div className="flex items-center mb-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 mr-2 ${
                                accountType === type.value
                                  ? "border-brand-500 bg-brand-500 dark:border-brand-400 dark:bg-brand-400"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                            >
                              {accountType === type.value && (
                                <div className="w-2 h-2 m-0.5 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-medium text-gray-800 dark:text-white/90">
                              {type.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {type.description}
                          </p>
                        </div>
                      ))}
                    </div>
                    {validationErrors.accountType && (
                      <p className="mt-1 text-sm text-error-500">
                        {validationErrors.accountType}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={termsAccepted}
                      onChange={setTermsAccepted}
                    />
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      Li e aceito os{" "}
                      <Link
                        to="/terms"
                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      >
                        Termos de Uso
                      </Link>{" "}
                      e a{" "}
                      <Link
                        to="/privacy"
                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      >
                        Política de Privacidade
                      </Link>
                    </span>
                  </div>
                  {validationErrors.terms && (
                    <p className="text-sm text-error-500">
                      {validationErrors.terms}
                    </p>
                  )}

                  <Button className="w-full" disabled={loading}>
                    {loading ? "Criando conta..." : "Criar Conta"}
                  </Button>

                  <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
                    Já tem uma conta?{" "}
                    <Link
                      to="/"
                      className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    >
                      Fazer Login
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
