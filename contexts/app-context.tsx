"use client"

import { useState, createContext, useContext } from "react"

// Adicionar as interfaces e dados das receitas nutricionais diretamente no contexto

// Adicionar após as interfaces existentes:
interface NutritionalInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  calcium: number
  iron: number
  vitaminC: number
  vitaminA: number
  servingSize: number
  servingsPerPackage: number
  prepTime: number
  cookTime: number
  totalTime: number
}

interface Ingredient {
  name: string
  amount: string
  optional?: boolean
}

interface NutritionalRecipe {
  id: string
  name: string
  ingredients: Ingredient[]
  steps: string[]
  nutritionalInfo: NutritionalInfo
  tags: string[]
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
  complexity: number
  tips?: string[]
  imageUrl: string
  rating: number
  reviews: number
  author: string
  difficulty: "Fácil" | "Médio" | "Difícil"
  cookTime: string
  servings: number
  isFavorite?: boolean
  matchScore?: number
}

interface UserDietaryPreferences {
  vegetarian: boolean
  vegan: boolean
  glutenFree: boolean
  dairyFree: boolean
  lowCarb: boolean
  highProtein: boolean
  lowSodium: boolean
}

interface NutritionalGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sodium: number
}

interface ConsumedProduct {
  id: string
  productName: string
  servings: number
  nutritionalInfo: NutritionalInfo
  consumedAt: string
}

// Dados simulados de produtos com informações nutricionais
const initialProducts = [
  {
    id: "1",
    name: "Peito de Frango",
    category: "Carnes",
    expiryDate: "2024-02-15",
    quantity: 2,
    location: "Frigorífico",
    addedBy: "Maria Silva",
    addedDate: "2024-01-20",
    consumed: false,
    brand: "Sadia",
    nutritionalInfo: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
      calcium: 15,
      iron: 1.0,
      vitaminC: 0,
      vitaminA: 6,
      servingSize: 100,
      servingsPerPackage: 4,
      prepTime: 0,
      cookTime: 0,
      totalTime: 0,
    },
  },
  {
    id: "2",
    name: "Banana",
    category: "Frutas",
    expiryDate: "2024-01-28",
    quantity: 6,
    location: "Fruteira",
    addedBy: "João Silva",
    addedDate: "2024-01-22",
    consumed: false,
    nutritionalInfo: {
      calories: 89,
      protein: 1.1,
      carbs: 23,
      fat: 0.3,
      fiber: 2.6,
      sugar: 12,
      sodium: 1,
      calcium: 5,
      iron: 0.3,
      vitaminC: 8.7,
      vitaminA: 3,
      servingSize: 100,
      servingsPerPackage: 1,
      prepTime: 0,
      cookTime: 0,
      totalTime: 0,
    },
  },
  {
    id: "3",
    name: "Leite Integral",
    category: "Laticínios",
    expiryDate: "2024-01-30",
    quantity: 1,
    location: "Frigorífico",
    addedBy: "Maria Silva",
    addedDate: "2024-01-23",
    consumed: false,
    brand: "Parmalat",
    nutritionalInfo: {
      calories: 61,
      protein: 3.2,
      carbs: 4.8,
      fat: 3.3,
      fiber: 0,
      sugar: 4.8,
      sodium: 44,
      calcium: 113,
      iron: 0.1,
      vitaminC: 0,
      vitaminA: 46,
      servingSize: 100,
      servingsPerPackage: 10,
      prepTime: 0,
      cookTime: 0,
      totalTime: 0,
    },
  },
  {
    id: "4",
    name: "Espinafre",
    category: "Legumes",
    expiryDate: "2024-01-26",
    quantity: 1,
    location: "Frigorífico",
    addedBy: "Maria Silva",
    addedDate: "2024-01-24",
    consumed: false,
    nutritionalInfo: {
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      fiber: 2.2,
      sugar: 0.4,
      sodium: 79,
      calcium: 99,
      iron: 2.7,
      vitaminC: 28,
      vitaminA: 469,
      servingSize: 100,
      servingsPerPackage: 2,
      prepTime: 0,
      cookTime: 0,
      totalTime: 0,
    },
  },
  {
    id: "5",
    name: "Quinoa",
    category: "Cereais",
    expiryDate: "2024-12-31",
    quantity: 1,
    location: "Despensa",
    addedBy: "João Silva",
    addedDate: "2024-01-15",
    consumed: false,
    nutritionalInfo: {
      calories: 368,
      protein: 14.1,
      carbs: 64.2,
      fat: 6.1,
      fiber: 7,
      sugar: 0,
      sodium: 5,
      calcium: 47,
      iron: 4.6,
      vitaminC: 0,
      vitaminA: 1,
      servingSize: 100,
      servingsPerPackage: 5,
      prepTime: 0,
      cookTime: 0,
      totalTime: 0,
    },
  },
  {
    id: "6",
    name: "Tomate Cereja",
    category: "Legumes",
    expiryDate: "2024-01-29",
    quantity: 1,
    location: "Frigorífico",
    addedBy: "Maria Silva",
    addedDate: "2024-01-25",
    consumed: false,
    nutritionalInfo: {
      calories: 18,
      protein: 0.9,
      carbs: 3.9,
      fat: 0.2,
      fiber: 1.2,
      sugar: 2.6,
      sodium: 5,
      calcium: 10,
      iron: 0.3,
      vitaminC: 14,
      vitaminA: 42,
      servingSize: 100,
      servingsPerPackage: 3,
      prepTime: 0,
      cookTime: 0,
      totalTime: 0,
    },
  },
  {
    id: "7",
    name: "Abacate",
    category: "Frutas",
    expiryDate: "2024-02-02",
    quantity: 2,
    location: "Fruteira",
    addedBy: "João Silva",
    addedDate: "2024-01-26",
    consumed: false,
    nutritionalInfo: {
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
      fiber: 6.7,
      sugar: 0.7,
      sodium: 7,
      calcium: 12,
      iron: 0.6,
      vitaminC: 10,
      vitaminA: 7,
      servingSize: 100,
      servingsPerPackage: 1,
      prepTime: 0,
      cookTime: 0,
      totalTime: 0,
    },
  },
  {
    id: "8",
    name: "Iogurte Natural",
    category: "Laticínios",
    expiryDate: "2024-02-05",
    quantity: 4,
    location: "Frigorífico",
    addedBy: "Maria Silva",
    addedDate: "2024-01-27",
    consumed: false,
    brand: "Danone",
    nutritionalInfo: {
      calories: 59,
      protein: 10,
      carbs: 3.6,
      fat: 0.4,
      fiber: 0,
      sugar: 3.2,
      sodium: 36,
      calcium: 110,
      iron: 0.1,
      vitaminC: 0.5,
      vitaminA: 1,
      servingSize: 100,
      servingsPerPackage: 1,
      prepTime: 0,
      cookTime: 0,
      totalTime: 0,
    },
  },
]

