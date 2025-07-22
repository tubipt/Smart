"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from "@/contexts/app-context"
import {
  Activity,
  Target,
  TrendingUp,
  Apple,
  Zap,
  Shield,
  Heart,
  Brain,
  Settings,
  Calendar,
  BarChart3,
  Info,
} from "lucide-react"
import { NutritionalGoalsForm } from "@/components/form/nutritional-goals-form"

export function NutritionalDashboard() {
  const {
    nutritionalGoals,
    updateNutritionalGoals,
    getTodayNutrition,
    getWeeklyNutrition,
    getNutritionalInsights,
    consumedProducts,
  } = useApp()

  const [isGoalsDialogOpen, setIsGoalsDialogOpen] = useState(false)
  const [tempGoals, setTempGoals] = useState(nutritionalGoals)

  const todayNutrition = getTodayNutrition()
  const weeklyNutrition = getWeeklyNutrition()
  const insights = getNutritionalInsights()

  const handleUpdateGoals = () => {
    updateNutritionalGoals(tempGoals)
    setIsGoalsDialogOpen(false)
  }

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100
    if (percentage < 50) return "bg-red-500"
    if (percentage < 80) return "bg-yellow-500"
    if (percentage <= 120) return "bg-green-500"
    return "bg-orange-500"
  }

  const formatNutrient = (value: number, unit: string) => {
    return `${value.toFixed(1)}${unit}`
  }

  const todayConsumedItems = consumedProducts.filter((cp) =>
    cp.consumedAt.startsWith(new Date().toISOString().split("T")[0]),
  )

  return (
    <div className="space-y-4">
      {/* Header com Resumo Diário */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-blue-800">Nutrição de Hoje</CardTitle>
            </div>
            <Dialog open={isGoalsDialogOpen} onOpenChange={setIsGoalsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Metas
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <NutritionalGoalsForm
                  initialGoals={tempGoals}
                  onSubmit={async (goals) => {
                    updateNutritionalGoals(goals)
                    setIsGoalsDialogOpen(false)
                  }}
                  onCancel={() => setIsGoalsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">{todayNutrition.calories.toFixed(0)}</div>
              <div className="text-sm text-blue-600">de {nutritionalGoals.calories} kcal</div>
              <Progress value={(todayNutrition.calories / nutritionalGoals.calories) * 100} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800">{todayConsumedItems.length}</div>
              <div className="text-sm text-green-600">produtos consumidos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Hoje</TabsTrigger>
          <TabsTrigger value="week">Semana</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {/* Macronutrientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Macronutrientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      Calorias
                    </span>
                    <span>
                      {formatNutrient(todayNutrition.calories, "kcal")} / {nutritionalGoals.calories}kcal
                    </span>
                  </div>
                  <Progress value={(todayNutrition.calories / nutritionalGoals.calories) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      Proteína
                    </span>
                    <span>
                      {formatNutrient(todayNutrition.protein, "g")} / {nutritionalGoals.protein}g
                    </span>
                  </div>
                  <Progress value={(todayNutrition.protein / nutritionalGoals.protein) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-500" />
                      Carboidratos
                    </span>
                    <span>
                      {formatNutrient(todayNutrition.carbs, "g")} / {nutritionalGoals.carbs}g
                    </span>
                  </div>
                  <Progress value={(todayNutrition.carbs / nutritionalGoals.carbs) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <Apple className="w-4 h-4 text-yellow-500" />
                      Gorduras
                    </span>
                    <span>
                      {formatNutrient(todayNutrition.fat, "g")} / {nutritionalGoals.fat}g
                    </span>
                  </div>
                  <Progress value={(todayNutrition.fat / nutritionalGoals.fat) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Micronutrientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Micronutrientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Fibras</span>
                    <span>{formatNutrient(todayNutrition.fiber, "g")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Açúcar</span>
                    <span>{formatNutrient(todayNutrition.sugar, "g")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sódio</span>
                    <span>{formatNutrient(todayNutrition.sodium, "mg")}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cálcio</span>
                    <span>{formatNutrient(todayNutrition.calcium, "mg")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ferro</span>
                    <span>{formatNutrient(todayNutrition.iron, "mg")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vitamina C</span>
                    <span>{formatNutrient(todayNutrition.vitaminC, "mg")}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Produtos Consumidos Hoje */}
          {todayConsumedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Consumido Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {todayConsumedItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-gray-600">
                        {item.servings} porção{item.servings > 1 ? "ões" : ""} •{" "}
                        {(item.nutritionalInfo.calories * item.servings).toFixed(0)} kcal
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(item.consumedAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Evolução Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyNutrition.map((dayNutrition, index) => {
                  const date = new Date()
                  date.setDate(date.getDate() - (6 - index))
                  const dayName = date.toLocaleDateString("pt-BR", { weekday: "short" })
                  const caloriePercentage = (dayNutrition.calories / nutritionalGoals.calories) * 100

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{dayName}</span>
                        <span>{dayNutrition.calories.toFixed(0)} kcal</span>
                      </div>
                      <Progress value={caloriePercentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Médias Semanais */}
          <Card>
            <CardHeader>
              <CardTitle>Médias da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Calorias/dia</span>
                    <span>{(weeklyNutrition.reduce((sum, day) => sum + day.calories, 0) / 7).toFixed(0)} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Proteína/dia</span>
                    <span>{(weeklyNutrition.reduce((sum, day) => sum + day.protein, 0) / 7).toFixed(1)} g</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Fibras/dia</span>
                    <span>{(weeklyNutrition.reduce((sum, day) => sum + day.fiber, 0) / 7).toFixed(1)} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sódio/dia</span>
                    <span>{(weeklyNutrition.reduce((sum, day) => sum + day.sodium, 0) / 7).toFixed(0)} mg</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Insights Nutricionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
                >
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{insight}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recomendações Baseadas na Despensa */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendações da Despensa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                <strong>Proteína:</strong> Você tem frango na despensa. É uma excelente fonte de proteína magra!
              </div>
              <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                <strong>Fibras:</strong> As bananas na sua fruteira são ricas em fibras e potássio.
              </div>
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                <strong>Cálcio:</strong> O iogurte e leite são ótimas fontes de cálcio para ossos fortes.
              </div>
            </CardContent>
          </Card>

          {/* Dicas de Saúde */}
          <Card>
            <CardHeader>
              <CardTitle>Dicas de Saúde</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-red-50 rounded">
                <strong>💡 Dica:</strong> Consuma pelo menos 5 porções de frutas e vegetais por dia para garantir
                vitaminas e minerais essenciais.
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <strong>💧 Hidratação:</strong> Beba pelo menos 2 litros de água por dia para manter o corpo hidratado.
              </div>
              <div className="p-3 bg-green-50 rounded">
                <strong>🥗 Variedade:</strong> Varie as cores dos alimentos no prato para garantir diferentes
                nutrientes.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
