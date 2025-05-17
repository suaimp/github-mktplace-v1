import { Link } from "react-router-dom";

interface HeaderLogoProps {
  logos: {
    light: string;
    dark: string;
  };
  loading?: boolean;
}

export default function HeaderLogo({ logos, loading }: HeaderLogoProps) {
  return (
    <Link to="/" className="lg:hidden">
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