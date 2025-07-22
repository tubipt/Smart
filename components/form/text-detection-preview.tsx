"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { TextDetector, type TextDetectionResult } from "@/lib/text-detection"
import { TextTrainingManager } from "@/lib/text-training"
import { TextRegionAnnotator } from "./text-region-annotator"
import { TrainingDashboard } from "./training-dashboard"
import {
  Eye,
  Search,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Target,
  BarChart3,
  RefreshCw,
  Loader2,
  Edit3,
  TrendingUp,
} from "lucide-react"

interface TextDetectionPreviewProps {
  file: File | null
  onDetectionComplete?: (result: TextDetectionResult) => void
  showDetailedAnalysis?: boolean
}

export function TextDetectionPreview({
  file,
  onDetectionComplete,
  showDetailedAnalysis = false,
}: TextDetectionPreviewProps) {
  const [detectionResult, setDetectionResult] = useState<TextDetectionResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showRegions, setShowRegions] = useState(false)
  const [showAnnotator, setShowAnnotator] = useState(false)
  const [showTrainingDashboard, setShowTrainingDashboard] = useState(false)
  const [improvedDetection, setImprovedDetection] = useState<TextDetectionResult | null>(null)

  useEffect(() => {
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
      performTextDetection(file)
    } else {
      setPreviewUrl(null)
      setDetectionResult(null)
      setImprovedDetection(null)
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [file])

  const performTextDetection = async (imageFile: File) => {
    setIsAnalyzing(true)
    try {
      const result = await TextDetector.detectText(imageFile)
      setDetectionResult(result)

      // Tentar melhorar com dados de treinamento
      const imageHash = await TextTrainingManager.generateImageHash(imageFile)
      const improvedRegions = TextTrainingManager.improveDetection(
        result.textRegions.map((region) => ({
          ...region,
          userMarked: false,
          createdAt: new Date().toISOString(),
          imageHash,
        })),
        imageHash,
      )

      if (improvedRegions.length !== result.textRegions.length) {
        const improvedResult = {
          ...result,
          textRegions: improvedRegions,
          confidence: Math.min(result.confidence + 0.1, 1), // Pequeno boost na confiança
        }
        setImprovedDetection(improvedResult)
        onDetectionComplete?.(improvedResult)
      } else {
        onDetectionComplete?.(result)
      }
    } catch (error) {
      console.error("Erro na detecção de texto:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return "text-green-600"
    if (confidence >= 0.4) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.7) return "Alta"
    if (confidence >= 0.4) return "Média"
    return "Baixa"
  }

  const currentResult = improvedDetection || detectionResult

  if (!file) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Status da Detecção */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="w-4 h-4" />
            Detecção de Texto
            {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
            {improvedDetection && (
              <Badge variant="outline" className="text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                Melhorada
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-blue-600 animate-pulse" />
                <span className="text-sm font-medium">Analisando imagem...</span>
              </div>
              <p className="text-xs text-gray-600">Detectando regiões de texto e aplicando melhorias</p>
            </div>
          ) : currentResult ? (
            <div className="space-y-3">
              {/* Resultado Principal */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentResult.hasText ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {currentResult.hasText ? "Texto Detectado" : "Nenhum Texto Encontrado"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getConfidenceColor(currentResult.confidence)}>
                    {getConfidenceLabel(currentResult.confidence)} ({Math.round(currentResult.confidence * 100)}%)
                  </Badge>
                </div>
              </div>

              {/* Métricas Rápidas */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Regiões encontradas:</span>
                  <span className="font-medium">{currentResult.textRegions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Qualidade geral:</span>
                  <span className="font-medium">{Math.round(currentResult.quality.overall * 100)}%</span>
                </div>
              </div>

              {/* Indicador de Melhoria */}
              {improvedDetection && (
                <Alert className="border-green-200 bg-green-50">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Detecção Melhorada!</strong> Aplicadas{" "}
                    {improvedDetection.textRegions.length - (detectionResult?.textRegions.length || 0)} correções
                    baseadas em treinamento anterior.
                  </AlertDescription>
                </Alert>
              )}

              {/* Recomendações Principais */}
              {currentResult.recommendations.length > 0 && (
                <div className="space-y-1">
                  {currentResult.recommendations.slice(0, 2).map((rec, index) => (
                    <Alert key={index} className="py-2">
                      <Info className="h-3 w-3" />
                      <AlertDescription className="text-xs">{rec}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAnnotator(!showAnnotator)}
                  className="bg-transparent"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  {showAnnotator ? "Fechar" : "Treinar"} Detecção
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTrainingDashboard(!showTrainingDashboard)}
                  className="bg-transparent"
                >
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Dashboard
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Anotador de Regiões */}
      {showAnnotator && currentResult && previewUrl && (
        <TextRegionAnnotator
          imageFile={file}
          imageUrl={previewUrl}
          detectedRegions={currentResult.textRegions.map((region) => ({
            ...region,
            userMarked: false,
            createdAt: new Date().toISOString(),
            imageHash: "",
          }))}
          onAnnotationsChange={(annotations) => {
            console.log("Anotações atualizadas:", annotations)
          }}
          onTrainingComplete={(trainingData) => {
            console.log("Treinamento completo:", trainingData)
            // Reprocessar detecção com novos dados
            if (file) {
              performTextDetection(file)
            }
          }}
        />
      )}

      {/* Dashboard de Treinamento */}
      {showTrainingDashboard && <TrainingDashboard />}

      {/* Análise Detalhada */}
      {showDetailedAnalysis && currentResult && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="w-4 h-4" />
                Análise Detalhada
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRegions(!showRegions)}
                className="bg-transparent"
              >
                <Target className="w-3 h-3 mr-1" />
                {showRegions ? "Ocultar" : "Mostrar"} Regiões
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Métricas de Qualidade */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Contraste</span>
                  <span>{Math.round(currentResult.quality.contrast * 100)}%</span>
                </div>
                <Progress value={currentResult.quality.contrast * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Nitidez</span>
                  <span>{Math.round(currentResult.quality.sharpness * 100)}%</span>
                </div>
                <Progress value={Math.min(currentResult.quality.sharpness * 100, 100)} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Brilho</span>
                  <span>{Math.round(currentResult.quality.brightness * 100)}%</span>
                </div>
                <Progress value={currentResult.quality.brightness * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Ruído</span>
                  <span>{Math.round((1 - currentResult.quality.noise) * 100)}%</span>
                </div>
                <Progress value={(1 - currentResult.quality.noise) * 100} className="h-2" />
              </div>
            </div>

            {/* Regiões de Texto */}
            {currentResult.textRegions.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Regiões de Texto Detectadas</h4>
                <div className="space-y-2">
                  {currentResult.textRegions.map((region, index) => (
                    <div key={region.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <div>
                        <span className="font-medium">Região {index + 1}</span>
                        <span className="text-gray-600 ml-2">
                          {region.width}×{region.height}px
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          ~{region.estimatedCharCount} chars
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getConfidenceColor(region.confidence)}`}>
                          {Math.round(region.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Todas as Recomendações */}
            {currentResult.recommendations.length > 2 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Todas as Recomendações</h4>
                <div className="space-y-1">
                  {currentResult.recommendations.slice(2).map((rec, index) => (
                    <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview com Regiões */}
      {showRegions && currentResult && previewUrl && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="w-4 h-4" />
              Preview com Regiões Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative inline-block">
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Preview com regiões de texto"
                className="max-w-full h-auto rounded border"
                style={{ maxHeight: "300px" }}
              />

              {/* Overlay das regiões detectadas */}
              <div className="absolute inset-0">
                {currentResult.textRegions.map((region, index) => {
                  // Calcular posição relativa na imagem exibida
                  const img = document.querySelector('img[alt="Preview com regiões de texto"]') as HTMLImageElement
                  if (!img) return null

                  const scaleX = img.clientWidth / img.naturalWidth
                  const scaleY = img.clientHeight / img.naturalHeight

                  return (
                    <div
                      key={region.id}
                      className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20"
                      style={{
                        left: `${region.x * scaleX}px`,
                        top: `${region.y * scaleY}px`,
                        width: `${region.width * scaleX}px`,
                        height: `${region.height * scaleY}px`,
                      }}
                    >
                      <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      {currentResult && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => file && performTextDetection(file)}
            disabled={isAnalyzing}
            className="bg-transparent"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Reanalisar
          </Button>

          {!showDetailedAnalysis && (
            <Button variant="outline" size="sm" onClick={() => setShowRegions(!showRegions)} className="bg-transparent">
              <Zap className="w-3 h-3 mr-1" />
              Análise Completa
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
