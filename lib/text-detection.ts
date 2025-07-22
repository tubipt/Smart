// Biblioteca para detecção de texto em imagens
export interface TextDetectionResult {
  hasText: boolean
  confidence: number
  textRegions: TextRegion[]
  quality: TextQuality
  recommendations: string[]
}

export interface TextRegion {
  x: number
  y: number
  width: number
  height: number
  confidence: number
  estimatedCharCount: number
}

export interface TextQuality {
  contrast: number
  sharpness: number
  brightness: number
  noise: number
  overall: number
}

export class TextDetector {
  private static readonly MIN_TEXT_CONFIDENCE = 0.3
  private static readonly MIN_CONTRAST_RATIO = 0.15
  private static readonly MIN_SHARPNESS = 0.2

  static async detectText(file: File): Promise<TextDetectionResult> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        try {
          // Redimensionar para análise mais eficiente
          const maxSize = 800
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
          canvas.width = img.width * scale
          canvas.height = img.height * scale

          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
          if (!imageData) {
            resolve(this.createFailureResult("Erro ao processar imagem"))
            return
          }

          const result = this.analyzeImageForText(imageData, canvas.width, canvas.height)
          resolve(result)
        } catch (error) {
          resolve(this.createFailureResult("Erro na análise de texto"))
        } finally {
          URL.revokeObjectURL(url)
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(this.createFailureResult("Erro ao carregar imagem"))
      }

