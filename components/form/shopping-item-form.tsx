"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { ValidatedInput } from "./validated-input"
import { ValidatedSelect } from "./validated-select"
import { useFormValidation } from "@/hooks/use-form-validation"
import { ValidationRules, Sanitizer } from "@/lib/validation"
import { Plus, Loader2 } from "lucide-react"

interface ShoppingItemFormProps {
  onSubmit: (item: any) => Promise<void>
}

const categories = [
  { value: "Carnes", label: "Carnes" },
  { value: "Legumes", label: "Legumes" },
  { value: "Frutas", label: "Frutas" },
  { value: "Laticínios", label: "Laticínios" },
  { value: "Conservas", label: "Conservas" },
  { value: "Cereais", label: "Cereais" },
  { value: "Bebidas", label: "Bebidas" },
  { value: "Outros", label: "Outros" },
]

const priorities = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
]

const shoppingItemSchema = {
  name: {
    ...ValidationRules.productName,
    custom: (value: string) => {
      if (value && value.length < 2) return "Nome deve ter pelo menos 2 caracteres"
      return null
    },
  },
  category: ValidationRules.category,
  priority: { required: true },
}

export function ShoppingItemForm({ onSubmit }: ShoppingItemFormProps) {
  const { data, isSubmitting, isFormValid, updateField, handleBlur, handleSubmit, getFieldError, isFieldValid, reset } =
    useFormValidation(
      {
        name: "",
        category: "Outros",
        priority: "medium",
      },
      {
        schema: shoppingItemSchema,
        validateOnChange: true,
        validateOnBlur: true,
      },
    )

  const handleFormSubmit = async () => {
    const sanitizedData = {
      ...data,
      name: Sanitizer.sanitizeString(data.name),
    }

    await onSubmit(sanitizedData)
    reset() // Limpar formulário após sucesso
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isFormValid && !isSubmitting) {
      handleSubmit(handleFormSubmit)
    }
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium text-gray-900">Adicionar Item à Lista</h3>

      <div className="space-y-3">
        <ValidatedInput
          id="shopping-name"
          label="Nome do Item"
          placeholder="Ex: Arroz, Maçãs, Detergente..."
          value={data.name}
          onChange={(value) => updateField("name", value)}
          onBlur={() => handleBlur("name")}
          error={getFieldError("name")}
          isValid={isFieldValid("name")}
          required
          onKeyPress={handleKeyPress}
        />

        <div className="grid grid-cols-2 gap-3">
          <ValidatedSelect
            id="shopping-category"
            label="Categoria"
            value={data.category}
            onChange={(value) => updateField("category", value)}
            onBlur={() => handleBlur("category")}
            error={getFieldError("category")}
            isValid={isFieldValid("category")}
            options={categories}
            required
          />

          <ValidatedSelect
            id="shopping-priority"
            label="Prioridade"
            value={data.priority}
            onChange={(value) => updateField("priority", value)}
            onBlur={() => handleBlur("priority")}
            error={getFieldError("priority")}
            isValid={isFieldValid("priority")}
            options={priorities}
            required
          />
        </div>

        <Button
          onClick={() => handleSubmit(handleFormSubmit)}
          disabled={!isFormValid || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          Adicionar à Lista
        </Button>
      </div>
    </div>
  )
}
