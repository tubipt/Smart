"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/contexts/app-context"
import { ChefHat, Clock, Star, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function RecommendedRecipes() {
  const { getRecommendedRecipes, getTodayNutrition, nutritionalGoals } = useApp()

  const todayNutrition = getTodayNutrition()
  const recommendedRecipes = getRecommendedRecipes().slice(0, 3)

  // Calcular macronutrientes restantes
  const remainingCalories = Math.max(0, nutritionalGoals.calories - todayNutrition.calories)
  const remainingProtein = Math.max(0, nutritionalGoals.protein - todayNutrition.protein)
  const remainingCarbs = Math.max(0, nutritionalGoals.carbs - todayNutrition.carbs)

  if (recommendedRecipes.length === 0) {
    return null
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-green-600" />
            <CardTitle className="text-green-800">Receitas Recomendadas</CardTitle>
          </div>
          <Button
            variant="link"
            size="sm"
            className="text-green-700"
            onClick={() => {
              // Encontrar o elemento de navegação e clicar na aba nutrition
              const nutritionTab = document.querySelector('[value="nutrition"]') as HTMLElement
              if (nutritionTab) {
                nutritionTab.click()
                // Depois navegar para a sub-aba de receitas
                setTimeout(() => {
                  const recipesTab = document.querySelector('[value="recipes"]') as HTMLElement
                  if (recipesTab) recipesTab.click()
                }, 100)
              }
            }}
          >
            Ver todas
            <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-green-700">Baseadas nas suas metas nutricionais e alimentos disponíveis</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-blue-100 p-2 rounded">
            <div className="font-medium text-blue-800">{remainingCalories.toFixed(0)}</div>
            <div className="text-xs text-blue-600">calorias restantes</div>
          </div>
          <div className="bg-red-100 p-2 rounded">
            <div className="font-medium text-red-800">{remainingProtein.toFixed(0)}g</div>
            <div className="text-xs text-red-600">proteína restante</div>
          </div>
          <div className="bg-yellow-100 p-2 rounded">
            <div className="font-medium text-yellow-800">{remainingCarbs.toFixed(0)}g</div>
            <div className="text-xs text-yellow-600">carbos restantes</div>
          </div>
        </div>

        {recommendedRecipes.map((recipe) => (
          <div key={recipe.id} className="flex gap-3 p-3 bg-white rounded-lg shadow-sm">
            <div
              className="w-20 h-20 bg-cover bg-center rounded-md flex-shrink-0"
              style={{ backgroundImage: `url(${recipe.imageUrl})` }}
            />
            <div className="flex-1">
              <div className="font-medium">{recipe.name}</div>
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                <Clock className="w-3 h-3" />
                {recipe.nutritionalInfo.totalTime} min
                {recipe.matchScore && (
                  <>
                    <Star className="w-3 h-3 text-amber-500" />
                    <span className="text-amber-600">{Math.round(recipe.matchScore)}% match</span>
                  </>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs">
                    {recipe.nutritionalInfo.calories} kcal
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {recipe.nutritionalInfo.protein}g prot
                  </Badge>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Ver
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl">{recipe.name}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {recipe.nutritionalInfo.totalTime} min
                        <Star className="w-4 h-4 ml-2" />
                        {recipe.rating} ({recipe.reviews} avaliações)
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div
                          className="w-full h-64 bg-cover bg-center rounded-lg mb-4"
                          style={{ backgroundImage: `url(${recipe.imageUrl})` }}
                        />

                        <div>
                          <h3 className="font-medium mb-2">Ingredientes</h3>
                          <ul className="space-y-1 text-sm">
                            {recipe.ingredients.map((ingredient, index) => (
                              <li key={index} className="flex justify-between p-2 border-b">
                                <span>{ingredient.name}</span>
                                <span className="text-gray-600">{ingredient.amount}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Modo de Preparo</h3>
                        <ol className="space-y-2 text-sm">
                          {recipe.steps.map((step, index) => (
                            <li key={index} className="p-2 bg-gray-50 rounded">
                              <span className="font-bold mr-2">{index + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