      img.src = url
    })
  }

  private static analyzeImageForText(imageData: ImageData, width: number, height: number): TextDetectionResult {
    const pixels = imageData.data
    const grayscale = this.convertToGrayscale(pixels, width, height)

    // Análises de qualidade
    const contrast = this.calculateContrast(grayscale)
    const sharpness = this.calculateSharpness(grayscale, width, height)
    const brightness = this.calculateBrightness(grayscale)
    const noise = this.calculateNoise(grayscale, width, height)

    // Detecção de bordas para encontrar texto
    const edges = this.detectEdges(grayscale, width, height)
    const textRegions = this.findTextRegions(edges, width, height)

    // Análise de padrões de texto
    const textPatterns = this.analyzeTextPatterns(grayscale, textRegions, width, height)

    // Calcular confiança geral
    const confidence = this.calculateTextConfidence(contrast, sharpness, brightness, textRegions, textPatterns)

    const quality: TextQuality = {
      contrast,
      sharpness,
      brightness,
      noise,
      overall: (contrast + sharpness + (1 - noise) + this.normalizedBrightness(brightness)) / 4,
    }

    const recommendations = this.generateRecommendations(quality, textRegions, confidence)

    return {
      hasText: confidence > this.MIN_TEXT_CONFIDENCE,
      confidence,
      textRegions,
      quality,
      recommendations,
    }
  }

  private static convertToGrayscale(pixels: Uint8ClampedArray, width: number, height: number): number[] {
    const grayscale: number[] = []
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      // Fórmula de luminância
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      grayscale.push(gray / 255)
    }
    return grayscale
  }

  private static calculateContrast(grayscale: number[]): number {
    let min = 1
    let max = 0

    for (const pixel of grayscale) {
      min = Math.min(min, pixel)
      max = Math.max(max, pixel)
    }

    return max - min
  }

  private static calculateSharpness(grayscale: number[], width: number, height: number): number {
    let sharpness = 0
    let count = 0

    // Operador Laplaciano para detectar bordas
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        const laplacian =
          -4 * grayscale[idx] +
          grayscale[idx - 1] +
          grayscale[idx + 1] +
          grayscale[idx - width] +
          grayscale[idx + width]

        sharpness += Math.abs(laplacian)
        count++
      }
    }

    return count > 0 ? sharpness / count : 0
  }

  private static calculateBrightness(grayscale: number[]): number {
    const sum = grayscale.reduce((acc, pixel) => acc + pixel, 0)
    return sum / grayscale.length
  }

  private static calculateNoise(grayscale: number[], width: number, height: number): number {
    let noise = 0
    let count = 0

    // Detectar ruído usando variação local
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        const center = grayscale[idx]

        const neighbors = [grayscale[idx - 1], grayscale[idx + 1], grayscale[idx - width], grayscale[idx + width]]

        const avgNeighbor = neighbors.reduce((sum, n) => sum + n, 0) / neighbors.length
        const variation = Math.abs(center - avgNeighbor)

        noise += variation
        count++
      }
    }

    return count > 0 ? noise / count : 0
  }

  private static detectEdges(grayscale: number[], width: number, height: number): number[] {
    const edges: number[] = new Array(grayscale.length).fill(0)

    // Filtro Sobel para detecção de bordas
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x

        // Gradiente horizontal (Gx)
        const gx =
          -1 * grayscale[idx - width - 1] +
          1 * grayscale[idx - width + 1] +
          -2 * grayscale[idx - 1] +
          2 * grayscale[idx + 1] +
          -1 * grayscale[idx + width - 1] +
          1 * grayscale[idx + width + 1]

        // Gradiente vertical (Gy)
        const gy =
          -1 * grayscale[idx - width - 1] +
          -2 * grayscale[idx - width] +
          -1 * grayscale[idx - width + 1] +
          1 * grayscale[idx + width - 1] +
          2 * grayscale[idx + width] +
          1 * grayscale[idx + width + 1]

        // Magnitude do gradiente
        edges[idx] = Math.sqrt(gx * gx + gy * gy)
      }
    }

    return edges
  }

  private static findTextRegions(edges: number[], width: number, height: number): TextRegion[] {
    const threshold = 0.1
    const minRegionSize = 20
    const regions: TextRegion[] = []

    // Encontrar regiões com alta densidade de bordas
    const blockSize = 20
    for (let y = 0; y < height - blockSize; y += blockSize) {
      for (let x = 0; x < width - blockSize; x += blockSize) {
        let edgeCount = 0
        let totalEdgeStrength = 0

        // Analisar bloco
        for (let by = y; by < Math.min(y + blockSize, height); by++) {
          for (let bx = x; bx < Math.min(x + blockSize, width); bx++) {
            const edgeStrength = edges[by * width + bx]
            if (edgeStrength > threshold) {
              edgeCount++
              totalEdgeStrength += edgeStrength
            }
          }
        }

        const edgeDensity = edgeCount / (blockSize * blockSize)
        const avgEdgeStrength = edgeCount > 0 ? totalEdgeStrength / edgeCount : 0

        // Se há densidade suficiente de bordas, pode ser texto
        if (edgeDensity > 0.1 && avgEdgeStrength > 0.2) {
          regions.push({
            x,
            y,
            width: blockSize,
            height: blockSize,
            confidence: Math.min(edgeDensity * avgEdgeStrength, 1),
            estimatedCharCount: Math.round(edgeCount / 10), // Estimativa grosseira
          })
        }
      }
    }

    // Mesclar regiões adjacentes
    return this.mergeAdjacentRegions(regions)
  }

  private static mergeAdjacentRegions(regions: TextRegion[]): TextRegion[] {
    const merged: TextRegion[] = []
    const used = new Set<number>()

    for (let i = 0; i < regions.length; i++) {
      if (used.has(i)) continue

      let currentRegion = { ...regions[i] }
      used.add(i)

      // Procurar regiões adjacentes
      let foundAdjacent = true
      while (foundAdjacent) {
        foundAdjacent = false

        for (let j = 0; j < regions.length; j++) {
          if (used.has(j)) continue

          const region = regions[j]
          const distance = Math.sqrt(Math.pow(currentRegion.x - region.x, 2) + Math.pow(currentRegion.y - region.y, 2))

          // Se estão próximas, mesclar
          if (distance < 40) {
            const newX = Math.min(currentRegion.x, region.x)
            const newY = Math.min(currentRegion.y, region.y)
            const newWidth = Math.max(currentRegion.x + currentRegion.width, region.x + region.width) - newX
            const newHeight = Math.max(currentRegion.y + currentRegion.height, region.y + region.height) - newY

            currentRegion = {
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight,
              confidence: Math.max(currentRegion.confidence, region.confidence),
              estimatedCharCount: currentRegion.estimatedCharCount + region.estimatedCharCount,
            }

            used.add(j)
            foundAdjacent = true
          }
        }
      }

      merged.push(currentRegion)
    }

    return merged.filter((region) => region.width * region.height > 400) // Filtrar regiões muito pequenas
  }

  private static analyzeTextPatterns(
    grayscale: number[],
    regions: TextRegion[],
    width: number,
    height: number,
  ): number {
    let patternScore = 0

    for (const region of regions) {
      // Analisar padrões horizontais (linhas de texto)
      const horizontalLines = this.detectHorizontalLines(grayscale, region, width)

      // Analisar espaçamento regular (característico de texto)
      const regularSpacing = this.detectRegularSpacing(grayscale, region, width)

      // Analisar densidade de caracteres
      const charDensity = this.estimateCharacterDensity(grayscale, region, width)

      patternScore += (horizontalLines + regularSpacing + charDensity) / 3
    }

    return regions.length > 0 ? patternScore / regions.length : 0
  }

  private static detectHorizontalLines(grayscale: number[], region: TextRegion, width: number): number {
    let lineScore = 0
    const samples = 5

    for (let i = 0; i < samples; i++) {
      const y = Math.floor(region.y + (region.height * i) / samples)
      if (y >= region.y + region.height) continue

      let transitions = 0
      let lastPixel = grayscale[y * width + region.x]

      for (let x = region.x + 1; x < region.x + region.width; x++) {
        const currentPixel = grayscale[y * width + x]
        if (Math.abs(currentPixel - lastPixel) > 0.3) {
          transitions++
        }
        lastPixel = currentPixel
      }

      // Texto típico tem várias transições por linha
      const transitionDensity = transitions / region.width
      if (transitionDensity > 0.1 && transitionDensity < 0.8) {
        lineScore += transitionDensity
      }
    }

    return lineScore / samples
  }

  private static detectRegularSpacing(grayscale: number[], region: TextRegion, width: number): number {
    // Analisar espaçamento vertical entre possíveis linhas de texto
    const rowIntensities: number[] = []

    for (let y = region.y; y < region.y + region.height; y++) {
      let rowSum = 0
      for (let x = region.x; x < region.x + region.width; x++) {
        rowSum += grayscale[y * width + x]
      }
      rowIntensities.push(rowSum / region.width)
    }

    // Detectar picos e vales (linhas de texto vs espaços)
    let peaks = 0
    let valleys = 0

    for (let i = 1; i < rowIntensities.length - 1; i++) {
      const prev = rowIntensities[i - 1]
      const curr = rowIntensities[i]
      const next = rowIntensities[i + 1]

      if (curr > prev && curr > next && curr - Math.min(prev, next) > 0.1) {
        peaks++
      } else if (curr < prev && curr < next && Math.max(prev, next) - curr > 0.1) {
        valleys++
      }
    }

    // Texto bem estruturado tem alternância regular de picos e vales
    const regularityScore = Math.min(peaks, valleys) / (rowIntensities.length / 10)
    return Math.min(regularityScore, 1)
  }

  private static estimateCharacterDensity(grayscale: number[], region: TextRegion, width: number): number {
    // Estimar densidade de caracteres baseado em transições
    let totalTransitions = 0
    let totalPixels = 0

    for (let y = region.y; y < region.y + region.height; y++) {
      for (let x = region.x + 1; x < region.x + region.width; x++) {
        const current = grayscale[y * width + x]
        const previous = grayscale[y * width + x - 1]

        if (Math.abs(current - previous) > 0.2) {
          totalTransitions++
        }
        totalPixels++
      }
    }

    const transitionDensity = totalPixels > 0 ? totalTransitions / totalPixels : 0

    // Densidade típica de texto está entre 0.1 e 0.4
    if (transitionDensity >= 0.1 && transitionDensity <= 0.4) {
      return 1
    } else if (transitionDensity > 0.05 && transitionDensity < 0.6) {
      return 0.5
    }

    return 0
  }

  private static calculateTextConfidence(
    contrast: number,
    sharpness: number,
    brightness: number,
    textRegions: TextRegion[],
    textPatterns: number,
  ): number {
    // Pesos para diferentes fatores
    const contrastWeight = 0.25
    const sharpnessWeight = 0.25
    const brightnessWeight = 0.15
    const regionsWeight = 0.2
    const patternsWeight = 0.15

    // Normalizar brilho (ideal entre 0.3 e 0.7)
    const normalizedBrightness = this.normalizedBrightness(brightness)

    // Pontuação das regiões de texto
    const regionScore =
      Math.min(textRegions.length / 3, 1) *
      (textRegions.reduce((sum, r) => sum + r.confidence, 0) / Math.max(textRegions.length, 1))

    // Calcular confiança final
    const confidence =
      contrast * contrastWeight +
      Math.min(sharpness * 10, 1) * sharpnessWeight +
      normalizedBrightness * brightnessWeight +
      regionScore * regionsWeight +
      textPatterns * patternsWeight

    return Math.min(confidence, 1)
  }

  private static normalizedBrightness(brightness: number): number {
    // Brilho ideal entre 0.3 e 0.7
    if (brightness >= 0.3 && brightness <= 0.7) {
      return 1
    } else if (brightness >= 0.2 && brightness <= 0.8) {
      return 0.7
    } else if (brightness >= 0.1 && brightness <= 0.9) {
      return 0.4
    }
    return 0.1
  }

  private static generateRecommendations(
    quality: TextQuality,
    textRegions: TextRegion[],
    confidence: number,
  ): string[] {
    const recommendations: string[] = []

    if (confidence < 0.3) {
      recommendations.push("⚠️ Pouco ou nenhum texto detectado na imagem")
    }

    if (quality.contrast < 0.3) {
      recommendations.push("📈 Aumente o contraste - use melhor iluminação ou ajuste a exposição")
    }

    if (quality.sharpness < 0.2) {
      recommendations.push("🎯 Imagem desfocada - mantenha a câmera estável e foque no texto")
    }

    if (quality.brightness < 0.2) {
      recommendations.push("💡 Imagem muito escura - adicione mais luz ou use flash")
    } else if (quality.brightness > 0.8) {
      recommendations.push("🌞 Imagem muito clara - reduza a exposição ou evite luz direta")
    }

    if (quality.noise > 0.4) {
      recommendations.push("📱 Muito ruído na imagem - limpe a lente da câmera")
    }

    if (textRegions.length === 0) {
      recommendations.push("🔍 Nenhuma região de texto encontrada - posicione o rótulo centralmente")
    } else if (textRegions.length > 10) {
      recommendations.push("📏 Muitas regiões detectadas - aproxime-se mais do texto principal")
    }

    if (quality.overall > 0.7 && confidence > 0.6) {
      recommendations.push("✅ Boa qualidade para OCR - prossiga com a digitalização")
    }

    return recommendations
  }

  private static createFailureResult(error: string): TextDetectionResult {
    return {
      hasText: false,
      confidence: 0,
      textRegions: [],
      quality: {
        contrast: 0,
        sharpness: 0,
        brightness: 0,
        noise: 1,
        overall: 0,
      },
      recommendations: [error],
    }
  }

  // Método para análise rápida (menos precisa, mais rápida)
  static async quickTextCheck(file: File): Promise<{ hasText: boolean; confidence: number }> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        try {
          // Análise em baixa resolução para velocidade
          const size = 200
          canvas.width = size
          canvas.height = size

          ctx?.drawImage(img, 0, 0, size, size)
          const imageData = ctx?.getImageData(0, 0, size, size)

          if (!imageData) {
            resolve({ hasText: false, confidence: 0 })
            return
          }

          const grayscale = this.convertToGrayscale(imageData.data, size, size)
          const contrast = this.calculateContrast(grayscale)
          const sharpness = this.calculateSharpness(grayscale, size, size)

          // Análise simplificada
          const confidence = (contrast + Math.min(sharpness * 10, 1)) / 2
          const hasText = confidence > 0.25

          resolve({ hasText, confidence })
        } catch {
          resolve({ hasText: false, confidence: 0 })
        } finally {
          URL.revokeObjectURL(url)
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({ hasText: false, confidence: 0 })
      }

      img.src = url
    })
  }
}
