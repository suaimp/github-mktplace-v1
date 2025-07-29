import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { supabase } from "../../lib/supabase";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import TextArea from "../../components/form/input/TextArea";
import Select from "../../components/form/Select";
import PermissionGuard from "../../components/auth/PermissionGuard";
import * as Icons from "../../icons";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  path: string | null;
  parent_id: string | null;
  position: number;
  is_visible: boolean;
  visible_to: "all" | "publisher" | "advertiser" | null;
  requires_permission: string | null;
}

interface Page {
  id: string;
  title: string;
  slug: string;
}

interface ValidationErrors {
  name?: string;
  path?: string;
  position?: string;
}

export default function EditMenuItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [parentMenuItems, setParentMenuItems] = useState<MenuItem[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "",
    path: "",
    parent_id: "",
    position: 0,
    is_visible: true,
    visible_to: "all" as "all" | "publisher" | "advertiser" | null,
    selectedPage: "" // New field to track selected page
  });

  // Get available icons from the icons directory
  const availableIcons = Object.keys(Icons)
    .filter((key) => key !== "default") // Filter out default export
    .map((iconName) => ({
      value: iconName,
      label: iconName, // label agora é string
      icon: React.createElement(Icons[iconName as keyof typeof Icons]) // icon recebe o JSX
    }));

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadParentMenuItems(),
          loadPages(),
          id ? loadMenuItem(id) : Promise.resolve()
        ]);
      } catch (err) {
        console.error("Error initializing data:", err);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [id]);

  async function loadParentMenuItems() {
    try {
      const { data: items, error } = await supabase
        .from("menu_items")
        .select("*")
        .is("parent_id", null)
        .order("position", { ascending: true });

      if (error) throw error;
      setParentMenuItems(items || []);
    } catch (err) {
      console.error("Error loading parent menu items:", err);
      throw err;
    }
  }

  async function loadPages() {
    try {
      const { data: pages, error } = await supabase
        .from("pages")
        .select("id, title, slug")
        .eq("status", "published")
        .order("title", { ascending: true });

      if (error) throw error;
      setPages(pages || []);
    } catch (err) {
      console.error("Error loading pages:", err);
      throw err;
    }
  }

  async function loadMenuItem(menuId: string) {
    try {
      const { data: item, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("id", menuId)
        .single();

      if (error) throw error;

      if (item) {
        // First set basic form data
        setForm({
          name: item.name,
          description: item.description || "",
          icon: item.icon || "",
          path: item.path || "",
          parent_id: item.parent_id || "",
          position: item.position,
          is_visible: item.is_visible,
          visible_to: item.visible_to || "all",
          selectedPage: ""
        });

        // Then check if the path matches a page
        if (item.path) {
          const pageSlugMatch = item.path.match(/^\/pages\/(.+)$/);
          if (pageSlugMatch) {
            const slug = pageSlugMatch[1];
            const matchingPage = pages.find((p) => p.slug === slug);
            if (matchingPage) {
              setForm((prev) => ({ ...prev, selectedPage: matchingPage.id }));
            }
          }
        }
      }
    } catch (err) {
      console.error("Error loading menu item:", err);
      throw err;
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (!form.name.trim()) {
      errors.name = "Nome é obrigatório";
      isValid = false;
    }

    if (
      !form.selectedPage &&
      form.path &&
      !form.path.startsWith("/") &&
      !form.path.startsWith("#")
    ) {
      errors.path = "Caminho deve começar com / ou #";
      isValid = false;
    }

    if (form.position < 0) {
      errors.position = "Posição deve ser um número positivo";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");

      // Get the final path based on selected page or manual input
      let finalPath = form.path;
      if (form.selectedPage) {
        const selectedPage = pages.find((p) => p.id === form.selectedPage);
        if (selectedPage) {
          finalPath = `/pages/${selectedPage.slug}`;
        }
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const menuItemData = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        icon: form.icon || null,
        path: finalPath.trim() || null,
        parent_id: form.parent_id || null,
        position: form.position,
        is_visible: form.is_visible,
        visible_to: form.visible_to,
        updated_by: user.id
      };

      if (id) {
        // Update existing item
        const { error } = await supabase
          .from("menu_items")
          .update(menuItemData)
          .eq("id", id);

        if (error) throw error;
        setSuccess("Item do menu atualizado com sucesso");
      } else {
        // Create new item
        const { error } = await supabase.from("menu_items").insert([
          {
            ...menuItemData,
            created_by: user.id
          }
        ]);

        if (error) throw error;
        setSuccess("Item do menu criado com sucesso");
      }

      // Redirect after short delay
      setTimeout(() => {
        navigate("/menu-dash");
      }, 1500);
    } catch (err) {
      console.error("Error saving menu item:", err);
      setError("Erro ao salvar item do menu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <PermissionGuard
      permission="menu.edit"
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-error-500">Acesso não autorizado</div>
        </div>
      }
    >
      <PageMeta
        title={`${id ? "Editar" : "Novo"} Item do Menu | Painel Admin`}
        description="Gerenciar itens do menu do dashboard"
      />
      <PageBreadcrumb pageTitle={`${id ? "Editar" : "Novo"} Item do Menu`} />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
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

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div>
            <Label>
              Nome <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={!!validationErrors.name}
              hint={validationErrors.name}
              required
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <TextArea
              value={form.description}
              onChange={(value) => setForm({ ...form, description: value })}
              rows={3}
            />
          </div>

          <div>
            <Label>Ícone</Label>
            <Select
              options={[{ value: "", label: "Nenhum" }, ...availableIcons]}
              value={form.icon}
              onChange={(value) => setForm({ ...form, icon: value })}
            />
          </div>

          <div>
            <Label>Link para Página</Label>
            <Select
              options={[
                { value: "", label: "Nenhum (usar caminho personalizado)" },
                ...pages.map((page) => ({
                  value: page.id,
                  label: page.title
                }))
              ]}
              value={form.selectedPage}
              onChange={(value) =>
                setForm({
                  ...form,
                  selectedPage: value,
                  path: value ? "" : form.path
                })
              }
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Selecione uma página existente para vincular, ou deixe vazio para usar um
              caminho personalizado
            </p>
          </div>

          {!form.selectedPage && (
            <div>
              <Label>Caminho</Label>
              <Input
                type="text"
                value={form.path}
                onChange={(e) => setForm({ ...form, path: e.target.value })}
                error={!!validationErrors.path}
                hint={validationErrors.path}
                placeholder="/exemplo/caminho ou #submenu"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Use # para criar um grupo de submenu sem um link direto
              </p>
            </div>
          )}

          <div>
            <Label>Item de Menu Pai</Label>
            <Select
              options={[
                { value: "", label: "Nenhum (item raiz)" },
                ...parentMenuItems
                  .filter((item) => !id || item.id !== id)
                  .map((item) => ({
                    value: item.id,
                    label: item.name
                  }))
              ]}
              value={form.parent_id}
              onChange={(value) => setForm({ ...form, parent_id: value })}
            />
          </div>

          <div>
            <Label>
              Posição <span className="text-error-500">*</span>
            </Label>
            <Input
              type="number"
              value={form.position}
              onChange={(e) =>
                setForm({ ...form, position: parseInt(e.target.value) })
              }
              error={!!validationErrors.position}
              hint={validationErrors.position}
              min="0"
              required
            />
          </div>

          <div>
            <Label>Visibilidade</Label>
            <Select
              options={[
                { value: "all", label: "Todos os Usuários" },
                { value: "publisher", label: "Apenas Publishers" },
                { value: "advertiser", label: "Apenas Anunciantes" }
              ]}
              value={form.visible_to ?? ""}
              onChange={(value) =>
                setForm({
                  ...form,
                  visible_to: value as "all" | "publisher" | "advertiser"
                })
              }
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Controle qual tipo de usuário pode ver este item do menu
            </p>
          </div>

          <div className="flex gap-4 pt-6">
            <Button variant="outline" onClick={() => navigate("/menu-dash")}>
              Cancelar
            </Button>
            <Button disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </PermissionGuard>
  );
}
