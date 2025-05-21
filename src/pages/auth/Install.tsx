import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthLayout";
// import InstallForm from "../../components/auth/InstallForm"; // Arquivo não encontrado, importação comentada

export default function Install() {
  return (
    <>
      <PageMeta
        title="Instalação | Admin Panel"
        description="Configure o primeiro administrador do sistema"
      />
      <AuthLayout>{/* <InstallForm /> */}</AuthLayout>
    </>
  );
}
