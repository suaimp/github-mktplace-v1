import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import MarketplaceTable from '../marketplace/MarketplaceTable';
import { FavoritesProvider } from '../marketplace/favorite_sites/context/FavoritesContext';

interface MarketplaceRendererProps {
  formId: string;
}

export default function MarketplaceRenderer({ formId }: MarketplaceRendererProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formExists, setFormExists] = useState(false);

  useEffect(() => {
    checkFormExists();
  }, [formId]);

  async function checkFormExists() {
    try {
      setLoading(true);
      setError("");

      // Check if form exists and is published
      const { data, error } = await supabase
        .from('forms')
        .select('id')
        .eq('id', formId)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      
      setFormExists(!!data);
      
    } catch (err) {
      console.error('Error checking form:', err);
      setError('Error loading marketplace data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return null; // Loading state is handled by MarketplaceTable
  }

  if (error) {
    return (
      <div className="p-4 text-center text-error-500">
        {error}
      </div>
    );
  }

  if (!formExists) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Formulário não encontrado ou não está publicado
      </div>
    );
  }

  return (
    <div className="w-full xl:-mx-6">
      <div className="w-full xl:overflow-x-auto xl:px-6">
        <FavoritesProvider>
          <MarketplaceTable formId={formId} />
        </FavoritesProvider>
      </div>
    </div>
  );
}