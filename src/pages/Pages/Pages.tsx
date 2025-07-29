import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { supabase } from "../../lib/supabase";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../icons";
import PermissionGuard from "../../components/auth/PermissionGuard";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  status: "draft" | "published" | "archived";
  visible_to: "all" | "publisher" | "advertiser";
  created_by: string;
  updated_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function Pages() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    try {
      setLoading(true);
      setError("");

      const { data: pages, error } = await supabase
        .from("pages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPages(pages || []);
    } catch (err) {
      console.error("Error loading pages:", err);
      setError("Erro ao carregar lista de páginas");
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = () => {
    navigate("/pages/new");
  };

  const handleEdit = (page: Page) => {
    navigate(`/pages/edit/${page.id}`);
  };

  const handleDelete = async (pageId: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta página? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const { error } = await supabase.from("pages").delete().eq("id", pageId);

      if (error) throw error;

      setSuccess("Página excluída com sucesso");
      await loadPages();
    } catch (err) {
      console.error("Error deleting page:", err);
      setError("Erro ao excluir página");
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

  if (loading && !pages.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <PermissionGuard
      permission="pages.view"
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-error-500">Acesso não autorizado</div>
        </div>
      }
    >
      <PageMeta title="Páginas | Painel Admin" description="Gerenciar páginas do sistema" />
      <PageBreadcrumb pageTitle="Páginas" />

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
        <Button onClick={handleCreate}>Nova Página</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Título
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Slug
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Visibilidade
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Última Atualização
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Ações
                  </th>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <td className="px-5 py-4 sm:px-6 text-start">
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {page.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {page.slug}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        color={
                          page.status === "published"
                            ? "success"
                            : page.status === "archived"
                            ? "error"
                            : "warning"
                        }
                      >
                        {page.status === "published"
                          ? "Publicado"
                          : page.status === "archived"
                          ? "Arquivado"
                          : "Rascunho"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        color={
                          page.visible_to === "all"
                            ? "primary"
                            : page.visible_to === "publisher"
                            ? "success"
                            : "warning"
                        }
                      >
                        {page.visible_to === "all"
                          ? "Todos os Usuários"
                          : page.visible_to === "publisher"
                          ? "Publishers"
                          : "Anunciantes"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatDate(page.updated_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(page)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Editar"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="p-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
                          title="Excluir"
                        >
                          <TrashBinIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </TableRow>
                ))}

                {pages.length === 0 && (
                  <TableRow>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      Nenhuma página encontrada.
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
