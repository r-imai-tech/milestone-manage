"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemType: "milestone" | "ball" | "task"
  onAdd: (item: any) => void
  projectStartDate: Date
  projectEndDate: Date
  stakeholders: string[]
  onAddStakeholder: (stakeholder: string) => void
  viewType: "project" | "year" | "month" | "week" | "day"
}

export function AddItemDialog({
  open,
  onOpenChange,
  itemType,
  onAdd,
  projectStartDate,
  projectEndDate,
  stakeholders,
  onAddStakeholder,
  viewType,
}: AddItemDialogProps) {
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("09:00")
  const [importance, setImportance] = useState<string>("medium")
  const [stakeholder, setStakeholder] = useState<string>("")
  const [newStakeholder, setNewStakeholder] = useState<string>("")
  const [status, setStatus] = useState<string>("not-started")
  const [showNewStakeholder, setShowNewStakeholder] = useState(false)

  const resetForm = () => {
    setTitle("")
    setDate(undefined)
    setTime("09:00")
    setImportance("medium")
    setStakeholder("")
    setNewStakeholder("")
    setStatus("not-started")
    setShowNewStakeholder(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !date) {
      toast({
        title: "入力エラー",
        description: "タイトルと日付は必須です",
        variant: "destructive",
      })
      return
    }

    // Check if date is within project range
    if (date < projectStartDate || date > projectEndDate) {
      toast({
        title: "日付エラー",
        description: "日付はプロジェクト期間内である必要があります",
        variant: "destructive",
      })
      return
    }

    // Handle new stakeholder if needed
    let finalStakeholder = stakeholder
    if (itemType === "ball" && showNewStakeholder && newStakeholder.trim()) {
      finalStakeholder = newStakeholder.trim()
      onAddStakeholder(finalStakeholder)
    }

    // Set time for the date if in day view
    const finalDate = new Date(date)
    if (viewType === "day" && time) {
      const [hours, minutes] = time.split(":").map(Number)
      finalDate.setHours(hours, minutes, 0, 0)
    }

    // Create new item based on type
    const newItem = {
      id: `new-${Date.now()}`,
      title,
      date: finalDate.toISOString(),
      type: itemType,
    }

    if (itemType === "milestone") {
      Object.assign(newItem, { importance })
    } else if (itemType === "ball") {
      Object.assign(newItem, { stakeholder: finalStakeholder })
    } else if (itemType === "task") {
      Object.assign(newItem, { status })
    }

    onAdd(newItem)
    resetForm()
    onOpenChange(false)

    toast({
      title: "追加成功",
      description: `${
        itemType === "milestone" ? "マイルストーン" : itemType === "ball" ? "ボール" : "タスク"
      }が追加されました`,
    })
  }

  const timeOptions = []
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, "0")
      const formattedMinute = minute.toString().padStart(2, "0")
      timeOptions.push(`${formattedHour}:${formattedMinute}`)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm()
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {itemType === "milestone" ? "マイルストーン" : itemType === "ball" ? "対象ボール" : "自作業タスク"}
            を追加
          </DialogTitle>
          <DialogDescription>タイムラインに新しい項目を追加します</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                itemType === "milestone" ? "例：最終納品" : itemType === "ball" ? "例：進捗報告" : "例：資料作成"
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>日付</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "yyyy年MM月dd日", { locale: ja }) : <span>日付を選択</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < projectStartDate || date > projectEndDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          {viewType === "day" && (
            <div className="space-y-2">
              <Label htmlFor="time">時間</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="時間を選択" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {timeOptions.map((timeOption) => (
                      <SelectItem key={timeOption} value={timeOption}>
                        {timeOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {itemType === "milestone" && (
            <div className="space-y-2">
              <Label htmlFor="importance">重要度</Label>
              <Select value={importance} onValueChange={setImportance}>
                <SelectTrigger>
                  <SelectValue placeholder="重要度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">高（赤）</SelectItem>
                  <SelectItem value="medium">中（黄）</SelectItem>
                  <SelectItem value="low">低（青）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {itemType === "ball" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="stakeholder">関係者</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewStakeholder(!showNewStakeholder)}
                >
                  {showNewStakeholder ? "既存の関係者から選択" : "新しい関係者を追加"}
                </Button>
              </div>

              {showNewStakeholder ? (
                <Input
                  id="new-stakeholder"
                  value={newStakeholder}
                  onChange={(e) => setNewStakeholder(e.target.value)}
                  placeholder="例：クライアントB"
                  required
                />
              ) : (
                <Select value={stakeholder} onValueChange={setStakeholder}>
                  <SelectTrigger>
                    <SelectValue placeholder="関係者を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {stakeholders.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {itemType === "task" && (
            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="ステータスを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">未着手</SelectItem>
                  <SelectItem value="in-progress">進行中</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="submit">追加</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
