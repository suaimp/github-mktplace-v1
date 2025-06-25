interface OrderData {
  id: number;
  product: string;
  category: string;
  countryFlag: string;
  cr: string;
  value: string;
}

export default function RecentOrdersTable() {
  const ordersData: OrderData[] = [
    {
      id: 1,
      product: "TailGrids",
      category: "UI Kit",
      countryFlag: "src/images/country/country-01.svg",
      cr: "Dashboard",
      value: "$12,499"
    },
    {
      id: 2,
      product: "GrayGrids",
      category: "Templates",
      countryFlag: "src/images/country/country-03.svg",
      cr: "Dashboard",
      value: "$5,498"
    },
    {
      id: 3,
      product: "Uideck",
      category: "Templates",
      countryFlag: "src/images/country/country-04.svg",
      cr: "Dashboard",
      value: "$4,521"
    },
    {
      id: 4,
      product: "FormBold",
      category: "SaaS",
      countryFlag: "src/images/country/country-05.svg",
      cr: "Dashboard",
      value: "$13,843"
    },
    {
      id: 5,
      product: "NextAdmin",
      category: "Dashboard",
      countryFlag: "src/images/country/country-06.svg",
      cr: "Dashboard",
      value: "$7,523"
    },
    {
      id: 6,
      product: "Form Builder",
      category: "SaaS",
      countryFlag: "src/images/country/country-07.svg",
      cr: "Dashboard",
      value: "$1,377"
    },
    {
      id: 7,
      product: "AyroUI",
      category: "UI Kit",
      countryFlag: "src/images/country/country-08.svg",
      cr: "Dashboard",
      value: "$599,00"
    }
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Últimas Compras
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              ></path>
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              ></path>
            </svg>
            Filter
          </button>

          <button className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Ver todos
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="border-t border-gray-100 dark:border-gray-800">
              <th className="px-6 py-3 text-left">
                <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  Produtos
                </p>
              </th>
              <th className="px-6 py-3 text-left">
                <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  Categoria
                </p>
              </th>
              <th className="px-6 py-3 text-left">
                <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  País
                </p>
              </th>
              <th className="px-6 py-3 text-left">
                <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  CR
                </p>
              </th>
              <th className="px-6 py-3 text-left">
                <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  Valor
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {ordersData.map((order) => (
              <tr
                key={order.id}
                className="border-t border-gray-100 dark:border-gray-800"
              >
                <td className="px-6 py-3.5">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {order.product}
                  </p>
                </td>
                <td className="px-6 py-3.5">
                  <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.category}
                  </p>
                </td>
                <td className="px-6 py-3.5">
                  <div className="w-5 h-5 overflow-hidden rounded-full">
                    <img src={order.countryFlag} alt="country" />
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.cr}
                  </p>
                </td>
                <td className="px-6 py-3.5">
                  <p className="text-theme-sm text-success-600">
                    {order.value}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