// Dados simulados de lista de compras
const initialShoppingList = [
  {
    id: "s1",
    name: "Salmão",
    category: "Carnes",
    priority: "high" as const,
    completed: false,
    addedBy: "Maria Silva",
    addedDate: "2024-01-25",
  },
  {
    id: "s2",
    name: "Azeite de Oliva",
    category: "Outros",
    priority: "medium" as const,
    completed: false,
    addedBy: "João Silva",
    addedDate: "2024-01-26",
  },
  {
    id: "s3",
    name: "Pão Integral",
    category: "Cereais",
    priority: "low" as const,
    completed: true,
    addedBy: "Maria Silva",
    addedDate: "2024-01-24",
  },
]

// Dados simulados de membros da família
const initialFamilyMembers = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria@email.com",
    role: "admin" as const,
    joinedDate: "2024-01-01",
  },
  {
    id: "2",
    name: "João Silva",
    email: "joao@email.com",
    role: "member" as const,
    joinedDate: "2024-01-02",
  },
]

// Dados simulados de notificações
const initialNotifications = [
  {
    id: "n1",
    title: "Produto expirando",
    message: "Banana expira em 2 dias",
    type: "warning" as const,
    read: false,
    createdAt: "2024-01-26T10:00:00Z",
  },
  {
    id: "n2",
    title: "Lista de compras",
    message: "João adicionou Azeite de Oliva à lista",
    type: "info" as const,
    read: false,
    createdAt: "2024-01-26T09:30:00Z",
  },
]

// Dados simulados de estatísticas
const initialStatistics = {
  totalProducts: 15,
  wasteReduced: 2.5,
  moneySaved: 45.8,
  mostUsedCategory: "Legumes",
  averageShelfLife: 7,
}

const AppContext = createContext(null)

