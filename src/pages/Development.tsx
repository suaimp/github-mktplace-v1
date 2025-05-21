import PageMeta from "../components/common/PageMeta";

export default function Development() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <div className="mx-auto w-full max-w-[472px] text-center">
        <h1 className="mb-8 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
          Em Desenvolvimento
        </h1>

        <img
          src="/images/error/maintenance.svg"
          alt="Em Desenvolvimento"
          className="dark:hidden"
        />
        <img
          src="/images/error/maintenance-dark.svg"
          alt="Em Desenvolvimento"
          className="hidden dark:block"
        />

        <p className="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
          Esta página está em desenvolvimento. Para acessar o painel
          administrativo, utilize a URL /adm.
        </p>
      </div>

      <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
        &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
