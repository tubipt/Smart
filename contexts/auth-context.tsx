"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  familyId: string
  role: "admin" | "member"
  avatar?: string
  preferences: {
    notifications: boolean
    darkMode: boolean
    language: string
  }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Dados simulados de usuários com mais detalhes
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria@email.com",
    password: "123456",
    familyId: "family1",
    role: "admin",
    preferences: {
      notifications: true,
      darkMode: false,
      language: "pt",
    },
  },
  {
    id: "2",
    name: "João Silva",
    email: "joao@email.com",
    password: "123456",
    familyId: "family1",
    role: "member",
    preferences: {
      notifications: true,
      darkMode: false,
      language: "pt",
    },
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem("despensa_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
        localStorage.removeItem("despensa_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("despensa_user", JSON.stringify(userWithoutPassword))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Verificar se email já existe
    if (mockUsers.find((u) => u.email === email)) {
      setIsLoading(false)
      return false
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      familyId: `family_${Date.now()}`,
      role: "admin",
      preferences: {
        notifications: true,
        darkMode: false,
        language: "pt",
      },
    }

    setUser(newUser)
    localStorage.setItem("despensa_user", JSON.stringify(newUser))
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("despensa_user")
    localStorage.removeItem("despensa_products")
    localStorage.removeItem("despensa_shopping")
    localStorage.removeItem("despensa_family")
    localStorage.removeItem("despensa_notifications")
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("despensa_user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
