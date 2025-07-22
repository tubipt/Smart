"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { useAuth } from "@/contexts/auth-context"
import { Users, Plus, Crown, User, Trash2, Mail, Calendar } from "lucide-react"

export function FamilyManagement() {
  const { familyMembers, addFamilyMember, removeFamilyMember } = useApp()
  const { user } = useAuth()
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return

    setIsLoading(true)
    const success = await addFamilyMember(newMemberEmail)

    if (success) {
      setNewMemberEmail("")
      setIsDialogOpen(false)
    }
    setIsLoading(false)
  }

  const canRemoveMember = (memberId: string) => {
    return user?.role === "admin" && memberId !== user?.id
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <CardTitle>Família</CardTitle>
          </div>
          {user?.role === "admin" && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Membro da Família</DialogTitle>
                  <DialogDescription>Convide alguém para partilhar a despensa familiar</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email do novo membro</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddMember} className="w-full" disabled={isLoading}>
                    {isLoading ? "Enviando convite..." : "Enviar Convite"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {familyMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                {member.role === "admin" ? (
                  <Crown className="w-5 h-5 text-blue-600" />
                ) : (
                  <User className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <div className="font-medium flex items-center gap-2">
                  {member.name}
                  {member.role === "admin" && (
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  )}
                  {member.id === user?.id && (
                    <Badge variant="outline" className="text-xs">
                      Você
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {member.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(member.joinedDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
            {canRemoveMember(member.id) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFamilyMember(member.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
