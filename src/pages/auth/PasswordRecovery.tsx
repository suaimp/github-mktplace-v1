import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthLayout";
import PasswordRecoveryForm from "../../components/auth/PasswordRecoveryForm.tsx";
import TawkChat from "../../components/TawkChat/TawkChat";

export default function PasswordRecovery() {
  return (
    <>
      <TawkChat />
      <PageMeta
        title="Definir Nova Senha | Platform"
        description="Defina sua nova senha de acesso"
      />
      <AuthLayout>
        <PasswordRecoveryForm />
      </AuthLayout>
    </>
  );
}
