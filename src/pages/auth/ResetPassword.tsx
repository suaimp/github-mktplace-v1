import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthLayout";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import TawkChat from "../../components/TawkChat/TawkChat";

export default function ResetPassword() {
  return (
    <>
      <TawkChat />
      <PageMeta
        pageTitle="Recuperar Senha"
        description="Recupere sua senha de acesso ao sistema"
      />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}