import { Link } from "react-router-dom";
import { useUserNavigationPaths } from "../marketplace/navigation";

interface HeaderLogoProps {
  logos: {
    light: string;
    dark: string;
  };
  loading?: boolean;
}

export default function HeaderLogo({ logos, loading }: HeaderLogoProps) {
  const { paths } = useUserNavigationPaths();
  
  return (
    <Link to={paths.home} className="lg:hidden">
      {loading ? (
        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded dark:bg-gray-800"></div>
      ) : (
        <>
          <img
            className="dark:hidden h-8"
            src={logos.light}
            alt="Logo"
          />
          <img
            className="hidden dark:block h-8"
            src={logos.dark}
            alt="Logo"
          />
        </>
      )}
    </Link>
  );
}