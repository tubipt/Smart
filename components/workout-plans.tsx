"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useApp } from "@/contexts/app-context"
import { Dumbbell, Clock, Zap, Target, Play, CheckCircle, Info } from "lucide-react"

export function WorkoutPlans() {
  const { generateWorkoutPlans, getTodayNutrition, nutritionalGoals } = useApp()
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())

  const workoutPlans = generateWorkoutPlans()
  const todayNutrition = getTodayNutrition()

  if (workoutPlans.length === 0) {
    return null
  }

  const toggleExerciseComplete = (planId: string, exerciseIndex: number) => {
    const key = `${planId}_${exerciseIndex}`
    const newCompleted = new Set(completedExercises)

    if (newCompleted.has(key)) {
      newCompleted.delete(key)
    } else {
      newCompleted.add(key)
    }

    setCompletedExercises(newCompleted)
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "moderate":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "cardio":
        return <Zap className="w-4 h-4" />
      case "strength":
        return <Dumbbell className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-purple-600" />
          <CardTitle className="text-purple-800">Planos de Treino Personalizados</CardTitle>
        </div>
        <p className="text-sm text-purple-700">Baseados na sua nutrição de hoje</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Resumo Nutricional */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-lg border text-center text-sm">
          <div>
            <div className="font-medium text-purple-800">{todayNutrition.calories.toFixed(0)}</div>
            <div className="text-xs text-purple-600">calorias consumidas</div>
          </div>
          <div>
            <div className="font-medium text-purple-800">{todayNutrition.protein.toFixed(0)}g</div>
            <div className="text-xs text-purple-600">proteína</div>
          </div>
          <div>
            <div className="font-medium text-purple-800">
              {Math.round((todayNutrition.calories / nutritionalGoals.calories) * 100)}%
            </div>
            <div className="text-xs text-purple-600">da meta diária</div>
          </div>
        </div>

        {/* Planos de Treino */}
        {workoutPlans.map((plan) => (
          <Dialog key={plan.id}>
            <DialogTrigger asChild>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeIcon(plan.type)}
                    <span className="font-medium">{plan.name}</span>
                    <Badge className={getIntensityColor(plan.intensity)} variant="outline">
                      {plan.intensity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{plan.reason}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {plan.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />~{plan.totalCalories} cal
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getTypeIcon(plan.type)}
                  {plan.name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {plan.duration} minutos
                  </span>
                  <Badge className={getIntensityColor(plan.intensity)} variant="outline">
                    {plan.intensity}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Motivo do Plano */}
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">Por que este treino?</span>
                  </div>
                  <p className="text-sm text-purple-700">{plan.reason}</p>
                </div>

                {/* Lista de Exercícios */}
                <div>
                  <h3 className="font-medium mb-3">Exercícios</h3>
                  <div className="space-y-2">
                    {plan.exercises.map((exercise: any, index: number) => {
                      const isCompleted = completedExercises.has(`${plan.id}_${index}`)

                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                            isCompleted ? "bg-green-50 border-green-200" : "bg-gray-50 hover:bg-gray-100"
                          }`}
                          onClick={() => toggleExerciseComplete(plan.id, index)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isCompleted ? "bg-green-500 border-green-500" : "border-gray-300"
                              }`}
                            >
                              {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                              <div className={`font-medium ${isCompleted ? "line-through text-gray-500" : ""}`}>
                                {exercise.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {exercise.duration && `${exercise.duration} min`}
                                {exercise.sets && `${exercise.sets} séries`}
                                {exercise.reps && ` × ${exercise.reps} rep`}
                                {exercise.rest && ` • ${exercise.rest}s descanso`}
                                {exercise.calories && ` • ~${exercise.calories} cal`}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Progresso */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso</span>
                    <span>
                      {Array.from(completedExercises).filter((key) => key.startsWith(plan.id)).length} /{" "}
                      {plan.exercises.length}
                    </span>
                  </div>
                  <Progress
                    value={
                      (Array.from(completedExercises).filter((key) => key.startsWith(plan.id)).length /
                        plan.exercises.length) *
                      100
                    }
                    className="h-2"
                  />
                </div>

                {/* Informações Adicionais */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium">Calorias Queimadas</div>
                    <div className="text-purple-600">~{plan.totalCalories}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium">Intensidade</div>
                    <div className="text-purple-600 capitalize">{plan.intensity}</div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </CardContent>
    </Card>
  )
}
