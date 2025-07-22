"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Leaf, Loader2 } from "lucide-react"
import { useFormValidation } from "@/hooks/use-form-validation"
import { ValidationRules } from "@/lib/validation"
import { ValidatedInput } from "@/components/form/validated-input"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, login, register, isLoading } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Adicionar schemas de validação
  const loginSchema = {
    email: ValidationRules.email,
    password: ValidationRules.password,
  }

  const registerSchema = {
    name: ValidationRules.name,
    email: ValidationRules.email,
    password: ValidationRules.password,
  }

  // Usar useFormValidation para ambos os formulários
  const loginForm = useFormValidation(
    { email: "", password: "" },
    { schema: loginSchema, validateOnChange: true, validateOnBlur: true },
  )

  const registerForm = useFormValidation(
    { name: "", email: "", password: "" },
    { schema: registerSchema, validateOnChange: true, validateOnBlur: true },
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    const handleLogin = async () => {
      setLoading(true)
      setError("")
      const success = await login(loginForm.values.email, loginForm.values.password)
      if (!success) {
        setError("Email ou senha incorretos")
      }
      setLoading(false)
    }

    const handleRegister = async () => {
      setLoading(true)
      setError("")
      const success = await register(registerForm.values.name, registerForm.values.email, registerForm.values.password)
      if (!success) {
        setError("Email já cadastrado")
      }
      setLoading(false)
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Leaf className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Despensa Inteligente</h1>
            </div>
            <p className="text-gray-600">Gestão inteligente dos seus alimentos</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Registrar</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <ValidatedInput
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      name="email"
                      value={loginForm.values.email}
                      onChange={loginForm.handleChange}
                      onBlur={loginForm.handleBlur}
                      error={loginForm.errors.email}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <ValidatedInput
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      name="password"
                      value={loginForm.values.password}
                      onChange={loginForm.handleChange}
                      onBlur={loginForm.handleBlur}
                      error={loginForm.errors.password}
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button onClick={handleLogin} className="w-full" disabled={loading || !loginForm.isValid}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Entrar
                  </Button>
                  <div className="text-sm text-gray-600 text-center">
                    <p>Conta de teste:</p>
                    <p>Email: maria@email.com</p>
                    <p>Senha: 123456</p>
                  </div>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome</Label>
                    <ValidatedInput
                      id="register-name"
                      placeholder="Seu nome"
                      name="name"
                      value={registerForm.values.name}
                      onChange={registerForm.handleChange}
                      onBlur={registerForm.handleBlur}
                      error={registerForm.errors.name}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <ValidatedInput
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      name="email"
                      value={registerForm.values.email}
                      onChange={registerForm.handleChange}
                      onBlur={registerForm.handleBlur}
                      error={registerForm.errors.email}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <ValidatedInput
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      name="password"
                      value={registerForm.values.password}
                      onChange={registerForm.handleChange}
                      onBlur={registerForm.handleBlur}
                      error={registerForm.errors.password}
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button onClick={handleRegister} className="w-full" disabled={loading || !registerForm.isValid}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Registrar
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
