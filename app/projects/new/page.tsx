"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function NewProject() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [purpose, setPurpose] = useState("")
  const [goals, setGoals] = useState<string[]>([""])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!startDate || !endDate) {
      toast({
        title: "入力エラー",
        description: "開始日と終了日を選択してください",
        variant: "destructive",
      })
      return
    }

    if (startDate > endDate) {
      toast({
        title: "日付エラー",
        description: "終了日は開始日より後の日付を選択してください",
        variant: "destructive",
      })
      return
    }

    // 空の目標を除外
    const filteredGoals = goals.filter((goal) => goal.trim() !== "")

    // プロジェクト名以外の項目が入力されていない場合に確認
    if (!description || !purpose || filteredGoals.length === 0) {
      const confirmed = window.confirm("プロジェクト名以外の項目が入力されていません。このまま作成しますか？")
      if (!confirmed) {
        return
      }
    }

    setIsLoading(true)

    try {
      // 新しいプロジェクトを作成
      const newProject = {
        id: `project-${Date.now()}`,
        name,
        description: description || "",
        purpose: purpose || "",
        goals: filteredGoals, // 配列として保存
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }

      // ローカルストレージから既存のプロジェクトを取得
      const existingProjectsJSON = localStorage.getItem("projects")
      const existingProjects = existingProjectsJSON ? JSON.parse(existingProjectsJSON) : {}

      // 新しいプロジェクトを追加
      const updatedProjects = {
        ...existingProjects,
        [newProject.id]: newProject,
      }

      // ローカルストレージに保存
      localStorage.setItem("projects", JSON.stringify(updatedProjects))

      // 成功メッセージを表示
      toast({
        title: "プロジェクト作成成功",
        description: "新しいプロジェクトが作成されました",
      })

      // ホームページにリダイレクト
      router.push("/")
    } catch (error) {
      toast({
        title: "エラー",
        description: "プロジェクト作成中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">新規プロジェクト作成</h1>
        <p className="text-muted-foreground">プロジェクトの基本情報を入力してください</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">プロジェクト名</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：社内研修資料作成"
            required
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>開始日</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "yyyy年MM月dd日", { locale: ja }) : <span>日付を選択</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>終了日</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "yyyy年MM月dd日", { locale: ja }) : <span>日付を選択</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

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

        <div className="flex gap-4 pt-4">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full" type="button">
              キャンセル
            </Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "作成中..." : "プロジェクト作成"}
          </Button>
        </div>
      </form>
    </div>
  )
}
