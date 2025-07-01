import {   useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Checkbox from "../../components/form/input/Checkbox";
import { AdminRoleGuard } from "../../components/auth/PermissionGuard";
import { useAdminRegisterForm } from "./actions/adminRegisterFormLogic";
import { showToast } from "../../utils/toast";
 
export default function AdminRegister() {
  const {
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
    error,
    handleSubmit
  } = useAdminRegisterForm();

  useEffect(() => {
    if (error) {
      showToast(error, "error");
    }
  }, [error]);

  return (
    <AdminRoleGuard fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-error-500">Acesso não autorizado</div></div>}>
      <PageMeta title="Cadastrar Administrador | Admin Panel" description="Cadastro de novo administrador" />
      <PageBreadcrumb pageTitle="Cadastrar Administrador" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] w-full flex justify-center">
        <div className="p-5 lg:p-6 w-full">
          <form className="max-w-xl w-full space-y-6" onSubmit={handleSubmit} autoComplete="off">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">Nome <span className="text-error-500">*</span></Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Digite o nome"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Sobrenome <span className="text-error-500">*</span></Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Digite o sobrenome"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email <span className="text-error-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Digite o email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha <span className="text-error-500">*</span></Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha <span className="text-error-500">*</span></Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirme a senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                placeholder="(99) 99999-9999"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <div>
              <Label>Tipo de Conta <span className="text-error-500">*</span></Label>
              <div className="rounded-lg border border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/10 p-4 flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border-2 border-brand-500 bg-brand-500 dark:border-brand-400 dark:bg-brand-400 mr-2">
                  <span className="w-2 h-2 m-0.5 rounded-full bg-white" />
                </span>
                <div>
                  <span className="font-medium text-gray-800 dark:text-white/90">Administrador</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Conta com permissões administrativas totais</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox checked={termsAccepted} onChange={setTermsAccepted} />
              <span className="block text-sm text-gray-500 dark:text-gray-400">
                Li e aceito os <a href="/terms" className="text-brand-500 hover:text-brand-600 dark:text-brand-400" target="_blank" rel="noopener noreferrer">Termos de Uso</a> e a <a href="/privacy" className="text-brand-500 hover:text-brand-600 dark:text-brand-400" target="_blank" rel="noopener noreferrer">Política de Privacidade</a>
              </span>
            </div>
            <div className="flex justify-end pt-6 gap-2">
              <Button variant="outline" size="md" onClick={() => window.location.href = '/users'}>
                Cancelar
              </Button>
              <Button variant="primary" size="md">
                Cadastrar administrador
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminRoleGuard>
  );
} 