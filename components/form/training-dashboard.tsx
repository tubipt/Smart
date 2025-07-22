"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TextTrainingManager, type TrainingData } from "@/lib/text-training"
import {
  BarChart3,
  TrendingUp,
  Target,
  Download,
  Upload,
  Trash2,
  Calendar,
  Star,
  Eye,
  RefreshCw,
  Info,
} from "lucide-react"

export function TrainingDashboard() {
  const [trainingData, setTrainingData] = useState<TrainingData[]>([])
  const [stats, setStats] = useState({
    totalImages: 0,
    totalAnnotations: 0,
    averageQuality: 0,
    averageAccuracy: 0,
    recentActivity: 0,
  })
  const [selectedData, setSelectedData] = useState<TrainingData | null>(null)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  // Carregar dados
  useEffect(() => {
    loadTrainingData()
  }, [])

  const loadTrainingData = () => {
    const data = TextTrainingManager.getTrainingData()
    const statistics = TextTrainingManager.getTrainingStats()
    setTrainingData(data)
    setStats(statistics)
  }

  const handleExport = () => {
    const exportData = TextTrainingManager.exportTrainingData()
    const blob = new Blob([exportData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `despensa-training-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string
        const success = TextTrainingManager.importTrainingData(jsonData)
        if (success) {
          loadTrainingData()
          alert("Dados importados com sucesso!")
        } else {
          alert("Erro ao importar dados. Verifique o formato do arquivo.")
        }
      } catch (error) {
        alert("Erro ao processar arquivo. Verifique se é um JSON válido.")
      }
    }
    reader.readAsText(file)
  }

  const handleCleanOldData = () => {
    if (confirm("Remover dados de treinamento com mais de 30 dias?")) {
      TextTrainingManager.cleanOldData(30)
      loadTrainingData()
    }
  }

  const getQualityColor = (quality: number) => {
    if (quality >= 4) return "text-green-600"
    if (quality >= 3) return "text-yellow-600"
    return "text-red-600"
  }

  const getQualityLabel = (quality: number) => {
    if (quality >= 4) return "Excelente"
    if (quality >= 3) return "Boa"
    if (quality >= 2) return "Regular"
    return "Ruim"
  }

  return (
    <div className="space-y-4">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.totalImages}</div>
            <div className="text-sm text-gray-600">Imagens Treinadas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{stats.totalAnnotations}</div>
            <div className="text-sm text-gray-600">Anotações Totais</div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Qualidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Métricas de Qualidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Qualidade Média das Imagens</span>
              <span className={getQualityColor(stats.averageQuality)}>
                {getQualityLabel(stats.averageQuality)} ({stats.averageQuality.toFixed(1)}/5)
              </span>
            </div>
            <Progress value={(stats.averageQuality / 5) * 100} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Precisão da Detecção</span>
              <span className={getQualityColor(stats.averageAccuracy)}>
                {getQualityLabel(stats.averageAccuracy)} ({stats.averageAccuracy.toFixed(1)}/5)
              </span>
            </div>
            <Progress value={(stats.averageAccuracy / 5) * 100} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span>Atividade Recente (7 dias)</span>
            <Badge variant="outline">{stats.recentActivity} sessões</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Dados de Treinamento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Histórico de Treinamento</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadTrainingData}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={handleCleanOldData}>
                <Trash2 className="w-3 h-3 mr-1" />
                Limpar Antigos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {trainingData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado de treinamento encontrado</p>
              <p className="text-sm mt-1">Comece anotando algumas imagens para melhorar a detecção</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trainingData
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 10)
                .map((data) => (
                  <div
                    key={data.imageHash}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedData(data)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Imagem #{data.imageHash.substring(0, 8)}</span>
                        <Badge variant="outline" className="text-xs">
                          {data.annotations.filter((a) => a.userMarked).length} anotações
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(data.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Qualidade: {data.userFeedback?.overallQuality || 0}/5
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          Precisão: {data.userFeedback?.detectionAccuracy || 0}/5
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

              {trainingData.length > 10 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  +{trainingData.length - 10} registros mais antigos
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-2">
        <Button onClick={handleExport} variant="outline" className="flex-1 bg-transparent">
          <Download className="w-3 h-3 mr-1" />
          Exportar Dados
        </Button>

        <div className="flex-1">
          <input type="file" accept=".json" onChange={handleImport} className="hidden" id="import-training" />
          <Button asChild variant="outline" className="w-full bg-transparent">
            <label htmlFor="import-training" className="cursor-pointer">
              <Upload className="w-3 h-3 mr-1" />
              Importar Dados
            </label>
          </Button>
        </div>
      </div>

      {/* Dicas de Uso */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Dicas para melhor treinamento:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Marque regiões de texto que não foram detectadas automaticamente</li>
            <li>• Corrija regiões detectadas incorretamente</li>
            <li>• Avalie a qualidade das imagens para melhorar futuras detecções</li>
            <li>• Use nomes descritivos para as regiões (ex: "Nome do produto", "Data de validade")</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Modal de Detalhes */}
      {selectedData && (
        <Dialog open={!!selectedData} onOpenChange={() => setSelectedData(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detalhes do Treinamento</DialogTitle>
              <DialogDescription>
                Imagem #{selectedData.imageHash.substring(0, 8)} •{" "}
                {new Date(selectedData.createdAt).toLocaleDateString("pt-BR")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Dimensões da Imagem */}
              <div>
                <h4 className="font-medium mb-2">Informações da Imagem</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    Dimensões: {selectedData.originalDimensions.width} × {selectedData.originalDimensions.height}px
                  </div>
                  <div>Hash: {selectedData.imageHash}</div>
                </div>
              </div>

              {/* Anotações */}
              <div>
                <h4 className="font-medium mb-2">Anotações</h4>
                <div className="space-y-2">
                  {selectedData.annotations.map((annotation, index) => (
                    <div
                      key={annotation.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                    >
                      <div>
                        <span className="font-medium">{annotation.label}</span>
                        <div className="text-gray-600">
                          {Math.round(annotation.width)} × {Math.round(annotation.height)}px
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={annotation.userMarked ? "default" : "secondary"} className="text-xs">
                          {annotation.userMarked ? "Manual" : "Auto"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(annotation.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback do Usuário */}
              {selectedData.userFeedback && (
                <div>
                  <h4 className="font-medium mb-2">Avaliação</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Qualidade da Imagem:</span>
                      <Badge variant="outline">{selectedData.userFeedback.overallQuality}/5</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Precisão da Detecção:</span>
                      <Badge variant="outline">{selectedData.userFeedback.detectionAccuracy}/5</Badge>
                    </div>
                    {selectedData.userFeedback.comments && (
                      <div>
                        <span className="font-medium">Comentários:</span>
                        <p className="text-gray-600 mt-1">{selectedData.userFeedback.comments}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
