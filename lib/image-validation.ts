// Biblioteca de validação de imagens
export interface ImageValidationRule {
  maxSize?: number // em bytes
  minSize?: number // em bytes
  allowedTypes?: string[]
  maxWidth?: number
  maxHeight?: number
  minWidth?: number
  minHeight?: number
  aspectRatio?: { min: number; max: number }
  quality?: number // 0-1
}

export interface ImageValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  metadata?: {
    size: number
    type: string
    width: number
    height: number
    aspectRatio: number
    quality?: number
  }
}

export class ImageValidator {
  private static readonly DEFAULT_RULES: ImageValidationRule = {
    maxSize: 10 * 1024 * 1024, // 10MB
    minSize: 1024, // 1KB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    maxWidth: 4096,
    maxHeight: 4096,
    minWidth: 100,
    minHeight: 100,
    aspectRatio: { min: 0.1, max: 10 },
  }

  static async validateImage(file: File, rules: Partial<ImageValidationRule> = {}): Promise<ImageValidationResult> {
    const validationRules = { ...this.DEFAULT_RULES, ...rules }
    const errors: string[] = []
    const warnings: string[] = []

    // Validação básica do arquivo
    if (!file) {
      errors.push("Nenhum arquivo selecionado")
      return { isValid: false, errors, warnings }
    }

    // Validação de tipo de arquivo
    if (validationRules.allowedTypes && !validationRules.allowedTypes.includes(file.type)) {
      errors.push(`Tipo de arquivo não suportado. Use: ${validationRules.allowedTypes.join(", ")}`)
    }

    // Validação de tamanho do arquivo
    if (validationRules.maxSize && file.size > validationRules.maxSize) {
      errors.push(`Arquivo muito grande. Máximo: ${this.formatFileSize(validationRules.maxSize)}`)
    }

    if (validationRules.minSize && file.size < validationRules.minSize) {
      errors.push(`Arquivo muito pequeno. Mínimo: ${this.formatFileSize(validationRules.minSize)}`)
    }

    // Se já há erros básicos, retornar sem validar dimensões
    if (errors.length > 0) {
      return { isValid: false, errors, warnings }
    }

    try {
      // Carregar imagem para validar dimensões
      const imageMetadata = await this.getImageMetadata(file)

      // Validação de dimensões
      if (validationRules.maxWidth && imageMetadata.width > validationRules.maxWidth) {
        errors.push(`Largura muito grande. Máximo: ${validationRules.maxWidth}px`)
      }

      if (validationRules.maxHeight && imageMetadata.height > validationRules.maxHeight) {
        errors.push(`Altura muito grande. Máximo: ${validationRules.maxHeight}px`)
      }

      if (validationRules.minWidth && imageMetadata.width < validationRules.minWidth) {
        errors.push(`Largura muito pequena. Mínimo: ${validationRules.minWidth}px`)
      }

      if (validationRules.minHeight && imageMetadata.height < validationRules.minHeight) {
        errors.push(`Altura muito pequena. Mínimo: ${validationRules.minHeight}px`)
      }

      // Validação de proporção
      if (validationRules.aspectRatio) {
        const aspectRatio = imageMetadata.width / imageMetadata.height
        if (aspectRatio < validationRules.aspectRatio.min || aspectRatio > validationRules.aspectRatio.max) {
          errors.push("Proporção da imagem inadequada para OCR")
        }
      }

      // Avisos baseados na qualidade da imagem
      if (imageMetadata.width < 800 || imageMetadata.height < 600) {
        warnings.push("Imagem com baixa resolução pode afetar a precisão do OCR")
      }

      if (file.size < 50 * 1024) {
        // 50KB
        warnings.push("Arquivo muito pequeno pode indicar baixa qualidade")
      }

      // Verificar se é uma imagem muito escura ou clara
      const brightness = await this.analyzeBrightness(file)
      if (brightness < 0.2) {
        warnings.push("Imagem muito escura pode dificultar o reconhecimento de texto")
      } else if (brightness > 0.9) {
        warnings.push("Imagem muito clara pode dificultar o reconhecimento de texto")
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata: {
          size: file.size,
          type: file.type,
          width: imageMetadata.width,
          height: imageMetadata.height,
          aspectRatio: imageMetadata.width / imageMetadata.height,
        },
      }
    } catch (error) {
      errors.push("Erro ao processar a imagem. Verifique se o arquivo não está corrompido.")
      return { isValid: false, errors, warnings }
    }
  }

  private static getImageMetadata(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        })
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error("Falha ao carregar a imagem"))
      }

      img.src = url
    })
  }

  private static async analyzeBrightness(file: File): Promise<number> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        // Redimensionar para análise mais rápida
        const maxSize = 100
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

        try {
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
          if (!imageData) {
            resolve(0.5) // valor neutro se não conseguir analisar
            return
          }

          let totalBrightness = 0
          const pixels = imageData.data

          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i]
            const g = pixels[i + 1]
            const b = pixels[i + 2]
            // Calcular brilho usando fórmula de luminância
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
            totalBrightness += brightness
          }

          const averageBrightness = totalBrightness / (pixels.length / 4)
          resolve(averageBrightness)
        } catch {
          resolve(0.5) // valor neutro em caso de erro
        } finally {
          URL.revokeObjectURL(url)
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(0.5) // valor neutro em caso de erro
      }

      img.src = url
    })
  }

  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Regras específicas para diferentes tipos de OCR
  static getOCRRules(type: "product-label" | "receipt" | "document" = "product-label"): ImageValidationRule {
    const baseRules = this.DEFAULT_RULES

    switch (type) {
      case "product-label":
        return {
          ...baseRules,
          minWidth: 200,
          minHeight: 200,
          maxSize: 5 * 1024 * 1024, // 5MB
          aspectRatio: { min: 0.3, max: 3 }, // mais flexível para rótulos
        }

      case "receipt":
        return {
          ...baseRules,
          minWidth: 300,
          minHeight: 400,
          aspectRatio: { min: 0.2, max: 1 }, // recibos são geralmente altos
        }

      case "document":
        return {
          ...baseRules,
          minWidth: 600,
          minHeight: 800,
          aspectRatio: { min: 0.7, max: 1.4 }, // formato A4
        }

      default:
        return baseRules
    }
  }
}

// Utilitários para compressão de imagem
export class ImageCompressor {
  static async compressImage(
    file: File,
    options: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
      format?: string
    } = {},
  ): Promise<File> {
    const { maxWidth = 1920, maxHeight = 1080, quality = 0.8, format = "image/jpeg" } = options

    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height)

        // Converter para blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: format,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error("Falha na compressão da imagem"))
            }
            URL.revokeObjectURL(url)
          },
          format,
          quality,
        )
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error("Falha ao carregar a imagem para compressão"))
      }

      img.src = url
    })
  }
}
