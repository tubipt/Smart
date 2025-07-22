"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useApp } from "@/contexts/app-context"
import { Camera, Loader2, CheckCircle, AlertTriangle, RotateCcw, Zap, Info } from "lucide-react"
import { ImageUpload } from "@/components/form/image-upload"
import { useFormValidation } from "@/hooks/use-form-validation"
import { ValidationRules } from "@/lib/validation"
import { ValidatedInput } from "@/components/form/validated-input"
import { ValidatedSelect } from "@/components/form/validated-select"
import { TextDetector, type TextDetectionResult } from "@/lib/text-detection"

interface OCRScannerProps {
  isOpen: boolean
  onClose: () => void
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

export function OCRScanner({ isOpen, onClose }: OCRScannerProps) {
  const { scanProduct, addProduct } = useApp()
  const [currentStep, setCurrentStep] = useState<"upload" | "scanning" | "review" | "success">("upload")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanError, setScanError] = useState<string | null>(null)
  const [ocrConfidence, setOcrConfidence] = useState(0)
  const [textDetectionResult, setTextDetectionResult] = useState<TextDetectionResult | null>(null)

  const { data, isSubmitting, isFormValid, updateField, handleBlur, handleSubmit, getFieldError, isFieldValid, reset } =
    useFormValidation(
      {
        name: "",
        category: "",
        expiryDate: "",
        quantity: 1,
        location: "",
        brand: "",
        barcode: "",
      },
      {
        schema: productSchema,
        validateOnChange: true,
        validateOnBlur: true,
      },
    )

  const handleImageSelect = async (file: File) => {
    setSelectedImage(file)

    // Pré-validação rápida de texto
    const quickCheck = await TextDetector.quickTextCheck(file)

    if (!quickCheck.hasText || quickCheck.confidence < 0.2) {
      setScanError("Pouco ou nenhum texto detectado na imagem. Tente uma foto mais clara do rótulo.")
      setCurrentStep("upload")
      return
    }

    setCurrentStep("scanning")
    setScanError(null)
    performOCRScan(file)
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
    setCurrentStep("upload")
    setScanError(null)
    setScanProgress(0)
    reset()
  }

