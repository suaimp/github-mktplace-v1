import { useState } from "react";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import SiteMetaContainer from "./components/SiteMetaContainer";
import { SiteSettingsService } from "../../services/db-services/settings-services/siteSettingsService";
import { LogoService, LogoFile } from "../../services/db-services/settings-services/logoService";
import { SiteMetaFormData } from "./types";
import { useSettingsToast } from "./hooks/useSettingsToast";
import { useLogoSettings } from "./hooks/useLogoSettings";

export default function LogoSettings() {
  const [lightLogo, setLightLogo] = useState<File | null>(null);
  const [darkLogo, setDarkLogo] = useState<File | null>(null);
  const [platformIcon, setPlatformIcon] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [siteMetaData, setSiteMetaData] = useState<SiteMetaFormData>({
    site_title: '',
    site_description: ''
  });

  const { showSuccessToast, showErrorToast } = useSettingsToast();
  const { settings, currentLogos, loadSettings } = useLogoSettings();

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

  const handleSiteMetaChange = (data: SiteMetaFormData) => {
    setSiteMetaData(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings?.id) return;
    
    setLoading(true);
    
    try {
      // Atualizar metadados do site se houver alterações
      if (siteMetaData.site_title || siteMetaData.site_description) {
        await SiteSettingsService.updateSiteMetaData(siteMetaData);
      }

      // Preparar arquivos de logo para upload
      const logoFiles: LogoFile[] = [];
      
      if (lightLogo) {
        logoFiles.push({ file: lightLogo, type: 'light' });
      }
      
      if (darkLogo) {
        logoFiles.push({ file: darkLogo, type: 'dark' });
      }
      
      if (platformIcon) {
        logoFiles.push({ file: platformIcon, type: 'icon' });
      }

      // Validar arquivos de logo
      if (logoFiles.length > 0) {
        const validationErrors = LogoService.validateMultipleLogos(logoFiles);
        if (validationErrors.length > 0) {
          showErrorToast(validationErrors.join(', '));
          return;
        }

        // Fazer upload dos logos
        const logoUpdates = await LogoService.uploadMultipleLogos(logoFiles);
        
        // Atualizar no banco de dados
        await LogoService.updateLogosInDatabase(settings.id, logoUpdates);
        
        // Recarregar configurações para atualizar a UI
        await loadSettings();
      }

      // Show success toast
      showSuccessToast();
      
      // Reset form files
      setLightLogo(null);
      setDarkLogo(null);
      setPlatformIcon(null);
      
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error);
      showErrorToast(error.message || 'Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-8">
      {/* Seção de Metadados do Site */}
      <SiteMetaContainer 
        onDataChange={handleSiteMetaChange}
        hideSubmitButton={true}
        externalLoading={loading}
      />

      {/* Separador visual */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
        <form onSubmit={handleSubmit}>
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
        </div>

        <div className="flex justify-end pt-6">
          <Button disabled={loading}>
            {loading ? "Salvando..." : "Salvar Todas as Configurações"}
          </Button>
        </div>
          </div>
        </form>
      </div>
    </div>
  );
}