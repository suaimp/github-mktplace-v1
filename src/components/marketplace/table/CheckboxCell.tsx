import React from "react";

interface CheckboxCellProps {
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isHeader?: boolean;
}

/**
 * Componente para células de checkbox centralizadas
 */
export const CheckboxCell: React.FC<CheckboxCellProps> = ({ 
  id, 
  checked, 
  onChange, 
  isHeader = false 
}) => {
  const cellContent = (
    <div className="flex items-center justify-center">
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          className="sr-only"
          checked={checked}
          onChange={onChange}
        />
        <label
          htmlFor={id}
          className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-[1.25px] hover:border-brand-500 dark:hover:border-brand-500 ${
            checked
              ? "border-brand-500 bg-brand-500"
              : "bg-transparent border-gray-300 dark:border-gray-700"
          }`}
        >
          <span className={checked ? "" : "opacity-0"}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                stroke="white"
                strokeWidth="1.94437"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </span>
        </label>
      </div>
    </div>
  );

  if (isHeader) {
    return (
      <th
        scope="col"
        className="w-10 px-2 py-2.5 text-left text-theme-2xs xl:text-sm font-semibold text-gray-900 dark:text-white"
      >
        {cellContent}
      </th>
    );
  }

  return (
    <td className="whitespace-nowrap px-2 py-2 text-theme-2xs xl:text-sm checkbox-cell">
      {cellContent}
    </td>
  );
};

export default CheckboxCell;
