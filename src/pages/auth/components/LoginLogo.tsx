import { useLogos } from '../../../hooks/useLogos';
import { useSiteDescription } from '../hooks/useSettings';

/**
 * Componente responsável por exibir a logo e descrição durante a inicialização
 * Seguindo o princípio da Responsabilidade Única (SRP)
 */
export const LoginLogo: React.FC = () => {
  const { logos, loading: logosLoading } = useLogos();
  const { siteDescription, loading: descriptionLoading } = useSiteDescription();

  return (
    <div className="flex flex-col items-center mb-8">
      <div className="mb-4">
        {logosLoading ? (
          <div className="h-16 w-48 bg-gray-300 animate-pulse rounded dark:bg-gray-700"></div>
        ) : (
          <img
            className="h-16"
            src={logos.light}
            alt="Logo"
          />
        )}
      </div>
      <p className="text-center text-gray-600 dark:text-gray-400">
        {descriptionLoading ? (
          <span className="inline-block w-48 h-4 bg-gray-300 animate-pulse rounded dark:bg-gray-700"></span>
        ) : (
          siteDescription
        )}
      </p>
    </div>
  );
};
