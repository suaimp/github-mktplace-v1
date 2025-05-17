import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import FormRenderer from '../../components/form/FormRenderer';

export default function FormPreview() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadForm(id);
    }
  }, [id]);

  async function loadForm(formId: string) {
    try {
      setLoading(true);
      setError("");

      const { data: form, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (error) throw error;

      if (!form) {
        throw new Error('Form not found');
      }

      setForm(form);
      
    } catch (err: any) {
      console.error('Error loading form:', err);
      setError(err.message || 'Error loading form');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-error-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-6">
          {form.title}
        </h1>
        
        {form.description && (
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {form.description}
          </p>
        )}

        <FormRenderer formId={form.id} />
      </div>
    </div>
  );
}