"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useApp } from "@/contexts/app-context"
import { BarChart3, TrendingUp, Package, AlertTriangle, Leaf, Euro, Calendar, Target } from "lucide-react"

export function StatisticsDashboard() {
  const { statistics, products, getExpiringProducts, getExpiredProducts } = useApp()

  const expiringProducts = getExpiringProducts(3)
  const expiredProducts = getExpiredProducts()
  const activeProducts = products.filter((p) => !p.consumed && !expiredProducts.includes(p))

  const wasteReductionPercentage =
    statistics.totalProducts > 0 ? (statistics.wasteReduced / statistics.totalProducts) * 100 : 0
  const efficiencyScore = Math.max(0, 100 - (expiredProducts.length / Math.max(statistics.totalProducts, 1)) * 100)

  return (
    <div className="space-y-4">
      {/* Resumo Principal */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-800">{activeProducts.length}</div>
            <div className="text-sm text-blue-600">Produtos Ativos</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Leaf className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-800">{statistics.wasteReduced.toFixed(1)}kg</div>
            <div className="text-sm text-green-600">Desperdício Evitado</div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(expiringProducts.length > 0 || expiredProducts.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiredProducts.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-100 rounded">
                <span className="text-red-800 font-medium">Produtos Expirados</span>
                <span className="text-red-800 font-bold">{expiredProducts.length}</span>
              </div>
            )}
            {expiringProducts.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-100 rounded">
                <span className="text-yellow-800 font-medium">Expirando em Breve</span>
                <span className="text-yellow-800 font-bold">{expiringProducts.length}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Impacto Ambiental */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            Impacto Ambiental
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Redução de Desperdício</span>
              <span>{wasteReductionPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={wasteReductionPercentage} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Dinheiro Poupado</span>
              <span>€{statistics.moneySaved.toFixed(2)}</span>
            </div>
            <Progress value={Math.min((statistics.moneySaved / 50) * 100, 100)} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Eficiência da Despensa</span>
              <span>{efficiencyScore.toFixed(0)}%</span>
            </div>
            <Progress value={efficiencyScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Estatísticas Detalhadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-medium">Categoria Favorita</div>
                <div className="text-gray-600">{statistics.mostUsedCategory || "N/A"}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <div>
                <div className="font-medium">Vida Útil Média</div>
                <div className="text-gray-600">{statistics.averageShelfLife} dias</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div>
                <div className="font-medium">Taxa de Consumo</div>
                <div className="text-gray-600">
                  {statistics.totalProducts > 0
                    ? ((products.filter((p) => p.consumed).length / statistics.totalProducts) * 100).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Euro className="w-4 h-4 text-yellow-600" />
              <div>
                <div className="font-medium">Valor Médio/Produto</div>
                <div className="text-gray-600">€2.50</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dicas Personalizadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dicas Personalizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {expiredProducts.length > 0 && (
              <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                <strong>Atenção:</strong> Você tem {expiredProducts.length} produto(s) expirado(s). Remova-os para
                manter a despensa organizada.
              </div>
            )}

            {expiringProducts.length > 0 && (
              <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                <strong>Urgente:</strong> {expiringProducts.length} produto(s) expirando em breve. Considere usar nas
                próximas refeições.
              </div>
            )}

            {statistics.mostUsedCategory && (
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <strong>Insight:</strong> Você consome mais produtos da categoria "{statistics.mostUsedCategory}".
                Considere comprar em maior quantidade.
              </div>
            )}

            {efficiencyScore > 80 && (
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                <strong>Parabéns:</strong> Sua eficiência na gestão da despensa está excelente (
                {efficiencyScore.toFixed(0)}%)!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
