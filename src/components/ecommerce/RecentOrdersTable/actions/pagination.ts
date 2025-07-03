// Utilitário de paginação para RecentOrdersTable

export function paginate<T>(items: T[], page: number, perPage: number): T[] {
  if (!Array.isArray(items) || perPage <= 0) return [];
  const start = (page - 1) * perPage;
  const end = page * perPage;
  return items.slice(start, end);
} 