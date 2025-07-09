import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { supabase } from "../../lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import UserAvatar from "../../components/ui/avatar/UserAvatar";
import PermissionGuard from "../../components/auth/PermissionGuard";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { PencilIcon, TrashBinIcon } from "../../icons";
import { useNavigate } from "react-router-dom";
import { deleteUserFromAuth } from '../../services/deleteUserFromAuth';

interface PlatformUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: "publisher" | "advertiser" | "admin";
  status: string;
  created_at: string;
  last_sign_in_at?: string | null;
  isAdmin?: boolean;
}

export default function PlatformUsers() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [editForm, setEditForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    status: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        email: selectedUser.email,
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        status: selectedUser.status
      });
    }
  }, [selectedUser]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      // Buscar platform_users
      const { data: platformUsers, error: platformError } = await supabase
        .from("platform_users")
        .select("*")
        .order("created_at", { ascending: false });
      if (platformError) throw platformError;

      // Buscar admins
      const { data: adminUsers, error: adminError } = await supabase
        .from("admins")
        .select("id, email, first_name, last_name, created_at")
        .order("created_at", { ascending: false });
      if (adminError) throw adminError;

      // Padronizar admins para o mesmo formato
      const adminsFormatted: PlatformUser[] = (adminUsers || []).map((admin: any) => ({
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        phone: "-",
        role: "admin",
        status: "active",
        created_at: admin.created_at,
        isAdmin: true,
      }));

      // Unir os arrays
      setUsers([...(platformUsers || []), ...adminsFormatted]);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      setError("Erro ao carregar lista de usuários");
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (user: PlatformUser) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Exclui do Auth via função serverless
      await deleteUserFromAuth(userId);

      setSuccess("Usuário excluído com sucesso");
      await loadUsers();
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      setError("Erro ao excluir usuário");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Update auth email if changed
      if (editForm.email !== selectedUser.email) {
        const { error: emailError } = await supabase.auth.admin.updateUserById(
          selectedUser.id,
          { email: editForm.email }
        );
        if (emailError) throw emailError;
      }

      // Update platform_users table
      const { error: updateError } = await supabase
        .from("platform_users")
        .update({
          email: editForm.email,
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          status: editForm.status
        })
        .eq("id", selectedUser.id);

      if (updateError) throw updateError;

      setSuccess("Usuário atualizado com sucesso");
      await loadUsers();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      setError("Erro ao atualizar usuário");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Função de ordenação
  const handleSort = (field: string) => {
    if (field === "acoes") return;
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Ordenar usuários
  const sortedUsers = [...users].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    if (sortField === "full_name") {
      aValue = `${a.first_name} ${a.last_name}`;
      bValue = `${b.first_name} ${b.last_name}`;
    }
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    return 0;
  });

  // Filtrar usuários pelo termo de pesquisa
  const filteredUsers = sortedUsers.filter((user) => {
    if (!searchTerm.trim()) return true;
    const lower = searchTerm.toLowerCase();
    return (
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(lower) ||
      user.email.toLowerCase().includes(lower) ||
      (user.phone && user.phone.toLowerCase().includes(lower)) ||
      (user.role && (user.role === "publisher"
        ? "publisher"
        : user.role === "advertiser"
        ? "anunciante"
        : "admin").toLowerCase().includes(lower)) ||
      (user.status && user.status.toLowerCase().includes(lower))
    );
  });

  // Paginação
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );
  if (currentPage > totalPages) setCurrentPage(totalPages);

  // SVG setas de ordenação
  const SortArrows = ({ show }: { show: boolean }) =>
    show ? (
      <span className="flex flex-col gap-0.5 ml-1">
        <svg className="w-2 h-1.5 fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
        </svg>
        <svg className="w-2 h-1.5 fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
        </svg>
      </span>
    ) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <PermissionGuard
      permission="user.view"
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-error-500">Acesso não autorizado</div>
        </div>
      }
    >
      <PageMeta
        title="Usuários da Plataforma | Admin Panel"
        description="Gerenciamento de usuários da plataforma"
      />
      <PageBreadcrumb pageTitle="Usuários" />

      {/* Botão de cadastro de novo admin */}
      <div className="flex justify-end mb-6">
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/users/register/admin-register")}
        >
          Cadastrar novo administrador
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
          {success}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Barra de pesquisa e seletor Mostrar registros */}
        <div className="flex flex-col gap-2 px-4 py-4 border-b border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 dark:text-gray-400">Mostrar</span>
            <div className="relative z-20 bg-transparent">
              <select
                className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                value={entriesPerPage}
                onChange={e => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
                <svg className="stroke-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165" stroke="" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400">registros</span>
          </div>
          {/* Input de pesquisa */}
          <div className="relative">
            <button className="absolute text-gray-500 -translate-y-1/2 left-4 top-1/2 dark:text-gray-400">
              <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z" fill=""></path>
              </svg>
            </button>
            <input
              placeholder="Pesquisar..."
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 group"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center px-5 py-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-white/10 transition"
                      onClick={() => handleSort("full_name")}
                    >
                      <span className="flex items-center">
                        Usuário
                        <SortArrows show={sortField === "full_name"} />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 group"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center px-5 py-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-white/10 transition"
                      onClick={() => handleSort("email")}
                    >
                      <span className="flex items-center">
                        E-mail
                        <SortArrows show={sortField === "email"} />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 group"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center px-5 py-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-white/10 transition"
                      onClick={() => handleSort("role")}
                    >
                      <span className="flex items-center">
                        Tipo de Conta
                        <SortArrows show={sortField === "role"} />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 group"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center px-5 py-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-white/10 transition"
                      onClick={() => handleSort("status")}
                    >
                      <span className="flex items-center">
                        Status
                        <SortArrows show={sortField === "status"} />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 group"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center px-5 py-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-white/10 transition"
                      onClick={() => handleSort("created_at")}
                    >
                      <span className="flex items-center">
                        Criado em
                        <SortArrows show={sortField === "created_at"} />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 group"
                  >
                    <div className="absolute inset-0 w-full h-full flex items-center px-5 py-3 select-none px-5 py-3">
                      <span>Ações</span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                          <UserAvatar
                            userId={user.id}
                            name={`${user.first_name} ${user.last_name}`}
                            size="sm"
                          />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {user.first_name} {user.last_name}
                          </span>
                          <span className=" text-gray-500 text-theme-xs dark:text-gray-400">
                            {user.phone}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        color={
                          user.role === "publisher"
                            ? "primary"
                            : user.role === "advertiser"
                            ? "warning"
                            : "info"
                        }
                        variant="light"
                      >
                        {user.role === "publisher"
                          ? "Publisher"
                          : user.role === "advertiser"
                          ? "Anunciante"
                          : "Admin"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        color={
                          user.status === "active"
                            ? "success"
                            : user.status === "suspended"
                            ? "error"
                            : "warning"
                        }
                      >
                        {user.status === "active"
                          ? "Ativo"
                          : user.status === "suspended"
                          ? "Suspenso"
                          : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Editar"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
                          title="Excluir"
                        >
                          <TrashBinIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 px-4 py-2">
            <button
              className="px-2 py-1 text-sm text-gray-500 disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="px-2 py-1 text-sm text-gray-500 disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editar Usuário
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Atualize as informações do usuário
            </p>
          </div>

          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Nome</Label>
                  <Input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, first_name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Sobrenome</Label>
                  <Input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, last_name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  >
                    <option value="pending">Pendente</option>
                    <option value="active">Ativo</option>
                    <option value="suspended">Suspenso</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </PermissionGuard>
  );
}
