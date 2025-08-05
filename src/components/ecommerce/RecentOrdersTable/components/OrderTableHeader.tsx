export function OrderTableHeader() {
  return (
    <thead className="border-gray-100 border-y dark:border-white/[0.05]">
      <tr className="h-8">
        <th className="font-medium text-gray-500 text-start text-xs dark:text-gray-400 w-1/6">
          <div className="flex items-center h-full" style={{paddingLeft: '12px'}}>
            ID
          </div>
        </th>
        <th className="font-medium text-gray-500 text-start text-xs dark:text-gray-400 w-3/6">
          <div className="flex items-center h-full" style={{paddingLeft: '12px'}}>
            Produto
          </div>
        </th>
        <th className="font-medium text-gray-500 text-start text-xs dark:text-gray-400 w-2/6">
          <div className="flex items-center h-full" style={{paddingRight: '12px'}}>
            Status
          </div>
        </th>
      </tr>
    </thead>
  );
}
