// ============================================================
// Auth Types
// ============================================================

/** User information */
export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
}

/** Auth state */
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ============================================================
// Request Types
// ============================================================

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface VerifyEmailRequest {
  email: string
  code: string
}

export interface ResendVerificationRequest {
  email: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  code: string
  password: string
  password_confirmation: string
}

export interface UpdatePasswordRequest {
  current_password: string
  password: string
  password_confirmation: string
}

// ============================================================
// Response Types
// ============================================================

export interface AuthResponse {
  success: boolean
  data: {
    user: User
  }
  message?: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  data: User
}

export interface VerifyEmailResponse {
  success: boolean
  message: string
  data: User
}

export interface ResendVerificationResponse {
  success: boolean
  message: string
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
  data?: {
    email: string
  }
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
}

export interface UserResponse {
  success: boolean
  data: User
}

export interface AuthErrorResponse {
  success: false
  error: string
  errors?: Record<string, string[]>
  data?: {
    retry_after?: number
  }
}
