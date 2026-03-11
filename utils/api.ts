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
// Token Management
// ============================================================

const TOKEN_KEY = 'auth_token'

export function getStoredToken(): string | null {
  if (import.meta.server) return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  if (import.meta.server) return
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeStoredToken(): void {
  if (import.meta.server) return
  localStorage.removeItem(TOKEN_KEY)
}

// ============================================================
// API Client
// ============================================================

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiRequestOptions {
  method?: HttpMethod
  body?: string
  headers?: Record<string, string>
  skipAuth?: boolean
}

class ApiClient {
  private baseUrl: string

  constructor() {
    const config = useRuntimeConfig()
    this.baseUrl = config.public.apiBase as string
  }

  private async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add Authorization header if token exists and not skipped
    if (!options.skipAuth) {
      const token = getStoredToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const fetchOptions: Parameters<typeof $fetch>[1] = {
      headers,
    }

    if (options.method) {
      fetchOptions.method = options.method
    }

    if (options.body) {
      fetchOptions.body = options.body
    }

    try {
      return await $fetch<T>(url, fetchOptions)
    } catch (error: unknown) {
      // Handle 401 Unauthorized - clear token and redirect to login
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode
        if (statusCode === 401) {
          removeStoredToken()
          if (!import.meta.server) {
            const router = useRouter()
            router.push('/login')
          }
        }
      }
      throw error
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
