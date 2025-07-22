"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { TextTrainingManager, CoordinateUtils, type TextRegionAnnotation, type TrainingData } from "@/lib/text-training"
import { Target, Trash2, Save, RotateCcw, Eye, EyeOff, Star, Info, Edit3, Move, Square } from "lucide-react"

interface TextRegionAnnotatorProps {
  imageFile: File
  imageUrl: string
  detectedRegions: TextRegionAnnotation[]
  onAnnotationsChange?: (annotations: TextRegionAnnotation[]) => void
  onTrainingComplete?: (trainingData: TrainingData) => void
}

interface DrawingState {
  isDrawing: boolean
  startX: number
  startY: number
  currentRegion: Partial<TextRegionAnnotation> | null
}

export function TextRegionAnnotator({
  imageFile,
  imageUrl,
  detectedRegions,
  onAnnotationsChange,
  onTrainingComplete,
}: TextRegionAnnotatorProps) {
  const [userAnnotations, setUserAnnotations] = useState<TextRegionAnnotation[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentRegion: null,
  })
  const [showDetectedRegions, setShowDetectedRegions] = useState(true)
  const [showUserRegions, setShowUserRegions] = useState(true)
  const [mode, setMode] = useState<"select" | "draw" | "move">("select")
  const [feedback, setFeedback] = useState({
    overallQuality: 3,
    detectionAccuracy: 3,
    comments: "",
  })
  const [isTrainingMode, setIsTrainingMode] = useState(false)
  const [imageHash, setImageHash] = useState<string>("")

  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Gerar hash da imagem
  useEffect(() => {
    const generateHash = async () => {
      const hash = await TextTrainingManager.generateImageHash(imageFile)
      setImageHash(hash)

      // Carregar anotações existentes se houver
      const existingData = TextTrainingManager.getTrainingDataForImage(hash)
      if (existingData) {
        setUserAnnotations(existingData.annotations.filter((a) => a.userMarked))
        if (existingData.userFeedback) {
          setFeedback(existingData.userFeedback)
        }
      }
    }

    generateHash()
  }, [imageFile])

  // Iniciar desenho de região
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (mode !== "draw" || !imageRef.current) return

      const rect = imageRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setDrawingState({
        isDrawing: true,
        startX: x,
        startY: y,
        currentRegion: null,
      })
    },
    [mode],
  )

  // Continuar desenho
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!drawingState.isDrawing || !imageRef.current) return

      const rect = imageRef.current.getBoundingClientRect()
      const currentX = e.clientX - rect.left
      const currentY = e.clientY - rect.top

      const width = Math.abs(currentX - drawingState.startX)
      const height = Math.abs(currentY - drawingState.startY)
      const x = Math.min(currentX, drawingState.startX)
      const y = Math.min(currentY, drawingState.startY)

      setDrawingState((prev) => ({
        ...prev,
        currentRegion: { x, y, width, height },
      }))
    },
    [drawingState.isDrawing, drawingState.startX, drawingState.startY],
  )

  // Finalizar desenho
  const handleMouseUp = useCallback(() => {
    if (!drawingState.isDrawing || !drawingState.currentRegion || !imageRef.current) return

    const { x, y, width, height } = drawingState.currentRegion

    // Validar tamanho mínimo
    if (width < 10 || height < 10) {
      setDrawingState({
        isDrawing: false,
        startX: 0,
        startY: 0,
        currentRegion: null,
      })
      return
    }

    // Converter para coordenadas da imagem
    const imageCoords = CoordinateUtils.screenToImage(
      { x: x!, y: y!, width: width!, height: height! },
      imageRef.current,
    )

    // Criar nova anotação
    const newAnnotation: TextRegionAnnotation = {
      id: `user_${Date.now()}`,
      ...imageCoords,
      label: `Região ${userAnnotations.length + 1}`,
      confidence: 1.0,
      userMarked: true,
      createdAt: new Date().toISOString(),
      imageHash,
    }

    setUserAnnotations((prev) => [...prev, newAnnotation])
    setDrawingState({
      isDrawing: false,
      startX: 0,
      startY: 0,
      currentRegion: null,
    })

    onAnnotationsChange?.([...detectedRegions, ...userAnnotations, newAnnotation])
  }, [drawingState, userAnnotations, detectedRegions, imageHash, onAnnotationsChange])

  // Remover anotação
  const removeAnnotation = useCallback((id: string) => {
    setUserAnnotations((prev) => prev.filter((a) => a.id !== id))
    setSelectedRegion(null)
  }, [])

  // Atualizar label da região
  const updateRegionLabel = useCallback((id: string, label: string) => {
    setUserAnnotations((prev) => prev.map((a) => (a.id === id ? { ...a, label } : a)))
  }, [])

  // Salvar dados de treinamento
  const saveTrainingData = useCallback(() => {
    if (!imageRef.current) return

    const trainingData: TrainingData = {
      imageHash,
      originalDimensions: {
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      },
      annotations: [...detectedRegions, ...userAnnotations],
      userFeedback: feedback,
      createdAt: new Date().toISOString(),
    }

    TextTrainingManager.saveTrainingData(trainingData)
    onTrainingComplete?.(trainingData)

    // Feedback visual
    alert("Dados de treinamento salvos com sucesso!")
  }, [imageHash, detectedRegions, userAnnotations, feedback, onTrainingComplete])

  // Resetar anotações
  const resetAnnotations = useCallback(() => {
    setUserAnnotations([])
    setSelectedRegion(null)
    setFeedback({
      overallQuality: 3,
      detectionAccuracy: 3,
      comments: "",
    })
  }, [])

  // Renderizar região no overlay
  const renderRegion = useCallback(
    (region: TextRegionAnnotation, isSelected: boolean, isUserMarked: boolean) => {
      if (!imageRef.current) return null

      const screenCoords = CoordinateUtils.imageToScreen(region, imageRef.current)
      const rect = imageRef.current.getBoundingClientRect()

      return (
        <div
          key={region.id}
          className={`absolute border-2 cursor-pointer transition-all ${
            isUserMarked
              ? isSelected
                ? "border-blue-500 bg-blue-500 bg-opacity-20"
                : "border-blue-400 bg-blue-400 bg-opacity-10"
              : isSelected
                ? "border-green-500 bg-green-500 bg-opacity-20"
                : "border-green-400 bg-green-400 bg-opacity-10"
          }`}
          style={{
            left: screenCoords.x - rect.left,
            top: screenCoords.y - rect.top,
            width: screenCoords.width,
            height: screenCoords.height,
          }}
          onClick={() => setSelectedRegion(isSelected ? null : region.id)}
        >
          {/* Label da região */}
          <div
            className={`absolute -top-6 left-0 px-1 text-xs rounded ${
              isUserMarked ? "bg-blue-500 text-white" : "bg-green-500 text-white"
            }`}
          >
            {region.label}
          </div>

          {/* Indicador de confiança */}
          <div className="absolute -top-6 right-0 px-1 text-xs bg-gray-800 text-white rounded">
            {Math.round(region.confidence * 100)}%
          </div>

          {/* Botão de remoção para regiões do usuário */}
          {isUserMarked && isSelected && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-5 h-5 p-0 rounded-full"
              onClick={(e) => {
                e.stopPropagation()
                removeAnnotation(region.id)
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      )
    },
    [removeAnnotation],
  )

  return (
    <div className="space-y-4">
      {/* Controles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4" />
              Treinamento de Detecção
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={isTrainingMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsTrainingMode(!isTrainingMode)}
              >
                <Edit3 className="w-3 h-3 mr-1" />
                {isTrainingMode ? "Sair do Treino" : "Modo Treino"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Modos de Interação */}
          <div className="flex gap-2">
            <Button variant={mode === "select" ? "default" : "outline"} size="sm" onClick={() => setMode("select")}>
              <Target className="w-3 h-3 mr-1" />
              Selecionar
            </Button>
            <Button variant={mode === "draw" ? "default" : "outline"} size="sm" onClick={() => setMode("draw")}>
              <Square className="w-3 h-3 mr-1" />
              Desenhar
            </Button>
            <Button variant={mode === "move" ? "default" : "outline"} size="sm" onClick={() => setMode("move")}>
              <Move className="w-3 h-3 mr-1" />
              Mover
            </Button>
          </div>

          {/* Controles de Visualização */}
          <div className="flex gap-2">
            <Button
              variant={showDetectedRegions ? "default" : "outline"}
              size="sm"
              onClick={() => setShowDetectedRegions(!showDetectedRegions)}
            >
              {showDetectedRegions ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
              Auto ({detectedRegions.length})
            </Button>
            <Button
              variant={showUserRegions ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUserRegions(!showUserRegions)}
            >
              {showUserRegions ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
              Manual ({userAnnotations.length})
            </Button>
          </div>

          {/* Instruções */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {mode === "select" && "Clique nas regiões para selecioná-las e editá-las"}
              {mode === "draw" && "Clique e arraste para desenhar uma nova região de texto"}
              {mode === "move" && "Clique e arraste para mover regiões existentes"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Área de Anotação */}
      <Card>
        <CardContent className="p-4">
          <div
            ref={containerRef}
            className="relative inline-block border rounded overflow-hidden"
            style={{ cursor: mode === "draw" ? "crosshair" : "default" }}
          >
            <img
              ref={imageRef}
              src={imageUrl || "/placeholder.svg"}
              alt="Imagem para anotação"
              className="max-w-full h-auto"
              style={{ maxHeight: "500px" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              draggable={false}
            />

            {/* Overlay das regiões */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Regiões detectadas automaticamente */}
              {showDetectedRegions &&
                detectedRegions.map((region) => renderRegion(region, selectedRegion === region.id, false))}

              {/* Regiões marcadas pelo usuário */}
              {showUserRegions &&
                userAnnotations.map((region) => renderRegion(region, selectedRegion === region.id, true))}

              {/* Região sendo desenhada */}
              {drawingState.currentRegion && (
                <div
                  className="absolute border-2 border-dashed border-blue-500 bg-blue-500 bg-opacity-20"
                  style={{
                    left: drawingState.currentRegion.x,
                    top: drawingState.currentRegion.y,
                    width: drawingState.currentRegion.width,
                    height: drawingState.currentRegion.height,
                  }}
                />
              )}
            </div>

            {/* Overlay de eventos para desenho */}
            <div
              className="absolute inset-0"
              style={{
                pointerEvents: mode === "draw" ? "auto" : "none",
                cursor: mode === "draw" ? "crosshair" : "default",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />
          </div>
        </CardContent>
      </Card>

      {/* Painel de Edição da Região Selecionada */}
      {selectedRegion && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Editar Região</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const region = [...detectedRegions, ...userAnnotations].find((r) => r.id === selectedRegion)
              if (!region) return null

              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <Label>Posição</Label>
                      <div className="text-gray-600">
                        X: {Math.round(region.x)}, Y: {Math.round(region.y)}
                      </div>
                    </div>
                    <div>
                      <Label>Tamanho</Label>
                      <div className="text-gray-600">
                        {Math.round(region.width)} × {Math.round(region.height)}
                      </div>
                    </div>
                  </div>

                  {region.userMarked && (
                    <div>
                      <Label htmlFor="region-label">Nome da Região</Label>
                      <Input
                        id="region-label"
                        value={region.label}
                        onChange={(e) => updateRegionLabel(region.id, e.target.value)}
                        placeholder="Ex: Nome do produto, Data de validade..."
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={region.userMarked ? "default" : "secondary"}>
                        {region.userMarked ? "Manual" : "Automática"}
                      </Badge>
                      <Badge variant="outline">{Math.round(region.confidence * 100)}% confiança</Badge>
                    </div>

                    {region.userMarked && (
                      <Button variant="destructive" size="sm" onClick={() => removeAnnotation(region.id)}>
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Feedback de Treinamento */}
      {isTrainingMode && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="w-4 h-4" />
              Avaliação da Detecção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Qualidade Geral da Imagem (1-5)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[feedback.overallQuality]}
                  onValueChange={([value]) => setFeedback((prev) => ({ ...prev, overallQuality: value }))}
                  min={1}
                  max={5}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="outline">{feedback.overallQuality}/5</Badge>
              </div>
            </div>

            <div>
              <Label>Precisão da Detecção Automática (1-5)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[feedback.detectionAccuracy]}
                  onValueChange={([value]) => setFeedback((prev) => ({ ...prev, detectionAccuracy: value }))}
                  min={1}
                  max={5}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="outline">{feedback.detectionAccuracy}/5</Badge>
              </div>
            </div>

            <div>
              <Label htmlFor="comments">Comentários (Opcional)</Label>
              <Textarea
                id="comments"
                value={feedback.comments}
                onChange={(e) => setFeedback((prev) => ({ ...prev, comments: e.target.value }))}
                placeholder="Descreva problemas encontrados ou sugestões de melhoria..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Regiões Detectadas</div>
              <div className="text-gray-600">{detectedRegions.length} automáticas</div>
            </div>
            <div>
              <div className="font-medium">Regiões Manuais</div>
              <div className="text-gray-600">{userAnnotations.length} adicionadas</div>
            </div>
            <div>
              <div className="font-medium">Cobertura</div>
              <div className="text-gray-600">
                {Math.round(
                  ((detectedRegions.length + userAnnotations.length) / Math.max(detectedRegions.length, 1)) * 100,
                )}
                %
              </div>
            </div>
            <div>
              <div className="font-medium">Precisão Média</div>
              <div className="text-gray-600">
                {Math.round(
                  ([...detectedRegions, ...userAnnotations].reduce((sum, r) => sum + r.confidence, 0) /
                    Math.max(detectedRegions.length + userAnnotations.length, 1)) *
                    100,
                )}
                %
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-2">
        <Button onClick={saveTrainingData} className="flex-1">
          <Save className="w-3 h-3 mr-1" />
          Salvar Treinamento
        </Button>
        <Button variant="outline" onClick={resetAnnotations} className="bg-transparent">
          <RotateCcw className="w-3 h-3 mr-1" />
          Resetar
        </Button>
      </div>
    </div>
  )
}
