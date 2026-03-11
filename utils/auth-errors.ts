/**
 * API error response type for authentication errors
 */
interface ApiErrorResponse {
  statusCode?: number
  data?: {
    error?: string
    data?: {
      email?: string
    }
  }
}

/**
 * Type guard to check if an error is an API error response
 */
export function isApiErrorResponse(err: unknown): err is ApiErrorResponse {
  return err !== null && typeof err === 'object'
}

/**
 * Checks if the error represents an unverified email login attempt.
 * @param err - The error object from the API call
 * @returns true if the error indicates email verification is required
 */
export function isEmailNotVerifiedError(err: unknown): boolean {
  if (!isApiErrorResponse(err)) return false
  return err.statusCode === 403 && err.data?.error === 'email_not_verified'
}

/**
 * Extracts the email address from an unverified email error response.
 * @param err - The error object from the API call
 * @returns The email address or null if not found
 */
export function extractEmailFromError(err: unknown): string | null {
  if (!isApiErrorResponse(err)) return null
  return err.data?.data?.email ?? null
}