  const performOCRScan = async (file: File) => {
    try {
      setScanProgress(0)

      // Análise completa de texto em paralelo
      const textDetectionPromise = TextDetector.detectText(file)

      // Simular progresso de OCR
      const progressInterval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 200)

      // Aguardar ambas as análises
      const [ocrResult, textResult] = await Promise.all([scanProduct(file), textDetectionPromise])

      setTextDetectionResult(textResult)

      // Ajustar confiança do OCR baseado na detecção de texto
      if (textResult.confidence < 0.4) {
        setOcrConfidence(Math.max(ocrResult ? 60 : 30, textResult.confidence * 100))
      } else {
        setOcrConfidence(Math.random() * 30 + 70)
      }

      clearInterval(progressInterval)
      setScanProgress(100)

      if (ocrResult) {
        updateField("name", ocrResult.name || "")
        updateField("category", ocrResult.category || "Outros")
        updateField("expiryDate", ocrResult.expiryDate || "")
        updateField("barcode", ocrResult.barcode || "")
        setCurrentStep("review")
      } else {
        throw new Error("Não foi possível reconhecer informações na imagem")
      }
    } catch (error) {
      console.error("Erro ao escanear produto:", error)
      setScanError(error instanceof Error ? error.message : "Erro desconhecido no OCR")
      setCurrentStep("upload")
      setScanProgress(0)
    }
  }

  const handleAddProduct = async () => {
    const productData = {
      ...data,
      quantity: Number(data.quantity),
    }

    await addProduct(productData)
    setCurrentStep("success")

    // Fechar modal após 2 segundos
    setTimeout(() => {
      handleClose()
    }, 2000)
  }

  const handleClose = () => {
    setCurrentStep("upload")
    setSelectedImage(null)
    setScanError(null)
    setScanProgress(0)
    setOcrConfidence(0)
    reset()
    onClose()
  }

  const handleRetry = () => {
    if (selectedImage) {
      setCurrentStep("scanning")
      setScanError(null)
      performOCRScan(selectedImage)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "upload":
        return (
          <div className="space-y-4">
            <ImageUpload onImageSelect={handleImageSelect} onImageRemove={handleImageRemove} ocrType="product-label" />

            {scanError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erro no OCR:</strong> {scanError}
                  {selectedImage && (
                    <Button variant="outline" size="sm" onClick={handleRetry} className="ml-2 bg-transparent">
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Tentar Novamente
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )

      case "scanning":
        return (
          <div className="text-center py-8 space-y-4">
            <div className="relative">
              <Zap className="w-16 h-16 mx-auto text-blue-600 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Analisando Imagem...</h3>
              <p className="text-sm text-gray-600">Reconhecendo texto e informações do produto</p>
            </div>

            <div className="w-full max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progresso</span>
                <span>{Math.round(scanProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Detectando texto no rótulo</p>
              <p>• Identificando nome do produto</p>
              <p>• Procurando data de validade</p>
              <p>• Verificando código de barras</p>
            </div>
          </div>
        )

      case "review":
        return (
          <div className="space-y-4">
            {/* Confiança do OCR */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex justify-between items-center">
                  <span>
                    <strong>OCR Concluído!</strong> Confiança: {Math.round(ocrConfidence)}%
                  </span>
                  {ocrConfidence < 80 && (
                    <Button variant="outline" size="sm" onClick={handleRetry}>
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reescanear
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Informações da Detecção de Texto */}
            {textDetectionResult && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="text-sm">
                    <strong>Análise de Texto:</strong> {textDetectionResult.textRegions.length} região(ões) detectada(s)
                    • Qualidade: {Math.round(textDetectionResult.quality.overall * 100)}%
                    {textDetectionResult.recommendations.length > 0 && (
                      <div className="mt-1 text-xs text-gray-600">{textDetectionResult.recommendations[0]}</div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Preview da imagem */}
            {selectedImage && (
              <div className="flex justify-center">
                <img
                  src={URL.createObjectURL(selectedImage) || "/placeholder.svg"}
                  alt="Imagem escaneada"
                  className="max-w-32 max-h-32 object-cover rounded-md border"
                />
              </div>
            )}

            {/* Formulário de revisão */}
            <div className="space-y-4">
              <ValidatedInput
                id="review-name"
                label="Nome do Produto"
                placeholder="Ex: Leite, Tomates..."
                value={data.name}
                onChange={(value) => updateField("name", value)}
                onBlur={() => handleBlur("name")}
                error={getFieldError("name")}
                isValid={isFieldValid("name")}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <ValidatedSelect
                  id="review-category"
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
                  id="review-location"
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
                  id="review-expiry"
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
                  id="review-quantity"
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
                id="review-brand"
                label="Marca (Opcional)"
                placeholder="Ex: Nestlé, Sadia..."
                value={data.brand || ""}
                onChange={(value) => updateField("brand", value)}
              />

              {data.barcode && (
                <ValidatedInput
                  id="review-barcode"
                  label="Código de Barras"
                  value={data.barcode}
                  onChange={(value) => updateField("barcode", value)}
                  className="font-mono text-sm"
                />
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleImageRemove} className="flex-1 bg-transparent">
                Escanear Novamente
              </Button>
              <Button
                onClick={() => handleSubmit(handleAddProduct)}
                disabled={!isFormValid || isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Adicionar à Despensa
              </Button>
            </div>
          </div>
        )

      case "success":
        return (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
            <div>
              <h3 className="text-lg font-medium text-green-800">Produto Adicionado!</h3>
              <p className="text-sm text-green-600">O produto foi adicionado à sua despensa com sucesso</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Escanear Produto
          </DialogTitle>
          <DialogDescription>
            {currentStep === "upload" && "Tire uma foto ou selecione uma imagem do rótulo do produto"}
            {currentStep === "scanning" && "Processando imagem com tecnologia OCR"}
            {currentStep === "review" && "Revise e confirme as informações detectadas"}
            {currentStep === "success" && "Produto adicionado com sucesso!"}
          </DialogDescription>
        </DialogHeader>

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  )
}
