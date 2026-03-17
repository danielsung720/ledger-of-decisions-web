import type {
  ApiResponse,
  PaginatedResponse,
  Expense,
  Decision,
  CreateDecisionRequest,
  CreateEntryRequest,
  UpdateEntryRequest,
  ExpenseListParams,
  SummaryStats,
  TrendsStats,
  BatchDeleteResponse,
} from '~/types'
import type {
  RecurringExpense,
  RecurringExpenseListParams,
  CreateRecurringExpenseRequest,
  UpdateRecurringExpenseRequest,
  GenerateExpenseRequest,
} from '~/types/recurring-expense'
import type {
  Income,
  CashFlowItem,
  CashFlowSummary,
  CashFlowProjection,
  IncomeListParams,
  CashFlowItemListParams,
  CreateIncomeRequest,
  UpdateIncomeRequest,
  CreateCashFlowItemRequest,
  UpdateCashFlowItemRequest,
} from '~/types/cashflow'
import { normalizeProjectionMonths } from '~/types/cashflow'
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  AuthResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UpdatePasswordRequest,
  UserResponse,
} from '~/types/auth'
import type { UserPreferences, UpdateUserPreferencesRequest } from '~/types/preferences'

// ============================================================
// CSRF Helpers
// ============================================================

const XSRF_COOKIE_KEY = 'XSRF-TOKEN'
const XSRF_HEADER_KEY = 'X-XSRF-TOKEN'

// ============================================================
// API Client
// ============================================================

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiRequestOptions {
  method?: HttpMethod
  body?: string
  headers?: Record<string, string>
  skipAuth?: boolean
  skipCsrf?: boolean
}

class ApiClient {
  private baseUrl: string
  private serverCookieForwardDomains: string[]
  private csrfBootstrapPromise: Promise<void> | null = null
  private csrfBootstrapped = false

  constructor() {
    const config = useRuntimeConfig()
    this.baseUrl = config.public.apiBase as string
    this.serverCookieForwardDomains = this.parseForwardDomainAllowlist(
      config.serverCookieForwardDomains as string | undefined
    )
  }

  private async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const method = options.method ?? 'GET'
    const requestFetch = import.meta.server ? useRequestFetch() : $fetch

    const headers: Record<string, string> = { ...options.headers }

    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    if (import.meta.server) {
      const requestHeaders = useRequestHeaders(['cookie', 'host', 'x-forwarded-proto'])
      const cookieHeader = requestHeaders.cookie
      const shouldForwardCookies = this.shouldForwardServerCookies(requestHeaders.host)
      const requestProtocol = requestHeaders['x-forwarded-proto']?.split(',')[0]?.trim() || 'http'
      const requestOrigin = requestHeaders.host
        ? `${requestProtocol}://${requestHeaders.host}`
        : null

      if (cookieHeader && shouldForwardCookies) {
        headers.cookie = cookieHeader
      }

      if (requestOrigin && shouldForwardCookies) {
        headers.origin = requestOrigin
        headers.referer = `${requestOrigin}/`
      }

      if (
        !options.skipCsrf &&
        this.isUnsafeMethod(method) &&
        cookieHeader &&
        shouldForwardCookies
      ) {
        const xsrfToken = this.getCookieValue(cookieHeader, XSRF_COOKIE_KEY)
        if (xsrfToken) {
          headers[XSRF_HEADER_KEY] = decodeURIComponent(xsrfToken)
        }
      }
    } else if (!options.skipCsrf && this.isUnsafeMethod(method)) {
      await this.ensureCsrfCookie()

      const xsrfToken = this.getCookieValue(document.cookie, XSRF_COOKIE_KEY)
      if (xsrfToken) {
        headers[XSRF_HEADER_KEY] = decodeURIComponent(xsrfToken)
      }
    }

    const fetchOptions: Parameters<typeof $fetch>[1] = {
      method,
      headers,
      credentials: 'include',
    }

    if (options.body) {
      fetchOptions.body = options.body
    }

