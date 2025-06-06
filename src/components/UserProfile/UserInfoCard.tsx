import { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import PhoneInput from "../form/group-input/PhoneInput";
import { supabase } from "../../lib/supabase";

interface AdminProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_first_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface UserInfoCardProps {
  profile: AdminProfile | null;
  onUpdate: () => void;
  onClose?: () => void; // Torna onClose opcional
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

export default function UserInfoCard({
  profile,
  onUpdate,
  onClose
}: UserInfoCardProps) {
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setPhone(profile.phone || "");
    }
  }, [profile]);

  if (!profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      // Validate required fields
      if (!firstName.trim() || !lastName.trim()) {
        setError("Nome e sobrenome são obrigatórios");
        return;
      }

      const { error: updateError } = await supabase
        .from("admins")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim()
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setSuccess(true);
      onUpdate();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      setError("Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Informações Pessoais
        </h3>

        {error && (
          <div className="p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
            Informações atualizadas com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <Label>
                Nome <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
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
                required
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input type="email" value={profile.email} disabled />
            </div>

            <div>
              <Label>Telefone</Label>
              <PhoneInput
                countries={brazilianPhoneCodes}
                value={phone}
                onChange={(value) => setPhone(value)}
                placeholder="(99) 99999-9999"
              />
            </div>

            <div>
              <Label>Tipo de Conta</Label>
              <Input
                type="text"
                value={
                  profile.is_first_admin
                    ? "Administrador Principal"
                    : "Administrador"
                }
                disabled
              />
            </div>
          </div>

          <div className="flex justify-end">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            )}
            <Button disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
