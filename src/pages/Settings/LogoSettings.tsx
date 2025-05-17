import { useState, useEffect } from "react";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import { supabase } from "../../lib/supabase";

interface Settings {
  id: string;
  light_logo: string | null;
  dark_logo: string | null;
  platform_icon: string | null;
}

export default function LogoSettings() {
  const [lightLogo, setLightLogo] = useState<File | null>(null);
  const [darkLogo, setDarkLogo] = useState<File | null>(null);
  const [platformIcon, setPlatformIcon] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentLogos, setCurrentLogos] = useState({
    light: "/images/logo/logo.svg",
    dark: "/images/logo/logo-dark.svg",
    icon: "/images/logo/logo-icon.svg"
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      // First check if settings table has any row
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (settingsError) {
        // If no settings exist, create initial row
        if (settingsError.code === 'PGRST116') {
          const { data: newSettings, error: createError } = await supabase
            .from('settings')
            .insert([{}])
            .select()
            .single();

          if (createError) throw createError;
          setSettings(newSettings);
        } else {
          throw settingsError;
        }
      } else {
        setSettings(settingsData);
        
        // Get public URLs for stored logos if they exist
        if (settingsData.light_logo) {
          const { data: lightUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settingsData.light_logo);
          if (lightUrl) setCurrentLogos(prev => ({ ...prev, light: lightUrl.publicUrl }));
        }
        
        if (settingsData.dark_logo) {
          const { data: darkUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settingsData.dark_logo);
          if (darkUrl) setCurrentLogos(prev => ({ ...prev, dark: darkUrl.publicUrl }));
        }
        
        if (settingsData.platform_icon) {
          const { data: iconUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settingsData.platform_icon);
          if (iconUrl) setCurrentLogos(prev => ({ ...prev, icon: iconUrl.publicUrl }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setError('Erro ao carregar configurações');
    }
  }

  const handleLightLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLightLogo(file);
  };

  const handleDarkLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setDarkLogo(file);
  };

  const handlePlatformIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPlatformIcon(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updates: Partial<Settings> = {};

      // Upload light logo if selected
      if (lightLogo) {
        const fileName = `light-logo-${Date.now()}${lightLogo.name.substring(lightLogo.name.lastIndexOf('.'))}`;
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, lightLogo);

        if (uploadError) throw uploadError;
        updates.light_logo = fileName;
      }

      // Upload dark logo if selected
      if (darkLogo) {
        const fileName = `dark-logo-${Date.now()}${darkLogo.name.substring(darkLogo.name.lastIndexOf('.'))}`;
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, darkLogo);

        if (uploadError) throw uploadError;
        updates.dark_logo = fileName;
      }

      // Upload platform icon if selected
      if (platformIcon) {
        const fileName = `platform-icon-${Date.now()}${platformIcon.name.substring(platformIcon.name.lastIndexOf('.'))}`;
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, platformIcon);

        if (uploadError) throw uploadError;
        updates.platform_icon = fileName;
      }

      // Update settings if any files were uploaded
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('settings')
          .update(updates)
          .eq('id', settings.id);

        if (updateError) throw updateError;

        // Reload settings to update the UI
        await loadSettings();
      }
    } catch (error: any) {
      console.error("Erro ao salvar logos:", error);
      setError(error.message || 'Erro ao salvar logos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      {error && (
        <div className="mb-6 p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <Label>Logo (Tema Claro)</Label>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-12 w-48 flex items-center justify-center bg-white rounded-lg border border-gray-200">
              <img
                src={currentLogos.light}
                alt="Logo tema claro"
                className="h-8 w-auto dark:hidden"
              />
            </div>
            <input
              type="file"
              onChange={handleLightLogoChange}
              accept="image/svg+xml,image/png"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:text-gray-400"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Recomendado: SVG ou PNG em cores escuras para melhor visibilidade no tema claro
          </p>
        </div>

        <div>
          <Label>Logo (Tema Escuro)</Label>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-12 w-48 flex items-center justify-center bg-gray-900 rounded-lg border border-gray-700">
              <img
                src={currentLogos.dark}
                alt="Logo tema escuro"
                className="h-8 w-auto"
              />
            </div>
            <input
              type="file"
              onChange={handleDarkLogoChange}
              accept="image/svg+xml,image/png"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:text-gray-400"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Recomendado: SVG ou PNG em cores claras para melhor visibilidade no tema escuro
          </p>
        </div>

        <div>
          <Label>Ícone da Plataforma (512x512)</Label>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-16 w-16 flex items-center justify-center bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <img
                src={currentLogos.icon}
                alt="Ícone da plataforma"
                className="h-12 w-12"
              />
            </div>
            <input
              type="file"
              onChange={handlePlatformIconChange}
              accept="image/png"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:text-gray-400"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Recomendado: PNG 512x512px para melhor qualidade em todos os dispositivos
          </p>
        </div>

        <div className="flex justify-end pt-6">
          <Button disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>
    </form>
  );
}