export const AppProvider = ({ children }) => {
  // Adicionar no estado do AppProvider:
  const [nutritionalRecipes, setNutritionalRecipes] = useState<NutritionalRecipe[]>([
    {
      id: "101",
      name: "Bowl de Proteína com Frango e Quinoa",
      ingredients: [
        { name: "Peito de frango", amount: "150g" },
        { name: "Quinoa cozida", amount: "100g" },
        { name: "Espinafre", amount: "50g" },
        { name: "Tomate cereja", amount: "50g" },
        { name: "Abacate", amount: "1/4 unidade" },
        { name: "Azeite de oliva", amount: "1 colher de chá" },
        { name: "Limão", amount: "1/2 unidade" },
        { name: "Sal e pimenta", amount: "a gosto", optional: true },
      ],
      steps: [
        "Tempere o frango com sal, pimenta e suco de limão",
        "Grelhe o frango até dourar e cozinhar por completo",
        "Em uma tigela, coloque a quinoa como base",
        "Adicione o espinafre, tomate cereja cortado ao meio e o abacate em cubos",
        "Coloque o frango fatiado por cima",
        "Regue com azeite e finalize com sal e pimenta a gosto",
      ],
      nutritionalInfo: {
        calories: 420,
        protein: 35,
        carbs: 30,
        fat: 18,
        fiber: 8,
        sugar: 5,
        sodium: 320,
        calcium: 80,
        iron: 3.5,
        vitaminC: 25,
        vitaminA: 150,
        servingSize: 100,
        servingsPerPackage: 1,
        prepTime: 10,
        cookTime: 15,
        totalTime: 25,
      },
      tags: ["alto em proteína", "baixo em carboidratos", "saudável", "pós-treino"],
      mealType: "lunch",
      complexity: 2,
      tips: [
        "Você pode substituir o frango por tofu para uma versão vegetariana",
        "Adicione sementes de chia para mais fibras",
      ],
      imageUrl: "/placeholder.svg?height=300&width=400",
      rating: 4.8,
      reviews: 124,
      author: "Nutricionista Ana Silva",
      difficulty: "Fácil",
      cookTime: "25 min",
      servings: 1,
    },
    {
      id: "102",
      name: "Smoothie Verde Energético",
      ingredients: [
        { name: "Espinafre", amount: "1 xícara" },
        { name: "Banana", amount: "1 unidade" },
        { name: "Abacate", amount: "1/4 unidade" },
        { name: "Leite de amêndoas", amount: "200ml" },
        { name: "Proteína vegetal em pó", amount: "1 scoop", optional: true },
        { name: "Mel", amount: "1 colher de chá", optional: true },
        { name: "Sementes de chia", amount: "1 colher de sopa" },
      ],
      steps: [
        "Coloque todos os ingredientes no liquidificador",
        "Bata até obter uma mistura homogênea",
        "Se necessário, adicione um pouco de água para ajustar a consistência",
        "Sirva imediatamente",
      ],
      nutritionalInfo: {
        calories: 280,
        protein: 12,
        carbs: 35,
        fat: 12,
        fiber: 10,
        sugar: 20,
        sodium: 80,
        calcium: 200,
        iron: 2.5,
        vitaminC: 45,
        vitaminA: 300,
        servingSize: 100,
        servingsPerPackage: 1,
        prepTime: 5,
        cookTime: 0,
        totalTime: 5,
      },
      tags: ["vegetariano", "rápido", "rico em fibras", "café da manhã"],
      mealType: "breakfast",
      complexity: 1,
      tips: [
        "Adicione gengibre para um toque picante e anti-inflamatório",
        "Congele a banana para um smoothie mais cremoso",
      ],
      imageUrl: "/placeholder.svg?height=300&width=400",
      rating: 4.6,
      reviews: 89,
      author: "Chef Carlos Mendes",
      difficulty: "Fácil",
      cookTime: "5 min",
      servings: 1,
    },
    {
      id: "103",
      name: "Salmão Assado com Legumes",
      ingredients: [
        { name: "Filé de salmão", amount: "150g" },
        { name: "Abobrinha", amount: "1 unidade média" },
        { name: "Pimentão vermelho", amount: "1/2 unidade" },
        { name: "Cebola roxa", amount: "1/4 unidade" },
        { name: "Azeite de oliva", amount: "1 colher de sopa" },
        { name: "Alecrim fresco", amount: "2 ramos" },
        { name: "Limão", amount: "1/2 unidade" },
        { name: "Sal e pimenta", amount: "a gosto" },
      ],
      steps: [
        "Pré-aqueça o forno a 200°C",
        "Corte os legumes em rodelas ou cubos médios",
        "Disponha os legumes em uma assadeira, regue com metade do azeite e tempere",
        "Coloque o salmão sobre os legumes, regue com o restante do azeite",
        "Esprema o limão sobre o salmão e adicione o alecrim",
        "Asse por cerca de 20 minutos ou até o salmão estar cozido",
      ],
      nutritionalInfo: {
        calories: 380,
        protein: 28,
        carbs: 12,
        fat: 24,
        fiber: 4,
        sugar: 8,
        sodium: 240,
        calcium: 60,
        iron: 1.8,
        vitaminC: 35,
        vitaminA: 120,
        servingSize: 100,
        servingsPerPackage: 1,
        prepTime: 10,
        cookTime: 20,
        totalTime: 30,
      },
      tags: ["rico em ômega-3", "baixo em carboidratos", "sem glúten", "jantar saudável"],
      mealType: "dinner",
      complexity: 2,
      tips: [
        "Você pode substituir o salmão por outro peixe gordo como truta ou cavala",
        "Adicione batata-doce para mais carboidratos complexos",
      ],
      imageUrl: "/placeholder.svg?height=300&width=400",
      rating: 4.9,
      reviews: 156,
      author: "Nutricionista Pedro Almeida",
      difficulty: "Médio",
      cookTime: "30 min",
      servings: 1,
    },
  ])

  const [userDietaryPreferences, setUserDietaryPreferences] = useState<UserDietaryPreferences>({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    lowCarb: false,
    highProtein: false,
    lowSodium: false,
  })

  const [nutritionalGoals, setNutritionalGoals] = useState<NutritionalGoals>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    fiber: 25,
    sodium: 2300,
  })

  const [consumedProducts, setConsumedProducts] = useState<ConsumedProduct[]>([])
  const [products, setProducts] = useState(initialProducts)
  const [shoppingList, setShoppingList] = useState(initialShoppingList)
  const [familyMembers, setFamilyMembers] = useState(initialFamilyMembers)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [statistics] = useState(initialStatistics)
  const [consumptionHistory, setConsumptionHistory] = useState<any[]>([])
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([])
  const [personalizedRecipes, setPersonalizedRecipes] = useState<any[]>([])

  // Adicionar as funções nutricionais:
  const getTodayNutrition = () => {
    const today = new Date().toISOString().split("T")[0]
    const todayConsumed = consumedProducts.filter((cp) => cp.consumedAt.startsWith(today))

    return todayConsumed.reduce(
      (total, item) => ({
        calories: total.calories + item.nutritionalInfo.calories * item.servings,
        protein: total.protein + item.nutritionalInfo.protein * item.servings,
        carbs: total.carbs + item.nutritionalInfo.carbs * item.servings,
        fat: total.fat + item.nutritionalInfo.fat * item.servings,
        fiber: total.fiber + item.nutritionalInfo.fiber * item.servings,
        sugar: total.sugar + item.nutritionalInfo.sugar * item.servings,
        sodium: total.sodium + item.nutritionalInfo.sodium * item.servings,
        calcium: total.calcium + item.nutritionalInfo.calcium * item.servings,
        iron: total.iron + item.nutritionalInfo.iron * item.servings,
        vitaminC: total.vitaminC + item.nutritionalInfo.vitaminC * item.servings,
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        calcium: 0,
        iron: 0,
        vitaminC: 0,
      },
    )
  }

  const getWeeklyNutrition = () => {
    const weekData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayConsumed = consumedProducts.filter((cp) => cp.consumedAt.startsWith(dateStr))
      const dayNutrition = dayConsumed.reduce(
        (total, item) => ({
          calories: total.calories + item.nutritionalInfo.calories * item.servings,
          protein: total.protein + item.nutritionalInfo.protein * item.servings,
          carbs: total.carbs + item.nutritionalInfo.carbs * item.servings,
          fat: total.fat + item.nutritionalInfo.fat * item.servings,
          fiber: total.fiber + item.nutritionalInfo.fiber * item.servings,
          sodium: total.sodium + item.nutritionalInfo.sodium * item.servings,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 },
      )

      weekData.push(dayNutrition)
    }
    return weekData
  }

  const getNutritionalInsights = () => {
    const todayNutrition = getTodayNutrition()
    const insights = []

    if (todayNutrition.calories < nutritionalGoals.calories * 0.5) {
      insights.push("Você está consumindo poucas calorias hoje. Considere adicionar um lanche saudável.")
    }

    if (todayNutrition.protein > nutritionalGoals.protein * 0.8) {
      insights.push("Ótima ingestão de proteína! Isso ajuda na manutenção muscular.")
    }

    if (todayNutrition.fiber < nutritionalGoals.fiber * 0.5) {
      insights.push("Aumente o consumo de fibras com frutas, vegetais e grãos integrais.")
    }

    if (todayNutrition.sodium > nutritionalGoals.sodium * 0.8) {
      insights.push("Atenção ao consumo de sódio! Prefira alimentos frescos e naturais.")
    }

    return insights
  }

  const getRecommendedRecipes = () => {
    const todayNutrition = getTodayNutrition()
    const remainingCalories = Math.max(0, nutritionalGoals.calories - todayNutrition.calories)
    const remainingProtein = Math.max(0, nutritionalGoals.protein - todayNutrition.protein)
    const remainingCarbs = Math.max(0, nutritionalGoals.carbs - todayNutrition.carbs)
    const remainingFat = Math.max(0, nutritionalGoals.fat - todayNutrition.fat)

    // Filtrar receitas com base nas preferências dietéticas
    let filteredRecipes = [...nutritionalRecipes]

    if (userDietaryPreferences.vegetarian) {
      filteredRecipes = filteredRecipes.filter((recipe) => recipe.tags.includes("vegetariano"))
    }

    if (userDietaryPreferences.vegan) {
      filteredRecipes = filteredRecipes.filter((recipe) => recipe.tags.includes("vegano"))
    }

    if (userDietaryPreferences.glutenFree) {
      filteredRecipes = filteredRecipes.filter((recipe) => recipe.tags.includes("sem glúten"))
    }

    // Calcular pontuação de correspondência para cada receita
    return filteredRecipes
      .map((recipe) => {
        const calorieMatch =
          remainingCalories > 0 ? Math.min(100, (recipe.nutritionalInfo.calories / remainingCalories) * 100) : 50
        const proteinMatch =
          remainingProtein > 0 ? Math.min(100, (recipe.nutritionalInfo.protein / remainingProtein) * 100) : 50
        const carbsMatch =
          remainingCarbs > 0 ? Math.min(100, (recipe.nutritionalInfo.carbs / remainingCarbs) * 100) : 50
        const fatMatch = remainingFat > 0 ? Math.min(100, (recipe.nutritionalInfo.fat / remainingFat) * 100) : 50

        // Calcular pontuação geral
        let matchScore = (calorieMatch + proteinMatch * 2 + carbsMatch + fatMatch) / 5

        // Ajustar pontuação com base nas preferências
        if (userDietaryPreferences.lowCarb && recipe.nutritionalInfo.carbs < 20) {
          matchScore += 15
        }

        if (userDietaryPreferences.highProtein && recipe.nutritionalInfo.protein > 25) {
          matchScore += 15
        }

        if (userDietaryPreferences.lowSodium && recipe.nutritionalInfo.sodium < 300) {
          matchScore += 15
        }

        // Verificar se a receita usa produtos disponíveis na despensa
        const availableIngredients = products.filter((p) => !p.consumed).map((p) => p.name.toLowerCase())
        const recipeIngredientsLower = recipe.ingredients.map((i) => i.name.toLowerCase())
        const ingredientMatchCount = recipeIngredientsLower.filter((ingredient) =>
          availableIngredients.some((available) => available.includes(ingredient) || ingredient.includes(available)),
        ).length

        const ingredientMatchPercentage = (ingredientMatchCount / recipe.ingredients.length) * 100
        matchScore += ingredientMatchPercentage * 0.3 // Peso de 30% para ingredientes disponíveis

        return {
          ...recipe,
          matchScore: Math.min(100, Math.max(0, matchScore)),
        }
      })
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  }

  const toggleFavoriteRecipe = (id: string) => {
    setNutritionalRecipes((prev) =>
      prev.map((recipe) => (recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe)),
    )
  }

  const updateDietaryPreferences = (prefs: Partial<UserDietaryPreferences>) => {
    setUserDietaryPreferences((prev) => ({ ...prev, ...prefs }))
  }

  const updateNutritionalGoals = (goals: Partial<NutritionalGoals>) => {
    setNutritionalGoals((prev) => ({ ...prev, ...goals }))
  }

  // Modificar a função addProduct para permitir produtos duplicados
  const addProduct = (product: any) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      addedBy: "Maria Silva",
      addedDate: new Date().toISOString().split("T")[0],
      consumed: false,
    }
    setProducts((prev) => [...prev, newProduct])
  }

  // Adicionar função para agrupar produtos similares
  const getGroupedProducts = () => {
    const grouped = products.reduce(
      (acc, product) => {
        if (product.consumed) return acc

        const key = `${product.name.toLowerCase()}-${product.category}-${product.brand || "sem-marca"}`
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(product)
        return acc
      },
      {} as Record<string, any[]>,
    )

    return grouped
  }

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const consumeProduct = (id: string, servings = 1) => {
    const product = products.find((p) => p.id === id)
    if (product && product.nutritionalInfo) {
      const consumedItem: ConsumedProduct = {
        id: Date.now().toString(),
        productName: product.name,
        servings,
        nutritionalInfo: product.nutritionalInfo,
        consumedAt: new Date().toISOString(),
      }
      setConsumedProducts((prev) => [...prev, consumedItem])
    }

    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, consumed: true } : p)))
  }

  const addShoppingItem = (item: any) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      completed: false,
      addedBy: "Maria Silva",
      addedDate: new Date().toISOString().split("T")[0],
    }
    setShoppingList((prev) => [...prev, newItem])
  }

  const updateShoppingItem = (id: string, updates: any) => {
    setShoppingList((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const toggleShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const removeShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id))
  }

  const getExpiringProducts = (days: number) => {
    const today = new Date()
    return products.filter((product) => {
      if (product.consumed) return false
      const expiryDate = new Date(product.expiryDate)
      const diffTime = expiryDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= days && diffDays >= 0
    })
  }

  const getExpiredProducts = () => {
    const today = new Date()
    return products.filter((product) => {
      if (product.consumed) return false
      const expiryDate = new Date(product.expiryDate)
      return expiryDate < today
    })
  }

  // Adicionar função para gerar sugestões de compra
  const getShoppingSuggestions = () => {
    const suggestions = []

    // Analisar produtos consumidos nos últimos 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentConsumption = consumedProducts.filter((cp) => new Date(cp.consumedAt) > thirtyDaysAgo)

    // Contar frequência de consumo por produto
    const consumptionFrequency = recentConsumption.reduce(
      (acc, cp) => {
        const key = cp.productName.toLowerCase()
        acc[key] = (acc[key] || 0) + cp.servings
        return acc
      },
      {} as Record<string, number>,
    )

    // Verificar produtos em falta baseado no histórico
    Object.entries(consumptionFrequency).forEach(([productName, frequency]) => {
      const currentStock = products.filter((p) => !p.consumed && p.name.toLowerCase().includes(productName)).length

      const averageConsumption = frequency / 30 // por dia
      const daysOfStock = currentStock / Math.max(averageConsumption, 0.1)

      if (daysOfStock < 7) {
        // Menos de 7 dias de estoque
        suggestions.push({
          id: `suggestion_${productName}`,
          name: productName.charAt(0).toUpperCase() + productName.slice(1),
          reason: `Consumo médio: ${averageConsumption.toFixed(1)}/dia. Estoque para ${Math.round(daysOfStock)} dias`,
          priority: daysOfStock < 3 ? "high" : "medium",
          category: "Outros", // Seria melhor inferir da categoria mais comum
          suggested: true,
        })
      }
    })

    // Produtos sazonais ou que acabaram recentemente
    const expiredRecently = products.filter((p) => {
      const expiry = new Date(p.expiryDate)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return expiry > weekAgo && expiry < new Date()
    })

    expiredRecently.forEach((product) => {
      if (!suggestions.find((s) => s.name.toLowerCase() === product.name.toLowerCase())) {
        suggestions.push({
          id: `expired_${product.id}`,
          name: product.name,
          reason: "Produto expirou recentemente",
          priority: "medium",
          category: product.category,
          suggested: true,
        })
      }
    })

    return suggestions.slice(0, 5) // Limitar a 5 sugestões
  }

  const getSuggestedRecipes = () => {
    // Receitas baseadas nos produtos que estão expirando
    const expiringProducts = getExpiringProducts(5)

    const recipes = [
      {
        id: "r1",
        name: "Smoothie de Banana",
        ingredients: ["Banana", "Leite", "Mel"],
        instructions: "Bata todos os ingredientes no liquidificador até ficar cremoso.",
        cookTime: "5 min",
        servings: 1,
        difficulty: "Fácil",
      },
      {
        id: "r2",
        name: "Salada de Espinafre",
        ingredients: ["Espinafre", "Tomate", "Azeite"],
        instructions: "Misture o espinafre com tomate e tempere com azeite.",
        cookTime: "10 min",
        servings: 2,
        difficulty: "Fácil",
      },
      {
        id: "r3",
        name: "Frango Grelhado",
        ingredients: ["Peito de Frango", "Temperos"],
        instructions: "Tempere o frango e grelhe por 15 minutos de cada lado.",
        cookTime: "30 min",
        servings: 2,
        difficulty: "Médio",
      },
    ]

    return recipes.filter((recipe) =>
      recipe.ingredients.some((ingredient) =>
        expiringProducts.some((product) => product.name.toLowerCase().includes(ingredient.toLowerCase())),
      ),
    )
  }

  // Função para gerar planos de treino baseados no perfil nutricional
  const generateWorkoutPlans = () => {
    const todayNutrition = getTodayNutrition()
    const userProfile = {
      age: 30, // Seria obtido do perfil do usuário
      weight: 70,
      height: 170,
      activityLevel: "moderate",
      goals: "maintenance", // weight_loss, muscle_gain, maintenance
    }

    const plans = []

    // Plano baseado no consumo calórico
    if (todayNutrition.calories > nutritionalGoals.calories * 1.2) {
      plans.push({
        id: "cardio_burn",
        name: "Queima Calórica",
        type: "cardio",
        duration: 45,
        intensity: "moderate",
        exercises: [
          { name: "Caminhada rápida", duration: 15, calories: 120 },
          { name: "Corrida leve", duration: 20, calories: 200 },
          { name: "Alongamento", duration: 10, calories: 30 },
        ],
        totalCalories: 350,
        reason: "Alto consumo calórico hoje. Este treino ajuda a equilibrar.",
      })
    }

    // Plano baseado no consumo de proteína
    if (todayNutrition.protein > nutritionalGoals.protein * 0.8) {
      plans.push({
        id: "strength_training",
        name: "Treino de Força",
        type: "strength",
        duration: 60,
        intensity: "high",
        exercises: [
          { name: "Flexões", sets: 3, reps: 15, rest: 60 },
          { name: "Agachamentos", sets: 3, reps: 20, rest: 60 },
          { name: "Prancha", duration: 3, sets: 3, rest: 30 },
          { name: "Burpees", sets: 2, reps: 10, rest: 90 },
        ],
        totalCalories: 300,
        reason: "Boa ingestão de proteína. Ideal para treino de força.",
      })
    }

    // Plano de recuperação se consumo baixo
    if (todayNutrition.calories < nutritionalGoals.calories * 0.7) {
      plans.push({
        id: "recovery_yoga",
        name: "Yoga Restaurativo",
        type: "flexibility",
        duration: 30,
        intensity: "low",
        exercises: [
          { name: "Respiração profunda", duration: 5 },
          { name: "Postura da criança", duration: 5 },
          { name: "Torção espinal", duration: 10 },
          { name: "Savasana", duration: 10 },
        ],
        totalCalories: 80,
        reason: "Baixo consumo calórico. Foque na recuperação e hidratação.",
      })
    }

    return plans
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Função para gerar receitas personalizadas com produtos da despensa
  const generatePersonalizedRecipes = () => {
    const availableProducts = products.filter((p) => !p.consumed && !getExpiredProducts().includes(p))
    const todayNutrition = getTodayNutrition()
    const remainingCalories = Math.max(0, nutritionalGoals.calories - todayNutrition.calories)
    const remainingProtein = Math.max(0, nutritionalGoals.protein - todayNutrition.protein)

    const recipes = []

    // Receita para usar produtos que vão expirar
    const expiringProducts = getExpiringProducts(3)
    if (expiringProducts.length > 0) {
      const mainIngredient = expiringProducts[0]
      recipes.push({
        id: `urgent_${mainIngredient.id}`,
        name: `${mainIngredient.name} Especial`,
        type: "urgent",
        mainIngredient: mainIngredient.name,
        estimatedCalories: 300,
        estimatedProtein: 15,
        estimatedTime: 25,
        difficulty: "Fácil",
        reason: `${mainIngredient.name} expira em ${getDaysUntilExpiry(mainIngredient.expiryDate)} dias`,
        availableIngredients: expiringProducts.slice(0, 4).map((p) => p.name),
        instructions: [
          `Prepare o ${mainIngredient.name} como ingrediente principal`,
          "Adicione temperos e outros ingredientes disponíveis",
          "Cozinhe até ficar no ponto desejado",
          "Sirva imediatamente",
        ],
      })
    }

    // Receita para completar macros do dia
    if (remainingProtein > 20) {
      const proteinSources = availableProducts.filter(
        (p) =>
          p.category === "Carnes" ||
          p.category === "Laticínios" ||
          (p.nutritionalInfo && p.nutritionalInfo.protein > 10),
      )

      if (proteinSources.length > 0) {
        recipes.push({
          id: "protein_boost",
          name: "Reforço Proteico",
          type: "macro_completion",
          mainIngredient: proteinSources[0].name,
          estimatedCalories: Math.min(remainingCalories, 400),
          estimatedProtein: Math.min(remainingProtein, 30),
          estimatedTime: 20,
          difficulty: "Fácil",
          reason: `Faltam ${remainingProtein.toFixed(0)}g de proteína para atingir sua meta`,
          availableIngredients: proteinSources.slice(0, 3).map((p) => p.name),
          instructions: [
            `Prepare ${proteinSources[0].name} grelhado ou cozido`,
            "Adicione vegetais disponíveis na despensa",
            "Tempere com ervas e especiarias",
            "Sirva com acompanhamento leve",
          ],
        })
      }
    }

    // Receita balanceada com ingredientes disponíveis
    if (availableProducts.length >= 3) {
      const vegetables = availableProducts.filter((p) => p.category === "Legumes")
      const proteins = availableProducts.filter((p) => p.category === "Carnes")
      const carbs = availableProducts.filter((p) => p.category === "Cereais")

      if (vegetables.length > 0 && (proteins.length > 0 || carbs.length > 0)) {
        recipes.push({
          id: "balanced_meal",
          name: "Refeição Balanceada da Despensa",
          type: "balanced",
          estimatedCalories: 450,
          estimatedProtein: 25,
          estimatedTime: 35,
          difficulty: "Médio",
          reason: "Combinação equilibrada dos ingredientes disponíveis",
          availableIngredients: [
            ...vegetables.slice(0, 2).map((p) => p.name),
            ...(proteins.length > 0 ? [proteins[0].name] : []),
            ...(carbs.length > 0 ? [carbs[0].name] : []),
          ],
          instructions: [
            "Prepare todos os ingredientes lavando e cortando",
            "Inicie cozinhando os ingredientes que demoram mais",
            "Adicione temperos e combine os sabores",
            "Finalize com um toque especial e sirva quente",
          ],
        })
      }
    }

    return recipes
  }

  const addFamilyMember = async (email: string) => {
    // Simular adição de membro
    const newMember = {
      id: Date.now().toString(),
      name: email.split("@")[0],
      email,
      role: "member" as const,
      joinedDate: new Date().toISOString().split("T")[0],
    }
    setFamilyMembers((prev) => [...prev, newMember])
    return true
  }

  const removeFamilyMember = (id: string) => {
    setFamilyMembers((prev) => prev.filter((member) => member.id !== id))
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const scanProduct = async (file: File) => {
    // Simular OCR
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockResults = [
      {
        name: "Leite Desnatado",
        category: "Laticínios",
        expiryDate: "2024-02-10",
        barcode: "7891234567890",
      },
      {
        name: "Pão de Forma",
        category: "Cereais",
        expiryDate: "2024-02-05",
        barcode: "7891234567891",
      },
    ]

    return mockResults[Math.floor(Math.random() * mockResults.length)]
  }

  return (
    <AppContext.Provider
      value={{
        // Estados
        products,
        shoppingList,
        familyMembers,
        notifications,
        statistics,
        nutritionalRecipes,
        userDietaryPreferences,
        nutritionalGoals,
        consumedProducts,
        consumptionHistory,
        workoutPlans,
        personalizedRecipes,

        // Funções de produtos
        addProduct,
        removeProduct,
        consumeProduct,
        getExpiringProducts,
        getExpiredProducts,
        getSuggestedRecipes,
        scanProduct,
        getGroupedProducts,

        // Funções de compras
        addShoppingItem,
        updateShoppingItem,
        toggleShoppingItem,
        removeShoppingItem,
        getShoppingSuggestions,

        // Funções de família
        addFamilyMember,
        removeFamilyMember,

        // Funções de notificações
        markNotificationAsRead,
        clearAllNotifications,

        // Funções nutricionais
        getTodayNutrition,
        getWeeklyNutrition,
        getNutritionalInsights,
        getRecommendedRecipes,
        toggleFavoriteRecipe,
        updateDietaryPreferences,
        updateNutritionalGoals,
        generateWorkoutPlans,
        generatePersonalizedRecipes,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export default AppProvider
