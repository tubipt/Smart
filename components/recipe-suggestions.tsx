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
import { ChefHat, Clock, AlertTriangle, Users, Star } from "lucide-react"

export function RecipeSuggestions() {
  const { getSuggestedRecipes, getExpiringProducts } = useApp()

  const suggestedRecipes = getSuggestedRecipes()
  const expiringProducts = getExpiringProducts(5)

  if (expiringProducts.length === 0 && suggestedRecipes.length === 0) {
    return null
  }

  const difficultyColors = {
    Fácil: "bg-green-100 text-green-800",
    Médio: "bg-yellow-100 text-yellow-800",
    Difícil: "bg-red-100 text-red-800",
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-orange-600" />
          <CardTitle className="text-orange-800">Receitas Sugeridas</CardTitle>
        </div>
        {expiringProducts.length > 0 && (
          <p className="text-sm text-orange-700">Aproveite os produtos que vão expirar em breve</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Produtos que vão expirar */}
        {expiringProducts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {expiringProducts.slice(0, 4).map((product) => (
              <Badge key={product.id} variant="outline" className="text-orange-800 border-orange-300">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {product.name} ({getDaysUntilExpiry(product.expiryDate)}d)
              </Badge>
            ))}
            {expiringProducts.length > 4 && (
              <Badge variant="outline" className="text-orange-800 border-orange-300">
                +{expiringProducts.length - 4} mais
              </Badge>
            )}
          </div>
        )}

        {/* Receitas sugeridas */}
        <div className="space-y-2">
          {suggestedRecipes.length > 0 ? (
            suggestedRecipes.slice(0, 3).map((recipe) => (
              <Dialog key={recipe.id}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-auto p-3 bg-white hover:bg-orange-100">
                    <div className="text-left">
                      <div className="font-medium">{recipe.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" />
                        {recipe.cookTime}
                        <Users className="w-3 h-3" />
                        {recipe.servings}
                        <Badge className={difficultyColors[recipe.difficulty]} variant="secondary">
                          {recipe.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <ChefHat className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <ChefHat className="w-5 h-5" />
                      {recipe.name}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {recipe.cookTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {recipe.servings} porções
                      </span>
                      <Badge className={difficultyColors[recipe.difficulty]} variant="secondary">
                        {recipe.difficulty}
                      </Badge>
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Ingredientes:
                      </h4>
                      <ul className="space-y-1">
                        {recipe.ingredients.map((ingredient, index) => {
                          const isExpiring = expiringProducts.some(
                            (p) =>
                              p.name.toLowerCase().includes(ingredient.toLowerCase()) ||
                              ingredient.toLowerCase().includes(p.name.toLowerCase()),
                          )
                          return (
                            <li
                              key={index}
                              className={`text-sm flex items-center gap-2 p-2 rounded ${
                                isExpiring ? "text-orange-600 font-medium bg-orange-100" : "text-gray-600 bg-gray-50"
                              }`}
                            >
                              {isExpiring && <AlertTriangle className="w-3 h-3" />}
                              {ingredient}
                            </li>
                          )
                        })}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Modo de Preparo:</h4>
                      <div className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded">
                        {recipe.instructions}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))
          ) : (
            <p className="text-sm text-orange-700 text-center py-4">
              Nenhuma receita encontrada com os produtos disponíveis
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
