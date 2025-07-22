"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useApp } from "@/contexts/app-context"
import { ChefHat, Clock, Utensils, AlertTriangle, Target, Lightbulb, CheckCircle } from "lucide-react"

export function PersonalizedRecipes() {
  const { generatePersonalizedRecipes, addProduct } = useApp()

  const personalizedRecipes = generatePersonalizedRecipes()

  if (personalizedRecipes.length === 0) {
    return null
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case "macro_completion":
        return <Target className="w-4 h-4 text-blue-500" />
      case "balanced":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <ChefHat className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "border-orange-200 bg-orange-50"
      case "macro_completion":
        return "border-blue-200 bg-blue-50"
      case "balanced":
        return "border-green-200 bg-green-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "urgent":
        return "Urgente"
      case "macro_completion":
        return "Completar Macros"
      case "balanced":
        return "Balanceada"
      default:
        return "Personalizada"
    }
  }

  return (
    <Card className="border-indigo-200 bg-indigo-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-indigo-600" />
          <CardTitle className="text-indigo-800">Receitas Personalizadas</CardTitle>
        </div>
        <p className="text-sm text-indigo-700">Criadas especialmente para você com os produtos da sua despensa</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {personalizedRecipes.map((recipe) => (
          <Dialog key={recipe.id}>
            <DialogTrigger asChild>
              <div
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${getTypeColor(recipe.type)}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeIcon(recipe.type)}
                    <span className="font-medium">{recipe.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(recipe.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{recipe.reason}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recipe.estimatedTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Utensils className="w-3 h-3" />~{recipe.estimatedCalories} cal
                    </span>
                    <span>~{recipe.estimatedProtein}g prot</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ChefHat className="w-4 h-4" />
                </Button>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getTypeIcon(recipe.type)}
                  {recipe.name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.estimatedTime} minutos
                  </span>
                  <span className="flex items-center gap-1">
                    <Utensils className="w-4 h-4" />
                    {recipe.difficulty}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Motivo da Receita */}
                <div
                  className={`p-3 rounded-lg border-l-4 ${
                    recipe.type === "urgent"
                      ? "bg-orange-50 border-orange-400"
                      : recipe.type === "macro_completion"
                        ? "bg-blue-50 border-blue-400"
                        : "bg-green-50 border-green-400"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">Por que esta receita?</span>
                  </div>
                  <p className="text-sm text-gray-700">{recipe.reason}</p>
                </div>

                {/* Ingredientes Disponíveis */}
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Ingredientes Disponíveis na Despensa
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.availableIngredients.map((ingredient: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Informações Nutricionais Estimadas */}
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{recipe.estimatedCalories}</div>
                    <div className="text-xs text-gray-600">calorias</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{recipe.estimatedProtein}g</div>
                    <div className="text-xs text-gray-600">proteína</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{recipe.estimatedTime} min</div>
                    <div className="text-xs text-gray-600">preparo</div>
                  </div>
                </div>

                {/* Instruções Básicas */}
                <div>
                  <h3 className="font-medium mb-2">Instruções Sugeridas</h3>
                  <ol className="space-y-2 text-sm">
                    {recipe.instructions.map((instruction: string, index: number) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Dicas Adicionais */}
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Dica</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Esta é uma receita personalizada baseada nos seus produtos disponíveis. Sinta-se livre para ajustar
                    temperos e quantidades ao seu gosto!
                  </p>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Button className="flex-1 bg-transparent" variant="outline">
                    Salvar Receita
                  </Button>
                  <Button className="flex-1">Começar a Cozinhar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </CardContent>
    </Card>
  )
}
