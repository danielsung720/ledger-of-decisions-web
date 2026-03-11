import { describe, it, expect } from 'vitest'
import {
  isApiErrorResponse,
  isEmailNotVerifiedError,
  extractEmailFromError,
} from '~/utils/auth-errors'

describe('auth-errors', () => {
  describe('isApiErrorResponse', () => {
    it('returns true for object', () => {
      expect(isApiErrorResponse({})).toBe(true)
      expect(isApiErrorResponse({ statusCode: 403 })).toBe(true)
    })

    it('returns false for null', () => {
      expect(isApiErrorResponse(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isApiErrorResponse(undefined)).toBe(false)
    })

    it('returns false for primitives', () => {
      expect(isApiErrorResponse('string')).toBe(false)
      expect(isApiErrorResponse(123)).toBe(false)
      expect(isApiErrorResponse(true)).toBe(false)
    })
  })

  describe('isEmailNotVerifiedError', () => {
    it('returns true for 403 with email_not_verified error', () => {
      const error = {
        statusCode: 403,
        data: {
          error: 'email_not_verified',
        },
      }
      expect(isEmailNotVerifiedError(error)).toBe(true)
    })

    it('returns false for 403 with different error', () => {
      const error = {
        statusCode: 403,
        data: {
          error: 'access_denied',
        },
      }
      expect(isEmailNotVerifiedError(error)).toBe(false)
    })

    it('returns false for non-403 status', () => {
      const error = {
        statusCode: 401,
        data: {
          error: 'email_not_verified',
        },
      }
      expect(isEmailNotVerifiedError(error)).toBe(false)
    })

    it('returns false for missing data', () => {
      const error = {
        statusCode: 403,
      }
      expect(isEmailNotVerifiedError(error)).toBe(false)
    })

    it('returns false for null', () => {
      expect(isEmailNotVerifiedError(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isEmailNotVerifiedError(undefined)).toBe(false)
    })
  })

  describe('extractEmailFromError', () => {
    it('extracts email from valid error response', () => {
      const error = {
        statusCode: 403,
        data: {
          error: 'email_not_verified',
          data: {
            email: 'user@example.com',
          },
        },
      }
      expect(extractEmailFromError(error)).toBe('user@example.com')
    })

    it('returns null when email is missing', () => {
      const error = {
        statusCode: 403,
        data: {
          error: 'email_not_verified',
          data: {},
        },
      }
      expect(extractEmailFromError(error)).toBe(null)
    })

    it('returns null when data.data is missing', () => {
      const error = {
        statusCode: 403,
        data: {
          error: 'email_not_verified',
        },
      }
      expect(extractEmailFromError(error)).toBe(null)
    })

    it('returns null when data is missing', () => {
      const error = {
        statusCode: 403,
      }
      expect(extractEmailFromError(error)).toBe(null)
    })

    it('returns null for null', () => {
      expect(extractEmailFromError(null)).toBe(null)
    })

    it('returns null for undefined', () => {
      expect(extractEmailFromError(undefined)).toBe(null)
    })
  })
})
