// Biblioteca de validação personalizada
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  min?: number
  max?: number
  custom?: (value: any) => string | null
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export class FormValidator {
  static validateField(value: any, rules: ValidationRule): ValidationResult {
    const errors: string[] = []

    // Validação de campo obrigatório
    if (rules.required && (!value || (typeof value === "string" && value.trim() === ""))) {
      errors.push("Este campo é obrigatório")
      return { isValid: false, errors }
    }

    // Se o campo está vazio e não é obrigatório, não validar outras regras
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return { isValid: true, errors: [] }
    }

    // Validação de comprimento mínimo
    if (rules.minLength && typeof value === "string" && value.length < rules.minLength) {
      errors.push(`Deve ter pelo menos ${rules.minLength} caracteres`)
    }

    // Validação de comprimento máximo
    if (rules.maxLength && typeof value === "string" && value.length > rules.maxLength) {
      errors.push(`Deve ter no máximo ${rules.maxLength} caracteres`)
    }

    // Validação de padrão (regex)
    if (rules.pattern && typeof value === "string" && !rules.pattern.test(value)) {
      errors.push("Formato inválido")
    }

    // Validação de valor mínimo
    if (rules.min !== undefined && typeof value === "number" && value < rules.min) {
      errors.push(`Valor mínimo é ${rules.min}`)
    }

    // Validação de valor máximo
    if (rules.max !== undefined && typeof value === "number" && value > rules.max) {
      errors.push(`Valor máximo é ${rules.max}`)
    }

    // Validação customizada
    if (rules.custom) {
      const customError = rules.custom(value)
      if (customError) {
        errors.push(customError)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static validateForm(
    data: Record<string, any>,
    schema: Record<string, ValidationRule>,
  ): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {}

    for (const [field, rules] of Object.entries(schema)) {
      results[field] = this.validateField(data[field], rules)
    }

    return results
  }

  static isFormValid(validationResults: Record<string, ValidationResult>): boolean {
    return Object.values(validationResults).every((result) => result.isValid)
  }
}

// Regras de validação específicas
export const ValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 100,
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 50,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
  },
  productName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    custom: (value: string) => {
      if (value && /^\s/.test(value)) return "Não pode começar com espaço"
      if (value && /\s$/.test(value)) return "Não pode terminar com espaço"
      return null
    },
  },
  quantity: {
    required: true,
    min: 0.1,
    max: 999,
    custom: (value: number) => {
      if (value && !Number.isFinite(value)) return "Deve ser um número válido"
      return null
    },
  },
  expiryDate: {
    required: true,
    custom: (value: string) => {
      if (!value) return null
      const date = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (isNaN(date.getTime())) return "Data inválida"
      if (date < today) return "Data não pode ser no passado"

      const maxDate = new Date()
      maxDate.setFullYear(maxDate.getFullYear() + 10)
      if (date > maxDate) return "Data muito distante no futuro"

      return null
    },
  },
  category: {
    required: true,
  },
  location: {
    required: true,
  },
  calories: {
    required: true,
    min: 0,
    max: 9999,
  },
  protein: {
    required: true,
    min: 0,
    max: 999,
  },
  servings: {
    required: true,
    min: 0.1,
    max: 50,
  },
}

// Utilitários de sanitização
export const Sanitizer = {
  sanitizeString: (value: string): string => {
    if (!value) return ""
    return value.trim().replace(/\s+/g, " ")
  },

  sanitizeNumber: (value: string | number): number => {
    const num = typeof value === "string" ? Number.parseFloat(value) : value
    return isNaN(num) ? 0 : num
  },

  sanitizeEmail: (email: string): string => {
    if (!email) return ""
    return email.trim().toLowerCase()
  },

  sanitizeDate: (date: string): string => {
    if (!date) return ""
    const d = new Date(date)
    return isNaN(d.getTime()) ? "" : date
  },
}
