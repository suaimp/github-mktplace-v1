import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PageMeta from "../../components/common/PageMeta";
import FormRenderer from "../../components/form/FormRenderer";

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
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      if (!page) {
        navigate('/404');
        return;
      }

      setPage(page);
      
    } catch (err) {
      console.error('Error loading page:', err);
      setError('Error loading page');
      navigate('/404');
    } finally {
      setLoading(false);
    }
  }

  const renderContent = (content: string) => {
    // Parse shortcodes in content
    const formRegex = /\[form id="([^"]+)"\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = formRegex.exec(content)) !== null) {
      // Add text before shortcode
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      // Add form component
      parts.push(
        <div key={match[1]} className="w-full">
          <FormRenderer formId={match[1]} />
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-error-500">{error || 'Page not found'}</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={page.meta_title || page.title}
        description={page.meta_description || `View ${page.title} page`}
      />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {page.title}
        </h1>

        <div className="prose max-w-none dark:prose-invert prose-headings:text-gray-800 dark:prose-headings:text-white/90 prose-p:text-gray-500 dark:prose-p:text-gray-400">
          {renderContent(page.content)}
        </div>
      </div>
    </>
  );
}