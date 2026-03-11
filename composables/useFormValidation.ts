import type { ZodSchema } from 'zod'
import { ZodError } from 'zod'

export interface FieldError {
  message: string
}

export function useFormValidation<T extends Record<string, unknown>>() {
  const errors = ref<Record<string, string>>({})
  const touched = ref<Record<string, boolean>>({})

  function validate(schema: ZodSchema<T>, data: unknown): boolean {
    const result = schema.safeParse(data)

    if (result.success) {
      errors.value = {}
      return true
    }

    const newErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      if (!newErrors[path]) {
        newErrors[path] = issue.message
      }
    }

    errors.value = newErrors
    return false
  }

  function removeError(field: string): void {
    errors.value = Object.fromEntries(Object.entries(errors.value).filter(([key]) => key !== field))
  }

  function validateField(schema: ZodSchema<T>, field: keyof T, value: unknown): boolean {
    touched.value[field as string] = true

    // Validate the entire form data with this field updated
    const partialData = { [field]: value } as unknown

    try {
      // Try to parse just this field
      const result = schema.safeParse(partialData)

      if (result.success) {
        // Clear error for this field
        removeError(field as string)
        return true
      }

      // Find error for this specific field
      const fieldError = result.error.issues.find((issue) => issue.path.join('.') === String(field))

      if (fieldError) {
        errors.value = {
          ...errors.value,
          [field as string]: fieldError.message,
        }
        return false
      }

      // Clear error if no error for this specific field
      removeError(field as string)
      return true
    } catch (err) {
      if (err instanceof ZodError) {
        errors.value = {
          ...errors.value,
          [field as string]: err.issues[0]?.message ?? 'Invalid value',
        }
      }
      return false
    }
  }

  function getError(field: string): string {
    return errors.value[field] ?? ''
  }

  function hasError(field: string): boolean {
    return !!errors.value[field]
  }

  function isTouched(field: string): boolean {
    return !!touched.value[field]
  }

  function touch(field: string) {
    touched.value[field] = true
  }

  function reset() {
    errors.value = {}
    touched.value = {}
  }

  function setError(field: string, message: string) {
    errors.value = { ...errors.value, [field]: message }
  }

  function clearError(field: string) {
    removeError(field)
  }

  return {
    errors,
    touched,
    validate,
    validateField,
    getError,
    hasError,
    isTouched,
    touch,
    reset,
    setError,
    clearError,
  }
}
