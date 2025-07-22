"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/contexts/app-context"
import { TrendingUp, Clock, Plus } from "lucide-react"

export function ShoppingSuggestions() {
  const { getShoppingSuggestions, addShoppingItem } = useApp()

  const suggestions = getShoppingSuggestions()

  if (suggestions.length === 0) {
    return null
  }

  const handleAddSuggestion = (suggestion: any) => {
    addShoppingItem({
      name: suggestion.name,
      category: suggestion.category,
      priority: suggestion.priority,
      reason: suggestion.reason,
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Urgente"
      case "medium":
        return "Moderada"
      default:
        return "Baixa"
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-blue-800">Sugestões de Compra</CardTitle>
        </div>
        <p className="text-sm text-blue-700">Baseadas no seu histórico de consumo</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{suggestion.name}</span>
                <Badge className={getPriorityColor(suggestion.priority)} variant="outline">
                  {getPriorityLabel(suggestion.priority)}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{suggestion.reason}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {suggestion.category}
                </Badge>
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Sugestão automática</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddSuggestion(suggestion)}
                className="bg-transparent"
              >
                <Plus className="w-3 h-3 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        ))}

        <div className="text-center pt-2">
          <p className="text-xs text-blue-600">💡 Sugestões baseadas no consumo dos últimos 30 dias</p>
        </div>
      </CardContent>
    </Card>
  )
}
