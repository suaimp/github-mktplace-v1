import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link, useLocation } from "react-router";
import { useLogos } from "../../hooks/useLogos";
import { useSiteDescription } from "./hooks/useSettings";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { logos, loading } = useLogos();
  const { siteDescription, loading: descriptionLoading } = useSiteDescription();
  const location = useLocation();
  
  // Não exibir a imagem lateral na página de verificação de email
  const shouldShowSideImage = location.pathname !== "/verify-email";

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        {shouldShowSideImage && (
          <div className="items-center hidden w-full h-full lg:w-1/2 lg:grid bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/images/banner/computer-room.jpg)'}}>
            <div className="relative flex items-center justify-center z-1 bg-black/50 w-full h-full">
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <Link to="/" className="block mb-4">
                  {loading ? (
                    <div className="h-12 w-48 bg-gray-300 animate-pulse rounded"></div>
                  ) : (
                    <img
                      className="h-12"
                      src={logos.dark}
                      alt="Logo"
                    />
                  )}
                </Link>
                <p className="text-center text-white dark:text-white">
                  {descriptionLoading ? (
                    <span className="inline-block w-48 h-4 bg-gray-300 animate-pulse rounded"></span>
                  ) : (
                    siteDescription
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}