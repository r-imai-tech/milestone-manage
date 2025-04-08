"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EditProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: {
    id: string
    name: string
    description: string
    purpose?: string
    goals?: string[] | string
  }
  onUpdate: (updatedProject: any) => void
}

export function EditProjectDialog({ open, onOpenChange, project, onUpdate }: EditProjectDialogProps) {
  const { toast } = useToast()
  const [description, setDescription] = useState("")
  const [purpose, setPurpose] = useState("")
  const [goals, setGoals] = useState<string[]>([])

  useEffect(() => {
    if (project && open) {
      setDescription(project.description || "")
      setPurpose(project.purpose || "")

      // goalsが文字列の場合は配列に変換（後方互換性のため）
      if (Array.isArray(project.goals)) {
        setGoals(project.goals)
      } else if (project.goals) {
        setGoals([project.goals])
      } else {
        setGoals([""])
      }
    }
  }, [project, open])

  // 目標を追加する関数
  const addGoal = () => {
    setGoals([...goals, ""])
  }

  // 目標を削除する関数
  const removeGoal = (index: number) => {
    const newGoals = [...goals]
    newGoals.splice(index, 1)
    setGoals(newGoals)
  }

  // 目標を更新する関数
  const updateGoal = (index: number, value: string) => {
    const newGoals = [...goals]
    newGoals[index] = value
    setGoals(newGoals)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 空の目標を除外
    const filteredGoals = goals.filter((goal) => goal.trim() !== "")

    const updatedProject = {
      ...project,
      description,
      purpose,
      goals: filteredGoals,
    }

    onUpdate(updatedProject)
    onOpenChange(false)

    toast({
      title: "プロジェクト更新成功",
      description: "プロジェクト情報が更新されました",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>プロジェクト情報の編集</DialogTitle>
          <DialogDescription>プロジェクトの概要、目的、目標を編集できます</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">概要説明</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="プロジェクトの概要を入力してください"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">目的</Label>
            <Textarea
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="このプロジェクトの目的を入力してください"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>目標</Label>
              <Button type="button" variant="outline" size="sm" onClick={addGoal} className="h-8">
                <Plus className="mr-1 h-3 w-3" />
                目標を追加
              </Button>
            </div>

            {goals.map((goal, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={goal}
                  onChange={(e) => updateGoal(index, e.target.value)}
                  placeholder={`目標 ${index + 1}`}
                  rows={2}
                  className="flex-1"
                />
                {goals.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGoal(index)}
                    className="h-8 w-8 self-start mt-1"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
