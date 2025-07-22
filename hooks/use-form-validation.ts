"use client"

import { useState, useCallback } from "react"
import { FormValidator, type ValidationRule, type ValidationResult } from "@/lib/validation"

interface UseFormValidationOptions {
  schema: Record<string, ValidationRule>
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export function useFormValidation<T extends Record<string, any>>(initialData: T, options: UseFormValidationOptions) {
  const [data, setData] = useState<T>(initialData)
  const [errors, setErrors] = useState<Record<string, ValidationResult>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = useCallback(
    (field: string, value: any) => {
      const rule = options.schema[field]
      if (!rule) return { isValid: true, errors: [] }

      return FormValidator.validateField(value, rule)
    },
    [options.schema],
  )

  const validateForm = useCallback(() => {
    const results = FormValidator.validateForm(data, options.schema)
    setErrors(results)
    return FormValidator.isFormValid(results)
  }, [data, options.schema])

  const updateField = useCallback(
    (field: string, value: any) => {
      setData((prev) => ({ ...prev, [field]: value }))

      if (options.validateOnChange) {
        const result = validateField(field, value)
        setErrors((prev) => ({ ...prev, [field]: result }))
      }
    },
    [validateField, options.validateOnChange],
  )

  const handleBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }))

      if (options.validateOnBlur) {
        const result = validateField(field, data[field])
        setErrors((prev) => ({ ...prev, [field]: result }))
      }
    },
    [validateField, data, options.validateOnBlur],
  )

  const handleSubmit = useCallback(
    async (onSubmit: (data: T) => Promise<void> | void) => {
      setIsSubmitting(true)

      // Marcar todos os campos como tocados
      const allTouched = Object.keys(options.schema).reduce(
        (acc, key) => {
          acc[key] = true
          return acc
        },
        {} as Record<string, boolean>,
      )
      setTouched(allTouched)

      const isValid = validateForm()

      if (isValid) {
        try {
          await onSubmit(data)
        } catch (error) {
          console.error("Form submission error:", error)
        }
      }

      setIsSubmitting(false)
    },
    [data, validateForm, options.schema],
  )

  const reset = useCallback(() => {
    setData(initialData)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialData])

  const getFieldError = useCallback(
    (field: string) => {
      const fieldError = errors[field]
      const fieldTouched = touched[field]

      if (!fieldTouched || !fieldError || fieldError.isValid) {
        return null
      }

      return fieldError.errors[0] // Retorna o primeiro erro
    },
    [errors, touched],
  )

  const isFieldValid = useCallback(
    (field: string) => {
      const fieldError = errors[field]
      return !fieldError || fieldError.isValid
    },
    [errors],
  )

  const isFormValid = FormValidator.isFormValid(errors)

  return {
    data,
    errors,
    touched,
    isSubmitting,
    isFormValid,
    updateField,
    handleBlur,
    handleSubmit,
    reset,
    getFieldError,
    isFieldValid,
    validateForm,
  }
}
