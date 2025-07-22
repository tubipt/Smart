"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/contexts/app-context"
import { Package, MapPin, Calendar, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react"

export function GroupedProductsView() {
  const { getGroupedProducts, getExpiredProducts } = useApp()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const groupedProducts = getGroupedProducts()
  const expiredProducts = getExpiredProducts()

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getGroupStatus = (products: any[]) => {
    const expired = products.filter((p) => expiredProducts.includes(p)).length
    const expiring = products.filter((p) => {
      const days = getDaysUntilExpiry(p.expiryDate)
      return days <= 3 && days >= 0
    }).length

    if (expired > 0) return { type: "expired", count: expired, color: "bg-red-100 text-red-800" }
    if (expiring > 0) return { type: "expiring", count: expiring, color: "bg-yellow-100 text-yellow-800" }
    return { type: "good", count: 0, color: "bg-green-100 text-green-800" }
  }

  return (
    <div className="space-y-3">
      {Object.entries(groupedProducts).map(([groupKey, products]) => {
        const isExpanded = expandedGroups.has(groupKey)
        const [name, category, brand] = groupKey.split("-")
        const displayName = name.charAt(0).toUpperCase() + name.slice(1)
        const displayBrand = brand !== "sem-marca" ? brand : null
        const status = getGroupStatus(products)

        // Ordenar produtos por data de validade
        const sortedProducts = [...products].sort(
          (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
        )

        return (
          <Card key={groupKey}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleGroup(groupKey)}>
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <Package className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {displayName}
                      {displayBrand && (
                        <Badge variant="outline" className="text-xs">
                          {displayBrand}
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {products.length} {products.length === 1 ? "unidade" : "unidades"}
                  </Badge>

                  {status.count > 0 && (
                    <Badge className={status.color} variant="secondary">
                      {status.type === "expired" ? "Expirado" : "Expirando"}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {sortedProducts.map((product, index) => {
                    const daysUntilExpiry = getDaysUntilExpiry(product.expiryDate)
                    const isExpired = expiredProducts.includes(product)
                    const isExpiring = daysUntilExpiry <= 3 && daysUntilExpiry >= 0

                    return (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          isExpired
                            ? "border-red-200 bg-red-50"
                            : isExpiring
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">#{index + 1}</span>
                            {(isExpired || isExpiring) && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                            <span className="text-sm">Qtd: {product.quantity}</span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(product.expiryDate).toLocaleDateString("pt-BR")}
                              {isExpired && <span className="text-red-600 ml-1">(Expirado)</span>}
                              {isExpiring && !isExpired && (
                                <span className="text-yellow-600 ml-1">({daysUntilExpiry}d)</span>
                              )}
                            </span>

                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {product.location}
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 mt-1">
                            Adicionado por {product.addedBy} em{" "}
                            {new Date(product.addedDate).toLocaleDateString("pt-BR")}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                            Consumir
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            Remover
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Resumo do Grupo */}
                <div className="mt-3 pt-3 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-medium text-green-600">
                        {
                          products.filter((p) => !expiredProducts.includes(p) && getDaysUntilExpiry(p.expiryDate) > 3)
                            .length
                        }
                      </div>
                      <div className="text-xs text-gray-600">Bom estado</div>
                    </div>
                    <div>
                      <div className="font-medium text-yellow-600">
                        {
                          products.filter((p) => {
                            const days = getDaysUntilExpiry(p.expiryDate)
                            return days <= 3 && days >= 0
                          }).length
                        }
                      </div>
                      <div className="text-xs text-gray-600">Expirando</div>
                    </div>
                    <div>
                      <div className="font-medium text-red-600">
                        {products.filter((p) => expiredProducts.includes(p)).length}
                      </div>
                      <div className="text-xs text-gray-600">Expirados</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
