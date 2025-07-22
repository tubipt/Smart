// Sistema de treinamento para detecção de texto
export interface TextRegionAnnotation {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  confidence: number
  userMarked: boolean
  createdAt: string
  imageHash: string
}

export interface TrainingData {
  imageHash: string
  originalDimensions: { width: number; height: number }
  annotations: TextRegionAnnotation[]
  userFeedback: {
    overallQuality: number // 1-5
    detectionAccuracy: number // 1-5
    comments?: string
  }
  createdAt: string
}

export interface TrainingSession {
  id: string
  imageFile: File
  imageHash: string
  originalDetection: TextRegionAnnotation[]
  userAnnotations: TextRegionAnnotation[]
  isComplete: boolean
  feedback?: {
    overallQuality: number
    detectionAccuracy: number
    comments?: string
  }
}

export class TextTrainingManager {
  private static readonly STORAGE_KEY = "despensa_text_training"
  private static readonly MAX_TRAINING_DATA = 100

  // Gerar hash da imagem para identificação
  static async generateImageHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .substring(0, 16)
  }

  // Salvar dados de treinamento
  static saveTrainingData(data: TrainingData): void {
    try {
      const existingData = this.getTrainingData()
      const updatedData = [...existingData.filter((d) => d.imageHash !== data.imageHash), data]

      // Manter apenas os mais recentes se exceder o limite
      if (updatedData.length > this.MAX_TRAINING_DATA) {
        updatedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        updatedData.splice(this.MAX_TRAINING_DATA)
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData))
    } catch (error) {
      console.error("Erro ao salvar dados de treinamento:", error)
    }
  }

  // Recuperar dados de treinamento
  static getTrainingData(): TrainingData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Erro ao recuperar dados de treinamento:", error)
      return []
    }
  }

  // Buscar dados de treinamento para uma imagem específica
  static getTrainingDataForImage(imageHash: string): TrainingData | null {
    const allData = this.getTrainingData()
    return allData.find((d) => d.imageHash === imageHash) || null
  }

  // Melhorar detecção baseada em dados de treinamento
  static improveDetection(originalRegions: TextRegionAnnotation[], imageHash: string): TextRegionAnnotation[] {
    const trainingData = this.getTrainingDataForImage(imageHash)
    if (!trainingData) return originalRegions

    const improvedRegions = [...originalRegions]

    // Aplicar correções baseadas em anotações do usuário
    for (const userAnnotation of trainingData.annotations.filter((a) => a.userMarked)) {
      // Verificar se há sobreposição com detecção automática
      const overlapping = improvedRegions.find((region) => this.calculateOverlap(region, userAnnotation) > 0.3)

      if (overlapping) {
        // Ajustar região existente baseada na anotação do usuário
        overlapping.x = userAnnotation.x
        overlapping.y = userAnnotation.y
        overlapping.width = userAnnotation.width
        overlapping.height = userAnnotation.height
        overlapping.confidence = Math.max(overlapping.confidence, 0.8)
      } else {
        // Adicionar nova região baseada na anotação do usuário
        improvedRegions.push({
          ...userAnnotation,
          confidence: 0.9, // Alta confiança para anotações manuais
        })
      }
    }

    return improvedRegions
  }

  // Calcular sobreposição entre duas regiões
  private static calculateOverlap(region1: TextRegionAnnotation, region2: TextRegionAnnotation): number {
    const x1 = Math.max(region1.x, region2.x)
    const y1 = Math.max(region1.y, region2.y)
    const x2 = Math.min(region1.x + region1.width, region2.x + region2.width)
    const y2 = Math.min(region1.y + region1.height, region2.y + region2.height)

    if (x2 <= x1 || y2 <= y1) return 0

    const overlapArea = (x2 - x1) * (y2 - y1)
    const region1Area = region1.width * region1.height
    const region2Area = region2.width * region2.height
    const unionArea = region1Area + region2Area - overlapArea

    return overlapArea / unionArea
  }

  // Obter estatísticas de treinamento
  static getTrainingStats(): {
    totalImages: number
    totalAnnotations: number
    averageQuality: number
    averageAccuracy: number
    recentActivity: number
  } {
    const data = this.getTrainingData()
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const totalAnnotations = data.reduce((sum, d) => sum + d.annotations.length, 0)
    const qualitySum = data.reduce((sum, d) => sum + (d.userFeedback?.overallQuality || 0), 0)
    const accuracySum = data.reduce((sum, d) => sum + (d.userFeedback?.detectionAccuracy || 0), 0)
    const recentActivity = data.filter((d) => new Date(d.createdAt) > weekAgo).length

    return {
      totalImages: data.length,
      totalAnnotations,
      averageQuality: data.length > 0 ? qualitySum / data.length : 0,
      averageAccuracy: data.length > 0 ? accuracySum / data.length : 0,
      recentActivity,
    }
  }

  // Limpar dados antigos
  static cleanOldData(daysOld = 30): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const data = this.getTrainingData()
    const filteredData = data.filter((d) => new Date(d.createdAt) > cutoffDate)

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredData))
  }

  // Exportar dados de treinamento
  static exportTrainingData(): string {
    const data = this.getTrainingData()
    return JSON.stringify(data, null, 2)
  }

  // Importar dados de treinamento
  static importTrainingData(jsonData: string): boolean {
    try {
      const importedData = JSON.parse(jsonData) as TrainingData[]
      const existingData = this.getTrainingData()

      // Mesclar dados, evitando duplicatas
      const mergedData = [...existingData]
      for (const newData of importedData) {
        const existingIndex = mergedData.findIndex((d) => d.imageHash === newData.imageHash)
        if (existingIndex >= 0) {
          mergedData[existingIndex] = newData // Substituir se já existe
        } else {
          mergedData.push(newData)
        }
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedData))
      return true
    } catch (error) {
      console.error("Erro ao importar dados:", error)
      return false
    }
  }
}

