export function OrderTableHeader() {
  return (
    <thead className="border-gray-100 border-y dark:border-white/[0.05]">
      <tr className="h-8">
        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px' }}>
          ID
        </th>
        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px' }}>
          URLs
        </th>
        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px' }}>
          Status
        </th>
      </tr>
    </thead>
  );
}
