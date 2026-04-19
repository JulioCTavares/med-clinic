import type { PaginatedResult } from '@/shared/types/paginated-result'

const MAX_LIMIT = 100

/**
 * Busca todas as páginas de um endpoint paginado (limite máximo por página = 100, igual à API).
 */
export async function fetchAllPaginated<T>(
  fetcher: (page: number, limit: number) => Promise<PaginatedResult<T>>,
): Promise<T[]> {
  const first = await fetcher(1, MAX_LIMIT)
  if (first.meta.totalPages <= 1) return first.data
  const chunks: T[] = [...first.data]
  for (let p = 2; p <= first.meta.totalPages; p++) {
    const next = await fetcher(p, MAX_LIMIT)
    chunks.push(...next.data)
  }
  return chunks
}
