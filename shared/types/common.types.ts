export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
}

export interface ApiError {
  error: string
  message: string
  details?: Record<string, unknown>
}
