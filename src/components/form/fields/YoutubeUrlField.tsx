
 
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getYoutubeChannelIdFromUrl } from '../fields/actions/YoutubeUrl/getYoutubeChannelIdFromUrl';
import { handleChannelInfoFlow } from '../fields/actions/YoutubeUrl/channelInfo/handleChannelInfoFlow';
import { showToast } from '../../../utils/toast';

import { autoFillFormFields } from '../fields/actions/YoutubeUrl/autoFill/autoFillFormFields';

interface YoutubeUrlFieldProps {
  field: any;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorClear?: () => void;
  fields?: any[];
  formData?: Record<string, any>;
  setFormData?: (data: Record<string, any>) => void;
}

export default function YoutubeUrlField({
  field,
  value,
  onChange,
  error,
  onErrorClear,
  fields,
  formData,
  setFormData
}: YoutubeUrlFieldProps) {
  const location = useLocation();
  const isEditorialOrPodcastRoute =
    location.pathname.startsWith('/editorial') ||
    location.pathname.startsWith('/pages/meus-podcast');
  // Validação simples para URL do YouTube
  const validateYoutubeUrl = (url: string): boolean => {
    if (!url) return true;
    return (
      url.includes('youtube.com') ||
      url.includes('youtu.be')
    );
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value && !value.match(/^https?:\/\//)) {
      onChange(`https://${value}`);
    }
  };

  const [loading, setLoading] = useState(false);
  // Removido estado de toast
  // Removido o estado de resultado visível

  // Usa a mesma chave da API do channelId
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  const handleExtractChannelId = async () => {
    setLoading(true);
    try {
      const channelId = await getYoutubeChannelIdFromUrl(value, YOUTUBE_API_KEY);
      if (!channelId) {
        showToast('Não foi possível extrair o Channel ID. Verifique a URL ou tente novamente.', 'error');
        setLoading(false);
        return;
      }
      console.log('[YoutubeUrlField] Channel ID extraído:', channelId);
      const channelInfo = await handleChannelInfoFlow(channelId, YOUTUBE_API_KEY);
      if (!channelInfo) {
        setLoading(false);
        return;
      }
      // Auto-preencher campos do formulário
      if (fields && formData && setFormData) {
        autoFillFormFields({
          channelInfo,
          formFields: fields,
          formValues: formData,
          updateFormValue: (fieldId, newValue) => {
            setFormData(prev => ({ ...prev, [fieldId]: newValue }));
          }
        });
      }
    } catch (err) {
      showToast('Não foi possível extrair o Channel ID. Verifique a URL ou tente novamente.', 'error');
      console.error('[YoutubeUrlField] Erro ao extrair Channel ID:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex w-full">
        <input
          type="url"
          value={value || ''}
          onChange={e => {
            const newValue = e.target.value;
            onChange(newValue);
            if (error && onErrorClear && validateYoutubeUrl(newValue)) {
              onErrorClear();
            }
          }}
          onBlur={handleBlur}
          placeholder={field.placeholder || 'https://youtube.com/'}
          required={field.is_required}
          pattern="^https?://.+"
          title="URL must start with http:// or https://"
          className="dark:bg-dark-900 shadow-theme-xs h-11 flex-1 rounded-l-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 transition-all duration-200 focus:border-[#465fff] focus:ring-[3px] focus:ring-[color-mix(in_oklab,#465fff_10%,transparent)] focus:shadow-[inset_0_0_0_3px_color-mix(in_oklab,#465fff_10%,transparent)] dark:focus:border-[#465fff]"
          style={{ padding: 0, paddingLeft: 16, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          data-gtm-form-interact-field-id="0"
          aria-invalid={!!error}
        />
        {!isEditorialOrPodcastRoute && (
          <button
            type="button"
            onClick={handleExtractChannelId}
            disabled={loading || !value}
            className="h-11 w-28 text-sm font-medium text-white bg-brand-500 rounded-r-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: 7, borderBottomRightRadius: 7 }}
          >
            {loading ? '...' : 'Extrair'}
          </button>
        )}
      </div>
  {/* Toast é disparado via showToast util, não precisa renderizar componente aqui */}
    </div>
  );
}
