export type Pagination = {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder: "asc" | "desc";
};

export function parsePagination(searchParams: URLSearchParams): Pagination {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20) || 20));
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  const sortBy = searchParams.get("sortBy") ?? undefined;

  return {
    page,
    pageSize,
    sortBy,
    sortOrder
  };
}

export function paginate<T>(items: T[], pagination: Pagination) {
  const start = (pagination.page - 1) * pagination.pageSize;
  return items.slice(start, start + pagination.pageSize);
}
