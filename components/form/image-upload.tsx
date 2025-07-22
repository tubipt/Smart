"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageValidator, ImageCompressor, type ImageValidationResult } from "@/lib/image-validation"
import { Camera, Upload, X, AlertTriangle, CheckCircle, Info, Loader2, Minimize2, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { TextDetectionPreview } from "./text-detection-preview"

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  onImageRemove: () => void
  maxFiles?: number
  ocrType?: "product-label" | "receipt" | "document"
  disabled?: boolean
  className?: string
}

export function ImageUpload({
  onImageSelect,
  onImageRemove,
  maxFiles = 1,
  ocrType = "product-label",
  disabled = false,
  className,
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [validationResults, setValidationResults] = useState<ImageValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionProgress, setCompressionProgress] = useState(0)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [showTextDetection, setShowTextDetection] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const validateAndProcessImage = useCallback(
    async (file: File) => {
      setIsValidating(true)

      try {
        // Validar imagem
        const validationRules = ImageValidator.getOCRRules(ocrType)
        const result = await ImageValidator.validateImage(file, validationRules)

        if (result.isValid) {
          // Se a imagem é muito grande, comprimir
          let processedFile = file

          if (file.size > 2 * 1024 * 1024) {
            // 2MB
            setIsCompressing(true)
            setCompressionProgress(0)

            // Simular progresso de compressão
            const progressInterval = setInterval(() => {
              setCompressionProgress((prev) => Math.min(prev + 10, 90))
            }, 100)

            try {
              processedFile = await ImageCompressor.compressImage(file, {
                maxWidth: 1920,
                maxHeight: 1080,
                quality: 0.85,
              })
              setCompressionProgress(100)
            } catch (error) {
              console.error("Erro na compressão:", error)
              // Usar arquivo original se compressão falhar
            } finally {
              clearInterval(progressInterval)
              setIsCompressing(false)
              setCompressionProgress(0)
            }
          }

          // Criar URL de preview
          const previewUrl = URL.createObjectURL(processedFile)

          setSelectedFiles([processedFile])
          setValidationResults([result])
          setPreviewUrls([previewUrl])
          onImageSelect(processedFile)
        } else {
          setValidationResults([result])
        }
      } catch (error) {
        console.error("Erro na validação:", error)
        setValidationResults([
          {
            isValid: false,
            errors: ["Erro inesperado ao processar a imagem"],
            warnings: [],
          },
        ])
      } finally {
        setIsValidating(false)
      }
    },
    [ocrType, onImageSelect],
  )

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0] // Pegar apenas o primeiro arquivo
      validateAndProcessImage(file)
    },
    [validateAndProcessImage],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)

      if (disabled) return

      const files = e.dataTransfer.files
      handleFileSelect(files)
    },
    [disabled, handleFileSelect],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setDragActive(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const removeImage = useCallback(
    (index: number) => {
      // Limpar URL de preview
      if (previewUrls[index]) {
        URL.revokeObjectURL(previewUrls[index])
      }

      setSelectedFiles([])
      setValidationResults([])
      setPreviewUrls([])
      onImageRemove()
    },
    [previewUrls, onImageRemove],
  )

  const openCamera = useCallback(() => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }, [])

  const openFileSelector = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  const getValidationIcon = (result: ImageValidationResult) => {
    if (result.isValid) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    return <AlertTriangle className="w-4 h-4 text-red-600" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Inputs ocultos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* Área de upload */}
      {selectedFiles.length === 0 && (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            dragActive && "border-blue-500 bg-blue-50",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "hover:border-gray-400",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-8 text-center">
            {isValidating ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
                <div>
                  <p className="text-lg font-medium">Validando imagem...</p>
                  <p className="text-sm text-gray-600">Verificando qualidade e formato</p>
                </div>
              </div>
            ) : isCompressing ? (
              <div className="space-y-4">
                <Minimize2 className="w-12 h-12 mx-auto text-green-600" />
                <div>
                  <p className="text-lg font-medium">Otimizando imagem...</p>
                  <p className="text-sm text-gray-600">Reduzindo tamanho para melhor performance</p>
                  <Progress value={compressionProgress} className="mt-2" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium">Adicionar Imagem</p>
                  <p className="text-sm text-gray-600">Arraste uma imagem aqui ou clique para selecionar</p>
                </div>

                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={openCamera}
                    disabled={disabled}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Camera className="w-4 h-4" />
                    Câmera
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openFileSelector}
                    disabled={disabled}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Upload className="w-4 h-4" />
                    Galeria
                  </Button>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>Formatos aceitos: JPEG, PNG, WebP</p>
                  <p>Tamanho máximo: 10MB</p>
                  <p>Resolução mínima: 200x200px</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview das imagens selecionadas */}
      {selectedFiles.map((file, index) => {
        const result = validationResults[index]
        const previewUrl = previewUrls[index]

        return (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Preview da imagem */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  {previewUrl && (
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {/* Informações do arquivo */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {result && getValidationIcon(result)}
                    <span className="font-medium truncate">{file.name}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">{formatFileSize(file.size)}</Badge>
                    {result?.metadata && (
                      <>
                        <Badge variant="outline">
                          {result.metadata.width}x{result.metadata.height}
                        </Badge>
                        <Badge variant="outline">{file.type.split("/")[1].toUpperCase()}</Badge>
                      </>
                    )}
                  </div>

                  {/* Status de validação */}
                  {result && (
                    <div className="space-y-1">
                      {result.isValid ? (
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="w-3 h-3" />
                          Imagem válida para OCR
                        </div>
                      ) : (
                        <div className="text-red-600 text-sm">
                          {result.errors.map((error, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {error}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Avisos */}
                      {result.warnings.length > 0 && (
                        <div className="space-y-1">
                          {result.warnings.map((warning, i) => (
                            <div key={i} className="flex items-center gap-1 text-amber-600 text-sm">
                              <Info className="w-3 h-3" />
                              {warning}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTextDetection(!showTextDetection)}
                    className="bg-transparent"
                  >
                    <Search className="w-3 h-3 mr-1" />
                    {showTextDetection ? "Análise Simples" : "Análise Detalhada"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Detecção de Texto */}
      {selectedFiles.length > 0 && (
        <TextDetectionPreview
          file={selectedFiles[0]}
          onDetectionComplete={(result) => {
            console.log("Detecção completa:", result)
          }}
          showDetailedAnalysis={showTextDetection}
        />
      )}

      {/* Dicas para melhor OCR */}
      {selectedFiles.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Dicas para melhor reconhecimento:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Certifique-se de que o texto está bem iluminado</li>
              <li>• Evite reflexos e sombras sobre o texto</li>
              <li>• Mantenha a câmera estável e focada</li>
              <li>• Posicione o rótulo de forma reta na imagem</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