// Utilitários para coordenadas
export class CoordinateUtils {
  // Converter coordenadas da tela para coordenadas da imagem
  static screenToImage(
    screenCoords: { x: number; y: number; width: number; height: number },
    imageElement: HTMLImageElement,
  ): { x: number; y: number; width: number; height: number } {
    const rect = imageElement.getBoundingClientRect()
    const scaleX = imageElement.naturalWidth / rect.width
    const scaleY = imageElement.naturalHeight / rect.height

    return {
      x: (screenCoords.x - rect.left) * scaleX,
      y: (screenCoords.y - rect.top) * scaleY,
      width: screenCoords.width * scaleX,
      height: screenCoords.height * scaleY,
    }
  }

  // Converter coordenadas da imagem para coordenadas da tela
  static imageToScreen(
    imageCoords: { x: number; y: number; width: number; height: number },
    imageElement: HTMLImageElement,
  ): { x: number; y: number; width: number; height: number } {
    const rect = imageElement.getBoundingClientRect()
    const scaleX = rect.width / imageElement.naturalWidth
    const scaleY = rect.height / imageElement.naturalHeight

    return {
      x: imageCoords.x * scaleX + rect.left,
      y: imageCoords.y * scaleY + rect.top,
      width: imageCoords.width * scaleX,
      height: imageCoords.height * scaleY,
    }
  }

  // Normalizar coordenadas (0-1)
  static normalize(
    coords: { x: number; y: number; width: number; height: number },
    imageDimensions: { width: number; height: number },
  ): { x: number; y: number; width: number; height: number } {
    return {
      x: coords.x / imageDimensions.width,
      y: coords.y / imageDimensions.height,
      width: coords.width / imageDimensions.width,
      height: coords.height / imageDimensions.height,
    }
  }

  // Desnormalizar coordenadas
  static denormalize(
    normalizedCoords: { x: number; y: number; width: number; height: number },
    imageDimensions: { width: number; height: number },
  ): { x: number; y: number; width: number; height: number } {
    return {
      x: normalizedCoords.x * imageDimensions.width,
      y: normalizedCoords.y * imageDimensions.height,
      width: normalizedCoords.width * imageDimensions.width,
      height: normalizedCoords.height * imageDimensions.height,
    }
  }
}
