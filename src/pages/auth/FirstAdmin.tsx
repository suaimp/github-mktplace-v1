import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthLayout";
import FirstAdminForm from "../../components/auth/FirstAdminForm";

export default function FirstAdmin() {
  return (
    <>
      <PageMeta
        title="Criar Conta de Administrador | Admin Panel"
        description="Create the first admin account for the system"
      />
      <AuthLayout>
        <FirstAdminForm />
      </AuthLayout>
    </>
  );
}