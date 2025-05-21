import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthLayout";
// import FirstAdminForm from "../../components/auth/FirstAdminForm"; // Arquivo não encontrado, importação comentada

export default function FirstAdmin() {
  return (
    <>
      <PageMeta
        title="Criar Conta de Administrador | Admin Panel"
        description="Create the first admin account for the system"
      />
      <AuthLayout>
        {/* <FirstAdminForm /> */ <>firstAdminForm não existe.</>}
      </AuthLayout>
    </>
  );
}
