"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useApp } from "@/contexts/app-context"
import {
  ChefHat,
  Clock,
  Filter,
  Heart,
  Search,
  Flame,
  Utensils,
  Leaf,
  Wheat,
  Milk,
  Carrot,
  Egg,
  Star,
  ArrowUpDown,
  Check,
  Info,
  BarChart3,
} from "lucide-react"

export function NutritionalRecipes() {
  const {
    nutritionalRecipes,
    getRecommendedRecipes,
    toggleFavoriteRecipe,
    userDietaryPreferences,
    updateDietaryPreferences,
    nutritionalGoals,
    getTodayNutrition,
  } = useApp()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"match" | "time" | "calories" | "protein">("match")
  const [mealTypeFilter, setMealTypeFilter] = useState<string | null>(null)
  const [maxPrepTime, setMaxPrepTime] = useState(60)

  const todayNutrition = getTodayNutrition()
  const recommendedRecipes = getRecommendedRecipes()

  // Filtrar e ordenar receitas
  const filteredRecipes = recommendedRecipes
    .filter((recipe) => {
      // Filtro de pesquisa
      if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Filtro de tipo de refeição
      if (mealTypeFilter && recipe.mealType !== mealTypeFilter) {
        return false
      }

      // Filtro de tempo de preparo
      if (recipe.nutritionalInfo.totalTime > maxPrepTime) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "time":
          return a.nutritionalInfo.totalTime - b.nutritionalInfo.totalTime
        case "calories":
          return a.nutritionalInfo.calories - b.nutritionalInfo.calories
        case "protein":
          return b.nutritionalInfo.protein - a.nutritionalInfo.protein
        case "match":
        default:
          return (b.matchScore || 0) - (a.matchScore || 0)
      }
    })

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-orange-600"
  }

  const getCaloriePercentage = (calories: number) => {
    const remainingCalories = nutritionalGoals.calories - todayNutrition.calories
    return Math.min(100, Math.round((calories / remainingCalories) * 100))
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-green-600" />
              <CardTitle className="text-green-800">Receitas Nutricionais</CardTitle>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {nutritionalRecipes.length} receitas
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Receitas personalizadas com base nas suas metas nutricionais e preferências alimentares.
          </p>

          {/* Barra de pesquisa e filtros */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar receitas..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("match")}>
                  {sortBy === "match" && <Check className="mr-2 h-4 w-4" />}
                  Melhor correspondência
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("time")}>
                  {sortBy === "time" && <Check className="mr-2 h-4 w-4" />}
                  Tempo de preparo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("calories")}>
                  {sortBy === "calories" && <Check className="mr-2 h-4 w-4" />}
                  Menos calorias
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("protein")}>
                  {sortBy === "protein" && <Check className="mr-2 h-4 w-4" />}
                  Mais proteína
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Refeição</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={mealTypeFilter === null ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setMealTypeFilter(null)}
                  >
                    Todos
                  </Badge>
                  <Badge
                    variant={mealTypeFilter === "breakfast" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setMealTypeFilter("breakfast")}
                  >
                    Café da Manhã
                  </Badge>
                  <Badge
                    variant={mealTypeFilter === "lunch" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setMealTypeFilter("lunch")}
                  >
                    Almoço
                  </Badge>
                  <Badge
                    variant={mealTypeFilter === "dinner" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setMealTypeFilter("dinner")}
                  >
                    Jantar
                  </Badge>
                  <Badge
                    variant={mealTypeFilter === "snack" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setMealTypeFilter("snack")}
                  >
                    Lanche
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Tempo Máximo de Preparo: {maxPrepTime} min</Label>
                </div>
                <Slider
                  value={[maxPrepTime]}
                  min={5}
                  max={60}
                  step={5}
                  onValueChange={(value) => setMaxPrepTime(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label>Preferências Dietéticas</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <Label htmlFor="vegetarian">Vegetariano</Label>
                    </div>
                    <Switch
                      id="vegetarian"
                      checked={userDietaryPreferences.vegetarian}
                      onCheckedChange={(checked) => updateDietaryPreferences({ vegetarian: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Carrot className="w-4 h-4 text-orange-600" />
                      <Label htmlFor="vegan">Vegano</Label>
                    </div>
                    <Switch
                      id="vegan"
                      checked={userDietaryPreferences.vegan}
                      onCheckedChange={(checked) => updateDietaryPreferences({ vegan: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Wheat className="w-4 h-4 text-yellow-600" />
                      <Label htmlFor="glutenFree">Sem Glúten</Label>
                    </div>
                    <Switch
                      id="glutenFree"
                      checked={userDietaryPreferences.glutenFree}
                      onCheckedChange={(checked) => updateDietaryPreferences({ glutenFree: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Milk className="w-4 h-4 text-blue-600" />
                      <Label htmlFor="dairyFree">Sem Laticínios</Label>
                    </div>
                    <Switch
                      id="dairyFree"
                      checked={userDietaryPreferences.dairyFree}
                      onCheckedChange={(checked) => updateDietaryPreferences({ dairyFree: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-red-600" />
                      <Label htmlFor="lowCarb">Baixo Carbo</Label>
                    </div>
                    <Switch
                      id="lowCarb"
                      checked={userDietaryPreferences.lowCarb}
                      onCheckedChange={(checked) => updateDietaryPreferences({ lowCarb: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Egg className="w-4 h-4 text-purple-600" />
                      <Label htmlFor="highProtein">Alto Proteína</Label>
                    </div>
                    <Switch
                      id="highProtein"
                      checked={userDietaryPreferences.highProtein}
                      onCheckedChange={(checked) => updateDietaryPreferences({ highProtein: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Receitas */}
      <div className="space-y-4">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div
                  className="w-full md:w-1/3 h-48 md:h-auto bg-cover bg-center"
                  style={{ backgroundImage: `url(${recipe.imageUrl})` }}
                />
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{recipe.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4" />
                        {recipe.nutritionalInfo.totalTime} min
                        <Utensils className="w-4 h-4 ml-2" />
                        {recipe.complexity} de dificuldade
                        {recipe.matchScore && (
                          <>
                            <Star className={`w-4 h-4 ml-2 ${getMatchScoreColor(recipe.matchScore)}`} />
                            <span className={getMatchScoreColor(recipe.matchScore)}>
                              {Math.round(recipe.matchScore)}% match
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavoriteRecipe(recipe.id)}
                      className={recipe.isFavorite ? "text-red-500" : "text-gray-400"}
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {recipe.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {recipe.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{recipe.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <div className="font-medium text-blue-800">{recipe.nutritionalInfo.calories}</div>
                      <div className="text-xs text-blue-600">calorias</div>
                    </div>
                    <div className="bg-red-50 p-2 rounded text-center">
                      <div className="font-medium text-red-800">{recipe.nutritionalInfo.protein}g</div>
                      <div className="text-xs text-red-600">proteína</div>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded text-center">
                      <div className="font-medium text-yellow-800">{recipe.nutritionalInfo.carbs}g</div>
                      <div className="text-xs text-yellow-600">carboidratos</div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {getCaloriePercentage(recipe.nutritionalInfo.calories)}% das calorias restantes
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setSelectedRecipe(recipe)}>
                          Ver Receita
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-xl">{recipe.name}</DialogTitle>
                          <DialogDescription className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {recipe.nutritionalInfo.prepTime} min preparo • {recipe.nutritionalInfo.cookTime} min
                            cozimento
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

                            <div className="space-y-4">
                              <div>
                                <h3 className="font-medium mb-2 flex items-center gap-2">
                                  <BarChart3 className="w-4 h-4" />
                                  Informações Nutricionais
                                </h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="bg-gray-50 p-2 rounded">
                                    <span className="font-medium">Calorias:</span> {recipe.nutritionalInfo.calories}
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <span className="font-medium">Proteína:</span> {recipe.nutritionalInfo.protein}g
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <span className="font-medium">Carboidratos:</span> {recipe.nutritionalInfo.carbs}g
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <span className="font-medium">Gorduras:</span> {recipe.nutritionalInfo.fat}g
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <span className="font-medium">Fibras:</span> {recipe.nutritionalInfo.fiber}g
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <span className="font-medium">Sódio:</span> {recipe.nutritionalInfo.sodium}mg
                                  </div>
                                </div>
                              </div>

                              {recipe.tips && recipe.tips.length > 0 && (
                                <div>
                                  <h3 className="font-medium mb-2 flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    Dicas
                                  </h3>
                                  <ul className="space-y-1 text-sm">
                                    {recipe.tips.map((tip, index) => (
                                      <li key={index} className="bg-blue-50 p-2 rounded text-blue-800">
                                        {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
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
                        </div>

                        <div className="mt-4 flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => toggleFavoriteRecipe(recipe.id)}
                            className="flex items-center gap-2"
                          >
                            <Heart className={`w-4 h-4 ${recipe.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                            {recipe.isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                          </Button>
                          <Button>Registrar Consumo</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Nenhuma receita encontrada</p>
            <p className="text-sm text-gray-500 mt-1">Tente ajustar seus filtros ou preferências</p>
          </Card>
        )}
      </div>
    </div>
  )
}
