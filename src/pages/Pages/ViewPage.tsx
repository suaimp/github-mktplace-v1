import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PageMeta from "../../components/common/PageMeta";
import FormRenderer from "../../components/form/FormRenderer";
import FormEntriesRenderer from "../../components/form/FormEntriesRenderer";
import UserFormEntriesRenderer from "../../components/form/UserFormEntriesRenderer";
import MarketplaceRenderer from "../../components/form/MarketplaceRenderer";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  status: "draft" | "published" | "archived";
}

export default function ViewPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPage();
  }, [slug]);

  async function loadPage() {
    try {
      setLoading(true);
      setError("");

      const { data: page, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) throw error;

      if (!page) {
        navigate("/404");
        return;
      }

      setPage(page);
    } catch (err) {
      console.error("Error loading page:", err);
      setError("Error loading page");
      navigate("/404");
    } finally {
      setLoading(false);
    }
  }

  const renderContent = (content: string) => {
    // Parse shortcodes in content
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Match all shortcode types
    const shortcodeRegex =
      /\[(form|form_entries|user_form_entries|marketplace)\s+id="([^"]+)"\]/g;
    let match;

    while ((match = shortcodeRegex.exec(content)) !== null) {
      // Add text before shortcode
      if (match.index > lastIndex) {
        parts.push(
          <div
            key={`text-${match.index}`}
            dangerouslySetInnerHTML={{
              __html: content.slice(lastIndex, match.index)
            }}
          />
        );
      }

      // Add appropriate component based on shortcode type
      const [_, type, id] = match;
      if (type === "form") {
        parts.push(
          <div key={`form-${id}`} className="w-full my-8">
            <FormRenderer formId={id} />
          </div>
        );
      } else if (type === "form_entries") {
        parts.push(
          <div key={`entries-${id}`} className="w-full my-8">
            <FormEntriesRenderer formId={id} />
          </div>
        );
      } else if (type === "user_form_entries") {
        parts.push(
          <div key={`user-entries-${id}`} className="w-full my-8">
            <UserFormEntriesRenderer formId={id} />
          </div>
        );
      } else if (type === "marketplace") {
        parts.push(
          <div key={`marketplace-${id}`} className="w-full my-8">
            <MarketplaceRenderer formId={id} />
          </div>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <div
          key="text-end"
          dangerouslySetInnerHTML={{ __html: content.slice(lastIndex) }}
        />
      );
    }

    return parts;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-error-500">{error || "Page not found"}</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={page.meta_title || page.title}
        description={page.meta_description || `View ${page.title} page`}
      />

      <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <h1 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {page.title}
        </h1>

        <div className="w-full prose max-w-none dark:prose-invert 
                     prose-headings:text-gray-800
                     prose-p:text-gray-600
                     prose-strong:text-gray-800
                     prose-a:text-brand-600
                     prose-li:text-gray-600
                     prose-blockquote:text-gray-600
                     [&>div]:text-gray-600
                     [&_p]:text-gray-600
                     [&_h1]:text-gray-800
                     [&_h2]:text-gray-800
                     [&_h3]:text-gray-800
                     [&_h4]:text-gray-800
                     [&_h5]:text-gray-800
                     [&_h6]:text-gray-800
                     [&_div_p]:text-gray-600
                     [&_*[style*='color']]:text-gray-600
                     dynamic-content
                     overflow-hidden"
        >
          {renderContent(page.content)}
        </div>
      </div>
    </>
  );
}
