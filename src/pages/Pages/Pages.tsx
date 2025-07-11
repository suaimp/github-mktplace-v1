import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { supabase } from "../../lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
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
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPages(pages || []);
      
    } catch (err) {
      console.error('Error loading pages:', err);
      setError('Error loading page list');
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = () => {
    navigate('/pages/new');
  };

  const handleEdit = (page: Page) => {
    navigate(`/pages/edit/${page.id}`);
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page? This action cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      setSuccess("Page deleted successfully");
      await loadPages();

    } catch (err) {
      console.error('Error deleting page:', err);
      setError('Error deleting page');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !pages.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <PermissionGuard 
      permission="pages.view"
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-error-500">Access not authorized</div>
        </div>
      }
    >
      <PageMeta
        title="Pages | Admin Panel"
        description="Manage system pages"
      />
      <PageBreadcrumb pageTitle="Pages" />

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
        <Button onClick={handleCreate}>
          New Page
        </Button>
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
                    Title
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Slug
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Visibility
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Last Update
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {page.title}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {page.slug}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
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
                          ? "Published"
                          : page.status === "archived"
                          ? "Archived"
                          : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
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
                          ? "All Users"
                          : page.visible_to === "publisher"
                          ? "Publishers"
                          : "Advertisers"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatDate(page.updated_at)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(page)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="p-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
                          title="Delete"
                        >
                          <TrashBinIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {pages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No pages found
                    </TableCell>
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