"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidatedSelectProps {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string | null
  isValid?: boolean
  required?: boolean
  disabled?: boolean
  options: { value: string; label: string }[]
  className?: string
}

export function ValidatedSelect({
  id,
  label,
  placeholder = "Selecione uma opção",
  value,
  onChange,
  onBlur,
  error,
  isValid,
  required = false,
  disabled = false,
  options,
  className,
}: ValidatedSelectProps) {
  const hasError = !!error
  const showSuccess = isValid && !hasError && value

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="relative">
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger
            className={cn(
              "pr-10",
              hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              showSuccess && "border-green-500 focus:border-green-500 focus:ring-green-500",
            )}
            onBlur={onBlur}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ícone de status */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
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
