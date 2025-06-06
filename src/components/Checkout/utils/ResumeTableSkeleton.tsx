import React from "react";

interface ResumeTableSkeletonProps {
  rowCount?: number;
}

const ResumeTableSkeleton: React.FC<ResumeTableSkeletonProps> = ({
  rowCount = 3
}) => {
  const fakeRows = Array.from({ length: rowCount });
  return (
    <div className="overflow-hidden bg-white dark:bg-white/[0.03] p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Resumo do Pedido
      </h2>
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 animate-pulse">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-3.5 text-left text-sm text-gray-700 dark:text-gray-200 font-normal">
                Produto (URL)
              </th>
              <th className="px-3 py-3.5 text-center text-sm text-gray-700 dark:text-gray-200 font-normal">
                Qtd
              </th>
              <th className="px-3 py-3.5 text-center text-sm text-gray-700 dark:text-gray-200 font-normal">
                Nicho
              </th>
              <th className="px-3 py- text-center text-sm text-gray-700 dark:text-gray-200 font-normal">
                Pacote de Conteúdo
              </th>
              <th className="px-3 py-3.5 text-center text-sm text-gray-700 dark:text-gray-200 font-normal">
                Palavras
              </th>
              <th className="px-3 py-3.5 text-center text-sm text-gray-700 dark:text-gray-200 font-normal">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {fakeRows.map((_, idx) => (
              <tr key={idx}>
                {Array.from({ length: 6 }).map((_, colIdx) => (
                  <td key={colIdx} className="px-3 py-4">
                    <div
                      className="rounded bg-gray-200 dark:bg-gray-700 w-full"
                      style={{ height: 38.98, minHeight: 16 }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResumeTableSkeleton;
