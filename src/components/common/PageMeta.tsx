import { HelmetProvider, Helmet } from "react-helmet-async";
import { useSiteMetadata } from "../../hooks/useSiteMetadata";

interface PageMetaProps {
  title?: string;
  description?: string;
  pageTitle?: string; // Título específico da página (ex: "Dashboard", "Configurações")
}

const PageMeta = ({
  title,
  description,
  pageTitle,
}: PageMetaProps) => {
  const { metadata, isLoading } = useSiteMetadata();

  // Se estiver carregando, usa valores padrão temporários
  if (isLoading) {
    return (
      <Helmet>
        <title>{title || `${pageTitle ? pageTitle + ' - ' : ''}Marketplace`}</title>
        <meta name="description" content={description || 'Marketplace de Serviços Digitais'} />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Helmet>
    );
  }

  // Constrói o título final
  const finalTitle = title || 
    (pageTitle ? `${pageTitle} - ${metadata.site_title}` : metadata.site_title);
  
  const finalDescription = description || metadata.site_description;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="robots" content="noindex, nofollow" />
      <meta name="googlebot" content="noindex, nofollow" />
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;