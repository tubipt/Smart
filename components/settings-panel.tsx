"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useApp } from "@/contexts/app-context"
import { Settings, User, Bell, Download, Upload, Trash2 } from "lucide-react"

export function SettingsPanel() {
  const { user, updateUser, logout } = useAuth()
  const { clearAllNotifications, products, shoppingList } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  if (!user) return null

  const handleUpdateProfile = () => {
    updateUser({
      name: profileData.name,
      email: profileData.email,
    })
  }

  const handleToggleNotifications = (enabled: boolean) => {
    updateUser({
      preferences: {
        ...user.preferences,
        notifications: enabled,
      },
    })
  }

  const handleToggleDarkMode = (enabled: boolean) => {
    updateUser({
      preferences: {
        ...user.preferences,
        darkMode: enabled,
      },
    })
  }

  const handleExportData = () => {
    const data = {
      products,
      shoppingList,
      exportDate: new Date().toISOString(),
      user: user.name,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `despensa-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        // Em uma app real, validaria e importaria os dados
        console.log("Dados importados:", data)
        alert("Dados importados com sucesso!")
      } catch (error) {
        alert("Erro ao importar dados. Verifique o formato do arquivo.")
      }
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações
          </DialogTitle>
          <DialogDescription>Gerencie suas preferências e dados</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Perfil */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdateProfile} size="sm" className="w-full">
                Atualizar Perfil
              </Button>
            </CardContent>
          </Card>

          {/* Preferências */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Preferências
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações</Label>
                  <p className="text-sm text-gray-600">Receber alertas sobre produtos</p>
                </div>
                <Switch checked={user.preferences.notifications} onCheckedChange={handleToggleNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Escuro</Label>
                  <p className="text-sm text-gray-600">Tema escuro da aplicação</p>
                </div>
                <Switch checked={user.preferences.darkMode} onCheckedChange={handleToggleDarkMode} />
              </div>

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={user.preferences.language}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dados */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Gestão de Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleExportData} variant="outline" className="w-full justify-start bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Exportar Dados
              </Button>

              <div>
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" id="import-file" />
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Dados
                  </label>
                </Button>
              </div>

              <Button
                onClick={clearAllNotifications}
                variant="outline"
                className="w-full justify-start text-orange-600 hover:text-orange-700 bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Notificações
              </Button>
            </CardContent>
          </Card>

          {/* Conta */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-red-600">Zona de Perigo</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={logout} variant="destructive" className="w-full">
                Terminar Sessão
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
