"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useApp } from "@/contexts/app-context"
import { Info, Zap, Heart, Brain, Apple, Shield } from "lucide-react"

interface ProductNutritionInfoProps {
  product: any
  trigger?: React.ReactNode
}

export function ProductNutritionInfo({ product, trigger }: ProductNutritionInfoProps) {
  const { consumeProduct, nutritionalGoals } = useApp()
  const [servings, setServings] = useState(1)
  const [isConsumeDialogOpen, setIsConsumeDialogOpen] = useState(false)

  if (!product.nutritionalInfo) {
    return null
  }

  const nutrition = product.nutritionalInfo
  const totalCalories = nutrition.calories * servings
  const totalProtein = nutrition.protein * servings
  const totalCarbs = nutrition.carbs * servings
  const totalFat = nutrition.fat * servings

  const handleConsume = () => {
    consumeProduct(product.id, servings)
    setIsConsumeDialogOpen(false)
    setServings(1)
  }

  const getNutrientLevel = (value: number, type: "calories" | "protein" | "carbs" | "fat" | "sodium") => {
    const dailyValues = {
      calories: 2000,
      protein: 50,
      carbs: 300,
      fat: 65,
      sodium: 2300,
    }

    const percentage = (value / dailyValues[type]) * 100
    if (percentage < 5) return { level: "Baixo", color: "text-green-600" }
    if (percentage < 20) return { level: "Moderado", color: "text-yellow-600" }
    return { level: "Alto", color: "text-red-600" }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Info className="w-4 h-4 mr-2" />
            Nutrição
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            {product.name}
          </DialogTitle>
          <DialogDescription>
            Informações nutricionais por {nutrition.servingSize}g{product.brand && ` • ${product.brand}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações Básicas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informações por Porção</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  Calorias
                </span>
                <span className="font-bold text-lg">{nutrition.calories} kcal</span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart className="w-3 h-3 text-red-500" />
                    <span className="font-medium">Proteína</span>
                  </div>
                  <div>{nutrition.protein}g</div>
                  <Badge variant="outline" className={getNutrientLevel(nutrition.protein, "protein").color}>
                    {getNutrientLevel(nutrition.protein, "protein").level}
                  </Badge>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Brain className="w-3 h-3 text-blue-500" />
                    <span className="font-medium">Carbs</span>
                  </div>
                  <div>{nutrition.carbs}g</div>
                  <Badge variant="outline" className={getNutrientLevel(nutrition.carbs, "carbs").color}>
                    {getNutrientLevel(nutrition.carbs, "carbs").level}
                  </Badge>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Apple className="w-3 h-3 text-yellow-500" />
                    <span className="font-medium">Gordura</span>
                  </div>
                  <div>{nutrition.fat}g</div>
                  <Badge variant="outline" className={getNutrientLevel(nutrition.fat, "fat").color}>
                    {getNutrientLevel(nutrition.fat, "fat").level}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Micronutrientes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Micronutrientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Fibras</span>
                    <span>{nutrition.fiber}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Açúcar</span>
                    <span>{nutrition.sugar}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sódio</span>
                    <span>{nutrition.sodium}mg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cálcio</span>
                    <span>{nutrition.calcium}mg</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ferro</span>
                    <span>{nutrition.iron}mg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vitamina C</span>
                    <span>{nutrition.vitaminC}mg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vitamina A</span>
                    <span>{nutrition.vitaminA}μg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Porções/embalagem</span>
                    <span>{nutrition.servingsPerPackage}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Simulador de Consumo */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-green-800">Simular Consumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="servings">Porções:</Label>
                <Input
                  id="servings"
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value) || 1)}
                  className="w-20"
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total de Calorias:</span>
                  <span className="font-bold">{totalCalories.toFixed(0)} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span>% da meta diária:</span>
                  <span>{((totalCalories / nutritionalGoals.calories) * 100).toFixed(1)}%</span>
                </div>
              </div>

              <Progress value={(totalCalories / nutritionalGoals.calories) * 100} className="h-2" />

              <Dialog open={isConsumeDialogOpen} onOpenChange={setIsConsumeDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-green-600 hover:bg-green-700">Marcar como Consumido</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar Consumo</DialogTitle>
                    <DialogDescription>
                      Você está prestes a registrar o consumo de {servings} porção{servings > 1 ? "ões" : ""} de{" "}
                      {product.name}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Calorias:</span>
                          <span className="font-medium">{totalCalories.toFixed(0)} kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Proteína:</span>
                          <span className="font-medium">{totalProtein.toFixed(1)}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carboidratos:</span>
                          <span className="font-medium">{totalCarbs.toFixed(1)}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gorduras:</span>
                          <span className="font-medium">{totalFat.toFixed(1)}g</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsConsumeDialogOpen(false)} className="flex-1">
                        Cancelar
                      </Button>
                      <Button onClick={handleConsume} className="flex-1 bg-green-600 hover:bg-green-700">
                        Confirmar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Benefícios Nutricionais */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Benefícios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {nutrition.protein > 10 && (
                <div className="p-2 bg-red-50 rounded">
                  <strong>Rica em Proteína:</strong> Ajuda na construção e manutenção muscular.
                </div>
              )}
              {nutrition.fiber > 3 && (
                <div className="p-2 bg-green-50 rounded">
                  <strong>Boa fonte de Fibras:</strong> Melhora a digestão e saúde intestinal.
                </div>
              )}
              {nutrition.calcium > 100 && (
                <div className="p-2 bg-blue-50 rounded">
                  <strong>Rico em Cálcio:</strong> Fortalece ossos e dentes.
                </div>
              )}
              {nutrition.vitaminC > 10 && (
                <div className="p-2 bg-orange-50 rounded">
                  <strong>Vitamina C:</strong> Fortalece o sistema imunológico.
                </div>
              )}
              {nutrition.sodium < 140 && (
                <div className="p-2 bg-green-50 rounded">
                  <strong>Baixo Sódio:</strong> Bom para a saúde cardiovascular.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
