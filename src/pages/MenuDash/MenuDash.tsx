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
import Button from "../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../icons";
import PermissionGuard from "../../components/auth/PermissionGuard";
import { useNavigate } from "react-router";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  path: string | null;
  parent_id: string | null;
  position: number;
  is_visible: boolean;
  requires_permission: string | null;
  created_at: string;
  updated_at: string;
}

export default function MenuDash() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadMenuItems();
  }, []);

  async function loadMenuItems() {
    try {
      setLoading(true);
      setError("");

      const { data: items, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;

      setMenuItems(items || []);
    } catch (err) {
      console.error("Error loading menu items:", err);
      setError("Erro ao carregar lista de itens do menu");
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = () => {
    navigate("/menu-dash/new");
  };

  const handleEdit = (item: MenuItem) => {
    navigate(`/menu-dash/edit/${item.id}`);
  };

  const handleDelete = async (itemId: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setSuccess("Item excluído com sucesso");
      await loadMenuItems();
    } catch (err) {
      console.error("Error deleting item:", err);
      setError("Erro ao excluir item");
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

  if (loading && !menuItems.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <PermissionGuard
      permission="menu.view"
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-error-500">Acesso não autorizado</div>
        </div>
      }
    >
      <PageMeta
        pageTitle="Dashboard de Menu"
        description="Gerenciar menu do dashboard"
      />
      <PageBreadcrumb pageTitle="Dashboard de Menu" />

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

      <div className="mb-6">
        <Button onClick={handleCreate}>Novo Item</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Nome
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Caminho
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Posição
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Visível
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Última Atualização
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Ações
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {item.name}
                      </span>
                      {item.description && (
                        <span className="block text-sm text-gray-500 dark:text-gray-400">
                          {item.description}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.path || "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.position}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge color={item.is_visible ? "success" : "error"}>
                        {item.is_visible ? "Sim" : "Não"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatDate(item.updated_at)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Editar"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
                          title="Excluir"
                        >
                          <TrashBinIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {menuItems.length === 0 && (
                  <TableRow>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      Nenhum item encontrado.
                    </td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
