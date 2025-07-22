"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidatedInputProps {
  id: string
  label: string
  type?: string
  placeholder?: string
  value: string | number
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string | null
  isValid?: boolean
  required?: boolean
  disabled?: boolean
  className?: string
}

export function ValidatedInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  isValid,
  required = false,
  disabled = false,
  className,
}: ValidatedInputProps) {
  const hasError = !!error
  const showSuccess = isValid && !hasError && value

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(
            "pr-10",
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
            showSuccess && "border-green-500 focus:border-green-500 focus:ring-green-500",
          )}
        />

        {/* Ícone de status */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {hasError && <AlertCircle className="w-4 h-4 text-red-500" />}
          {showSuccess && <CheckCircle className="w-4 h-4 text-green-500" />}
        </div>
      </div>

      {/* Mensagem de erro */}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}
