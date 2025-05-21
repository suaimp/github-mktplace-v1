import { useState, useEffect } from "react";
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

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: "draft" | "published" | "archived";
  visible_to: "all" | "publisher" | "advertiser";
}

interface ValidationErrors {
  title?: string;
  slug?: string;
  content?: string;
}

export default function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    status: "draft" as const,
    visible_to: "all" as const
  });

  useEffect(() => {
    if (id) {
      loadPage(id);
    }
  }, [id]);

  // Generate slug from title
  useEffect(() => {
    if (!slugEdited && form.title) {
      const generatedSlug = generateSlug(form.title);
      setForm((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [form.title, slugEdited]);

  function generateSlug(title: string): string {
    return title
      .toLowerCase() // Convert to lowercase
      .normalize("NFD") // Normalize diacritics
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
  }

  async function loadPage(pageId: string) {
    try {
      setLoading(true);
      setError("");

      const { data: page, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", pageId)
        .single();

      if (error) throw error;

      if (page) {
        setForm({
          title: page.title,
          slug: page.slug,
          content: page.content,
          status: page.status,
          visible_to: page.visible_to
        });
        setSlugEdited(true); // Don't auto-generate slug for existing pages
      }
    } catch (err) {
      console.error("Error loading page:", err);
      setError("Error loading page");
      navigate("/pages");
    } finally {
      setLoading(false);
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (!form.title.trim()) {
      errors.title = "Title is required";
      isValid = false;
    }

    if (!form.slug.trim()) {
      errors.slug = "Slug is required";
      isValid = false;
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
      errors.slug =
        "Slug must contain only lowercase letters, numbers, and hyphens";
      isValid = false;
    }

    if (!form.content.trim()) {
      errors.content = "Content is required";
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

      // Check if slug is already in use
      const { data: existingPages, error: slugCheckError } = await supabase
        .from("pages")
        .select("id")
        .eq("slug", form.slug.trim());

      if (slugCheckError) throw slugCheckError;

      // Check if slug exists and belongs to a different page
      if (existingPages && existingPages.length > 0) {
        const slugExists = existingPages.some((page) => page.id !== id);
        if (slugExists) {
          setValidationErrors((prev) => ({
            ...prev,
            slug: "This slug is already in use"
          }));
          return;
        }
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const pageData = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        content: form.content.trim(),
        status: form.status,
        visible_to: form.visible_to,
        updated_by: user.id
      };

      if (id) {
        // Update existing page
        const { error } = await supabase
          .from("pages")
          .update(pageData)
          .eq("id", id);

        if (error) throw error;
        setSuccess("Page updated successfully");
      } else {
        // Create new page
        const { error } = await supabase.from("pages").insert([
          {
            ...pageData,
            created_by: user.id
          }
        ]);

        if (error) throw error;
        setSuccess("Page created successfully");
      }

      // Redirect after short delay
      setTimeout(() => {
        navigate("/pages");
      }, 1500);
    } catch (err) {
      console.error("Error saving page:", err);
      setError("Error saving page");
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setForm((prev) => ({ ...prev, title: newTitle }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEdited(true);
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  };

  if (loading && !form.title) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <PermissionGuard
      permission="pages.edit"
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-error-500">Access not authorized</div>
        </div>
      }
    >
      <PageMeta
        title={`${id ? "Edit" : "New"} Page | Admin Panel`}
        description="Manage system pages"
      />
      <PageBreadcrumb pageTitle={`${id ? "Edit" : "New"} Page`} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {error && (
          <div className="p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <Label>
                Title <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                value={form.title}
                onChange={handleTitleChange}
                error={!!validationErrors.title}
                hint={validationErrors.title}
                required
              />
            </div>

            <div>
              <Label>
                Slug <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                value={form.slug}
                onChange={handleSlugChange}
                error={!!validationErrors.slug}
                hint={validationErrors.slug}
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                The URL-friendly version of the title. Will be auto-generated
                from title if left empty.
              </p>
            </div>

            <div>
              <Label>
                Content <span className="text-error-500">*</span>
              </Label>
              <TextArea
                value={form.content}
                onChange={(value) => setForm({ ...form, content: value })}
                rows={20}
                error={!!validationErrors.content}
                hint={validationErrors.content}
                required
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" },
                  { value: "archived", label: "Archived" }
                ]}
                value={form.status}
                onChange={(value) =>
                  setForm({
                    ...form,
                    status: value as "draft" | "published" | "archived"
                  })
                }
              />
            </div>

            <div>
              <Label>Visibility</Label>
              <Select
                options={[
                  { value: "all", label: "All Users" },
                  { value: "publisher", label: "Publishers Only" },
                  { value: "advertiser", label: "Advertisers Only" }
                ]}
                value={form.visible_to}
                onChange={(value) =>
                  setForm({
                    ...form,
                    visible_to: value as "all" | "publisher" | "advertiser"
                  })
                }
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Control which type of users can view this page
              </p>
            </div>

            <div className="flex gap-4 pt-6">
              <Button variant="outline" onClick={() => navigate("/pages")}>
                Cancel
              </Button>
              <Button disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </PermissionGuard>
  );
}
