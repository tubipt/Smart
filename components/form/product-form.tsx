"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ValidatedInput } from "./validated-input"
import { ValidatedSelect } from "./validated-select"
import { useFormValidation } from "@/hooks/use-form-validation"
import { ValidationRules, Sanitizer } from "@/lib/validation"
import { Loader2, Package } from "lucide-react"

interface ProductFormProps {
  onSubmit: (product: any) => Promise<void>
  onCancel: () => void
  initialData?: any
  isEditing?: boolean
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

const locations = [
  { value: "Frigorífico", label: "Frigorífico" },
  { value: "Congelador", label: "Congelador" },
  { value: "Despensa", label: "Despensa" },
  { value: "Armário", label: "Armário" },
  { value: "Fruteira", label: "Fruteira" },
]

const productSchema = {
  name: ValidationRules.productName,
  category: ValidationRules.category,
  expiryDate: ValidationRules.expiryDate,
  quantity: ValidationRules.quantity,
  location: ValidationRules.location,
}

export function ProductForm({ onSubmit, onCancel, initialData, isEditing = false }: ProductFormProps) {
  const { data, isSubmitting, isFormValid, updateField, handleBlur, handleSubmit, getFieldError, isFieldValid } =
    useFormValidation(
      initialData || {
        name: "",
        category: "",
        expiryDate: "",
        quantity: 1,
        location: "",
        brand: "",
      },
      {
        schema: productSchema,
        validateOnChange: true,
        validateOnBlur: true,
      },
    )

  const handleFormSubmit = async () => {
    const sanitizedData = {
      ...data,
      name: Sanitizer.sanitizeString(data.name),
      brand: Sanitizer.sanitizeString(data.brand),
      quantity: Sanitizer.sanitizeNumber(data.quantity),
      expiryDate: Sanitizer.sanitizeDate(data.expiryDate),
    }

    await onSubmit(sanitizedData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          {isEditing ? "Editar Produto" : "Novo Produto"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ValidatedInput
          id="name"
          label="Nome do Produto"
          placeholder="Ex: Leite, Tomates, Frango..."
          value={data.name}
          onChange={(value) => updateField("name", value)}
          onBlur={() => handleBlur("name")}
          error={getFieldError("name")}
          isValid={isFieldValid("name")}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <ValidatedSelect
            id="category"
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
            id="location"
            label="Localização"
            value={data.location}
            onChange={(value) => updateField("location", value)}
            onBlur={() => handleBlur("location")}
            error={getFieldError("location")}
            isValid={isFieldValid("location")}
            options={locations}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ValidatedInput
            id="expiryDate"
            label="Data de Validade"
            type="date"
            value={data.expiryDate}
            onChange={(value) => updateField("expiryDate", value)}
            onBlur={() => handleBlur("expiryDate")}
            error={getFieldError("expiryDate")}
            isValid={isFieldValid("expiryDate")}
            required
          />

          <ValidatedInput
            id="quantity"
            label="Quantidade"
            type="number"
            placeholder="1"
            value={data.quantity}
            onChange={(value) => updateField("quantity", Number.parseFloat(value) || 0)}
            onBlur={() => handleBlur("quantity")}
            error={getFieldError("quantity")}
            isValid={isFieldValid("quantity")}
            required
          />
        </div>

        <ValidatedInput
          id="brand"
          label="Marca (Opcional)"
          placeholder="Ex: Nestlé, Sadia..."
          value={data.brand || ""}
          onChange={(value) => updateField("brand", value)}
        />

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
            {isEditing ? "Atualizar" : "Adicionar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