    return await requestFetch<T>(url, fetchOptions)
  }

  private isUnsafeMethod(method: HttpMethod): boolean {
    return method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE'
  }

  private getCookieValue(cookieSource: string | undefined, key: string): string | null {
    if (!cookieSource) return null
    const prefix = `${key}=`
    const entry = cookieSource
      .split(';')
      .map((segment) => segment.trim())
      .find((segment) => segment.startsWith(prefix))

    return entry ? entry.slice(prefix.length) : null
  }

  private getCsrfEndpoint(): string {
    if (this.baseUrl.startsWith('http://') || this.baseUrl.startsWith('https://')) {
      return new URL('/sanctum/csrf-cookie', this.baseUrl).toString()
    }
    return '/sanctum/csrf-cookie'
  }

  private shouldForwardServerCookies(requestHost?: string): boolean {
    if (this.baseUrl.startsWith('/')) return true

    if (!requestHost) return false

    try {
      const apiHostname = this.toHostname(new URL(this.baseUrl).host)
      const requestHostname = this.toHostname(requestHost)

      if (!apiHostname || !requestHostname) return false
      if (apiHostname === requestHostname) return true

      if (!this.serverCookieForwardDomains.length) return false

      return (
        this.isHostAllowedForForward(requestHostname) && this.isHostAllowedForForward(apiHostname)
      )
    } catch {
      return false
    }
  }

  private parseForwardDomainAllowlist(domains: string | undefined): string[] {
    if (!domains) return []

    return domains
      .split(',')
      .map((domain) => domain.trim().toLowerCase().replace(/^\./, ''))
      .filter(Boolean)
  }

  private toHostname(hostOrDomain: string): string | null {
    const normalized = hostOrDomain.trim().toLowerCase()
    if (!normalized) return null

    const hostWithoutPort = normalized.includes(':') ? normalized.split(':')[0] : normalized
    return hostWithoutPort || null
  }

  private isHostAllowedForForward(hostname: string): boolean {
    return this.serverCookieForwardDomains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    )
  }

  private async ensureCsrfCookie(): Promise<void> {
    if (import.meta.server || this.csrfBootstrapped) return

    if (this.getCookieValue(document.cookie, XSRF_COOKIE_KEY)) {
      this.csrfBootstrapped = true
      return
    }

    if (this.csrfBootstrapPromise) {
      await this.csrfBootstrapPromise
      return
    }

    this.csrfBootstrapPromise = (async () => {
      await $fetch(this.getCsrfEndpoint(), { credentials: 'include' })
      this.csrfBootstrapped = true
    })()

    try {
      await this.csrfBootstrapPromise
    } finally {
      this.csrfBootstrapPromise = null
    }
  }

  // ============================================================
  // Auth Endpoints
  // ============================================================

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    })
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return this.request<VerifyEmailResponse>('/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    })
  }

  async resendVerification(data: ResendVerificationRequest): Promise<ResendVerificationResponse> {
    return this.request<ResendVerificationResponse>('/resend-verification', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    })
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    })
  }

  async logout(): Promise<void> {
    await this.request('/logout', {
      method: 'POST',
    })
  }

  async getUser(): Promise<UserResponse> {
    return this.request<UserResponse>('/user')
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return this.request<ForgotPasswordResponse>('/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    })
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return this.request<ResetPasswordResponse>('/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    })
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>('/user/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // ============================================================
  // Expense Endpoints
  // ============================================================

  async getExpenses(params?: ExpenseListParams): Promise<PaginatedResponse<Expense>> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })
    }

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/expenses?${queryString}` : '/expenses'

    return this.request<PaginatedResponse<Expense>>(endpoint)
  }

  async getExpense(id: number): Promise<ApiResponse<Expense>> {
    return this.request<ApiResponse<Expense>>(`/expenses/${id}`)
  }

  async createEntry(data: CreateEntryRequest): Promise<ApiResponse<Expense>> {
    return this.request<ApiResponse<Expense>>('/entries', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateExpense(id: number, data: UpdateEntryRequest): Promise<ApiResponse<Expense>> {
    return this.request<ApiResponse<Expense>>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteExpense(id: number): Promise<void> {
    await this.request<undefined>(`/expenses/${id}`, {
      method: 'DELETE',
    })
  }

  async batchDeleteExpenses(ids: number[]): Promise<BatchDeleteResponse> {
    return this.request<BatchDeleteResponse>('/expenses/batch', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    })
  }

  async getExpenseDecision(expenseId: number): Promise<ApiResponse<Decision>> {
    return this.request<ApiResponse<Decision>>(`/expenses/${expenseId}/decision`)
  }

  async createExpenseDecision(
    expenseId: number,
    data: CreateDecisionRequest
  ): Promise<ApiResponse<Decision>> {
    return this.request<ApiResponse<Decision>>(`/expenses/${expenseId}/decision`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateExpenseDecision(
    expenseId: number,
    data: CreateDecisionRequest
  ): Promise<ApiResponse<Decision>> {
    return this.request<ApiResponse<Decision>>(`/expenses/${expenseId}/decision`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteExpenseDecision(expenseId: number): Promise<void> {
    await this.request<undefined>(`/expenses/${expenseId}/decision`, {
      method: 'DELETE',
    })
  }

  // ============================================================
  // Statistics Endpoints
  // ============================================================

  async getSummary(params?: {
    preset?: string
    start_date?: string
    end_date?: string
  }): Promise<ApiResponse<SummaryStats>> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })
    }

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/statistics/summary?${queryString}` : '/statistics/summary'

    return this.request<ApiResponse<SummaryStats>>(endpoint)
  }

  async getTrends(): Promise<ApiResponse<TrendsStats>> {
    return this.request<ApiResponse<TrendsStats>>('/statistics/trends')
  }

  // ============================================================
  // Recurring Expense Endpoints
  // ============================================================

  async getRecurringExpenses(
    params?: RecurringExpenseListParams
  ): Promise<PaginatedResponse<RecurringExpense>> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })
    }

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/recurring-expenses?${queryString}` : '/recurring-expenses'

    return this.request<PaginatedResponse<RecurringExpense>>(endpoint)
  }

  async getRecurringExpense(id: number): Promise<ApiResponse<RecurringExpense>> {
    return this.request<ApiResponse<RecurringExpense>>(`/recurring-expenses/${id}`)
  }

  async createRecurringExpense(
    data: CreateRecurringExpenseRequest
  ): Promise<ApiResponse<RecurringExpense>> {
    return this.request<ApiResponse<RecurringExpense>>('/recurring-expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateRecurringExpense(
    id: number,
    data: UpdateRecurringExpenseRequest
  ): Promise<ApiResponse<RecurringExpense>> {
    return this.request<ApiResponse<RecurringExpense>>(`/recurring-expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteRecurringExpense(id: number): Promise<void> {
    await this.request<undefined>(`/recurring-expenses/${id}`, {
      method: 'DELETE',
    })
  }

  async getUpcomingRecurringExpenses(days?: number): Promise<ApiResponse<RecurringExpense[]>> {
    const endpoint = days
      ? `/recurring-expenses/upcoming?days=${days}`
      : '/recurring-expenses/upcoming'
    return this.request<ApiResponse<RecurringExpense[]>>(endpoint)
  }

  async generateExpenseFromRecurring(
    id: number,
    data?: GenerateExpenseRequest
  ): Promise<ApiResponse<Expense>> {
    return this.request<ApiResponse<Expense>>(`/recurring-expenses/${id}/generate`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async getRecurringExpenseHistory(id: number, limit?: number): Promise<ApiResponse<Expense[]>> {
    const endpoint = limit
      ? `/recurring-expenses/${id}/history?limit=${limit}`
      : `/recurring-expenses/${id}/history`
    return this.request<ApiResponse<Expense[]>>(endpoint)
  }

  // ============================================================
  // Income Endpoints
  // ============================================================

  async getIncomes(params?: IncomeListParams): Promise<PaginatedResponse<Income>> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })
    }

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/incomes?${queryString}` : '/incomes'

    return this.request<PaginatedResponse<Income>>(endpoint)
  }

  async getIncome(id: number): Promise<ApiResponse<Income>> {
    return this.request<ApiResponse<Income>>(`/incomes/${id}`)
  }

  async createIncome(data: CreateIncomeRequest): Promise<ApiResponse<Income>> {
    return this.request<ApiResponse<Income>>('/incomes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateIncome(id: number, data: UpdateIncomeRequest): Promise<ApiResponse<Income>> {
    return this.request<ApiResponse<Income>>(`/incomes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteIncome(id: number): Promise<void> {
    await this.request<undefined>(`/incomes/${id}`, {
      method: 'DELETE',
    })
  }

  // ============================================================
  // Cash Flow Item Endpoints
  // ============================================================

  async getCashFlowItems(
    params?: CashFlowItemListParams
  ): Promise<PaginatedResponse<CashFlowItem>> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })
    }

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/cash-flow-items?${queryString}` : '/cash-flow-items'

    return this.request<PaginatedResponse<CashFlowItem>>(endpoint)
  }

  async getCashFlowItem(id: number): Promise<ApiResponse<CashFlowItem>> {
    return this.request<ApiResponse<CashFlowItem>>(`/cash-flow-items/${id}`)
  }

  async createCashFlowItem(data: CreateCashFlowItemRequest): Promise<ApiResponse<CashFlowItem>> {
    return this.request<ApiResponse<CashFlowItem>>('/cash-flow-items', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCashFlowItem(
    id: number,
    data: UpdateCashFlowItemRequest
  ): Promise<ApiResponse<CashFlowItem>> {
    return this.request<ApiResponse<CashFlowItem>>(`/cash-flow-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCashFlowItem(id: number): Promise<void> {
    await this.request<undefined>(`/cash-flow-items/${id}`, {
      method: 'DELETE',
    })
  }

  // ============================================================
  // Cash Flow Summary and Projection Endpoints
  // ============================================================

  async getCashFlowSummary(): Promise<ApiResponse<CashFlowSummary>> {
    return this.request<ApiResponse<CashFlowSummary>>('/cash-flow/summary')
  }

  async getCashFlowProjection(months?: number): Promise<ApiResponse<CashFlowProjection[]>> {
    const endpoint =
      months === undefined
        ? '/cash-flow/projection'
        : `/cash-flow/projection?months=${normalizeProjectionMonths(months)}`
    return this.request<ApiResponse<CashFlowProjection[]>>(endpoint)
  }

  // ============================================================
  // User Preferences Endpoints
  // ============================================================

  async getUserPreferences(): Promise<ApiResponse<UserPreferences>> {
    return this.request<ApiResponse<UserPreferences>>('/user/preferences')
  }

  async updateUserPreferences(
    data: UpdateUserPreferencesRequest
  ): Promise<ApiResponse<UserPreferences>> {
    return this.request<ApiResponse<UserPreferences>>('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}

// Singleton instance
let apiClient: ApiClient | null = null

export function useApiClient(): ApiClient {
  if (!apiClient) {
    apiClient = new ApiClient()
  }
  return apiClient
}

export { ApiClient }
