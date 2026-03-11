// ============================================================
// API Response Types
// ============================================================

/** Standard API response wrapper */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

/** Pagination metadata */
export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

/** Pagination links */
export interface PaginationLinks {
  first: string
  last: string
  prev: string | null
  next: string | null
}

/** Paginated response */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  links: PaginationLinks
}

/** API error response */
export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
}

/** Validation error */
export interface ValidationError {
  field: string
  messages: string[]
}

/** Batch delete response */
export interface BatchDeleteResponse {
  success: boolean
  message: string
  data: { deleted_count: number }
}
