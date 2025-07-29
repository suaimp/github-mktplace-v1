import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from "../../ui/table";

interface EntriesTableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function EntriesTableSkeleton({ 
  rows = 5, 
  columns = 6 
}: EntriesTableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="overflow-x-auto table-scrollbar">
        <div className="min-w-[1102px]">
          {/* Skeleton para controles da tabela */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/[0.05]">
            <div className="flex items-center space-x-4">
              <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
              <div className="h-9 w-32 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
            </div>
          </div>

          {/* Skeleton para estatísticas */}
          <div className="px-4 py-2 border-b border-gray-100 dark:border-white/[0.05]">
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
          </div>

          {/* Skeleton para tabela */}
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {Array.from({ length: columns }).map((_, index) => (
                  <TableCell
                    key={index}
                    isHeader
                    className="px-5 py-3 h-12"
                  >
                    <div className="h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700" 
                         style={{ width: `${Math.random() * 40 + 60}px` }}></div>
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className="px-5 py-4"
                    >
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700" 
                             style={{ width: `${Math.random() * 60 + 40}%` }}></div>
                        {colIndex === 0 && (
                          <div className="h-3 bg-gray-200 rounded animate-pulse dark:bg-gray-700" 
                               style={{ width: `${Math.random() * 40 + 30}%` }}></div>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Skeleton para paginação */}
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 dark:border-white/[0.05]">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
