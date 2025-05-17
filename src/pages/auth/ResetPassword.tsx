import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthLayout";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <>
      <PageMeta
        title="Recuperar Senha | Admin Panel"
        description="Recupere sua senha de acesso ao sistema"
      />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}