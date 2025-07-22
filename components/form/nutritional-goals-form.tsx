"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ValidatedInput } from "./validated-input"
import { useFormValidation } from "@/hooks/use-form-validation"
import { ValidationRules, Sanitizer } from "@/lib/validation"
import { Target, Loader2 } from "lucide-react"

interface NutritionalGoalsFormProps {
  initialGoals: any
  onSubmit: (goals: any) => Promise<void>
  onCancel: () => void
}

const nutritionalGoalsSchema = {
  calories: ValidationRules.calories,
  protein: ValidationRules.protein,
  carbs: {
    required: true,
    min: 0,
    max: 999,
  },
  fat: {
    required: true,
    min: 0,
    max: 999,
  },
  fiber: {
    required: true,
    min: 0,
    max: 200,
  },
  sodium: {
    required: true,
    min: 0,
    max: 10000,
  },
}

export function NutritionalGoalsForm({ initialGoals, onSubmit, onCancel }: NutritionalGoalsFormProps) {
  const { data, isSubmitting, isFormValid, updateField, handleBlur, handleSubmit, getFieldError, isFieldValid } =
    useFormValidation(initialGoals, {
      schema: nutritionalGoalsSchema,
      validateOnChange: true,
      validateOnBlur: true,
    })

  const handleFormSubmit = async () => {
    const sanitizedData = {
      calories: Sanitizer.sanitizeNumber(data.calories),
      protein: Sanitizer.sanitizeNumber(data.protein),
      carbs: Sanitizer.sanitizeNumber(data.carbs),
      fat: Sanitizer.sanitizeNumber(data.fat),
      fiber: Sanitizer.sanitizeNumber(data.fiber),
      sodium: Sanitizer.sanitizeNumber(data.sodium),
    }

    await onSubmit(sanitizedData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Configurar Metas Nutricionais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInput
            id="calories"
            label="Calorias (kcal)"
            type="number"
            placeholder="2000"
            value={data.calories}
            onChange={(value) => updateField("calories", Number.parseFloat(value) || 0)}
            onBlur={() => handleBlur("calories")}
            error={getFieldError("calories")}
            isValid={isFieldValid("calories")}
            required
          />

          <ValidatedInput
            id="protein"
            label="Proteína (g)"
            type="number"
            placeholder="150"
            value={data.protein}
            onChange={(value) => updateField("protein", Number.parseFloat(value) || 0)}
            onBlur={() => handleBlur("protein")}
            error={getFieldError("protein")}
            isValid={isFieldValid("protein")}
            required
          />

          <ValidatedInput
            id="carbs"
            label="Carboidratos (g)"
            type="number"
            placeholder="250"
            value={data.carbs}
            onChange={(value) => updateField("carbs", Number.parseFloat(value) || 0)}
            onBlur={() => handleBlur("carbs")}
            error={getFieldError("carbs")}
            isValid={isFieldValid("carbs")}
            required
          />

          <ValidatedInput
            id="fat"
            label="Gorduras (g)"
            type="number"
            placeholder="65"
            value={data.fat}
            onChange={(value) => updateField("fat", Number.parseFloat(value) || 0)}
            onBlur={() => handleBlur("fat")}
            error={getFieldError("fat")}
            isValid={isFieldValid("fat")}
            required
          />

          <ValidatedInput
            id="fiber"
            label="Fibras (g)"
            type="number"
            placeholder="25"
            value={data.fiber}
            onChange={(value) => updateField("fiber", Number.parseFloat(value) || 0)}
            onBlur={() => handleBlur("fiber")}
            error={getFieldError("fiber")}
            isValid={isFieldValid("fiber")}
            required
          />

          <ValidatedInput
            id="sodium"
            label="Sódio (mg)"
            type="number"
            placeholder="2300"
            value={data.sodium}
            onChange={(value) => updateField("sodium", Number.parseFloat(value) || 0)}
            onBlur={() => handleBlur("sodium")}
            error={getFieldError("sodium")}
            isValid={isFieldValid("sodium")}
            required
          />
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Dicas para Metas Saudáveis:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Calorias: Baseie-se na sua idade, peso, altura e nível de atividade</li>
            <li>• Proteína: 0.8-2g por kg de peso corporal</li>
            <li>• Fibras: Pelo menos 25g por dia para mulheres, 38g para homens</li>
            <li>• Sódio: Máximo 2300mg por dia (1 colher de chá de sal)</li>
          </ul>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1 bg-transparent">
            Cancelar
          </Button>
          <Button
            onClick={() => handleSubmit(handleFormSubmit)}
            disabled={!isFormValid || isSubmitting}
            className="flex-1"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Metas
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
