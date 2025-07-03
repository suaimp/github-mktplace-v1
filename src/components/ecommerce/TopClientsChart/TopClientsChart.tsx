import React from "react";

export default function TopClientsChart() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Top clientes que compram</h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6">
              <path fillRule="evenodd" clipRule="evenodd" d="M10.2441 6C10.2441 5.0335 11.0276 4.25 11.9941 4.25H12.0041C12.9706 4.25 13.7541 5.0335 13.7541 6C13.7541 6.9665 12.9706 7.75 12.0041 7.75H11.9941C11.0276 7.75 10.2441 6.9665 10.2441 6ZM10.2441 18C10.2441 17.0335 11.0276 16.25 11.9941 16.25H12.0041C12.9706 16.25 13.7541 17.0335 13.7541 18C13.7541 18.9665 12.9706 19.75 12.0041 19.75H11.9941C11.0276 19.75 10.2441 18.9665 10.2441 18ZM11.9941 10.25C11.0276 10.25 10.2441 11.0335 10.2441 12C10.2441 12.9665 11.0276 13.75 11.9941 13.75H12.0041C12.9706 13.75 13.7541 12.9665 13.7541 12C13.7541 11.0335 12.9706 10.25 12.0041 10.25H11.9941Z" fill="currentColor"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="my-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <span className="text-gray-400 text-theme-xs"> Fonte </span>
          <span className="text-right text-gray-400 text-theme-xs"> Visualizações da página </span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-gray-500 text-theme-sm dark:text-gray-400">Google</span>
          <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">4.7K</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-gray-500 text-theme-sm dark:text-gray-400">Facebook</span>
          <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">3.4K</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-gray-500 text-theme-sm dark:text-gray-400">Threads</span>
          <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">2.9K</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-gray-500 text-theme-sm dark:text-gray-400">Google</span>
          <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">1.5K</span>
        </div>
      </div>
    </div>
  );
} 