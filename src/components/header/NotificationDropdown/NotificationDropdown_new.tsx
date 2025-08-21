import { useState } from "react";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { useNotifications } from "./hooks/useNotifications";
import { NotificationItemComponent, EmptyNotifications } from "./components";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { state, actions } = useNotifications();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
    if (state.hasUnread) {
      // Marcar todas como visualizadas após abrir o dropdown
      setTimeout(() => {
        actions.markAllAsRead();
      }, 1000);
    }
  };

  const handleRefresh = () => {
    actions.refresh();
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !state.hasUnread ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.72865 12.9389 4.79248 10.5 4.79248H9.50004C7.06121 4.79248 5.12504 6.72865 5.12504 9.16748V14.4591H14.875ZM8.62504 17.7091C8.62504 17.1568 9.07275 16.7091 9.62504 16.7091H10.375C10.9273 16.7091 11.375 17.1568 11.375 17.7091C11.375 18.8137 10.4796 19.7091 9.375 19.7091H10.625C9.52046 19.7091 8.62504 18.8137 8.62504 17.7091Z"
            fill=""
          />
        </svg>
      </button>
      
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notificações
            {state.unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full dark:bg-orange-900 dark:text-orange-200">
                {state.unreadCount}
              </span>
            )}
          </h5>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              disabled={state.isLoading}
            >
              <svg
                className={`w-5 h-5 ${state.isLoading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={toggleDropdown}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7793C6.98744 18.0722 6.51256 18.0722 6.21967 17.7793C5.92678 17.4864 5.92678 17.0116 6.21967 16.7187L10.9383 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
        
        {state.error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          </div>
        )}

        {state.notifications.length === 0 ? (
          <EmptyNotifications isLoading={state.isLoading} />
        ) : (
          <>
            <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
              {state.notifications.map((notification) => (
                <NotificationItemComponent
                  key={notification.id}
                  notification={notification}
                  onClose={closeDropdown}
                  onMarkAsRead={actions.markAsRead}
                />
              ))}
            </ul>
          </>
        )}
      </Dropdown>
    </div>
  );
}
