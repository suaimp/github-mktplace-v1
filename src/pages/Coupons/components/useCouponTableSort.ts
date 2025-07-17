import { useState, useCallback } from "react";

export type SortDirection = "asc" | "desc";

export function useCouponTableSort(initialField: string = "created_at", initialDirection: SortDirection = "desc") {
  const [sortField, setSortField] = useState<string>(initialField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);

  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField]);

  return { sortField, sortDirection, handleSort, setSortField, setSortDirection };
} 