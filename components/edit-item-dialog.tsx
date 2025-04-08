"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { CalendarIcon, Clock, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"

interface EditItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any | null
  onUpdate: (updatedItem: any) => void
  onDelete: (item: any) => void
  projectStartDate: Date
  projectEndDate: Date
  stakeholders: string[]
  onAddStakeholder: (stakeholder: string) => void
  viewType: "project" | "year" | "month" | "week" | "day"
}

export function EditItemDialog({
  open,
  onOpenChange,
  item,
  onUpdate,
  onDelete,
  projectStartDate,
  projectEndDate,
  stakeholders,
  onAddStakeholder,
  viewType,
}: EditItemDialogProps) {
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("09:00")
  const [importance, setImportance] = useState<string>("medium")
  const [stakeholder, setStakeholder] = useState<string>("")
  const [newStakeholder, setNewStakeholder] = useState<string>("")
  const [status, setStatus] = useState<string>("not-started")
  const [showNewStakeholder, setShowNewStakeholder] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // 編集するアイテムが変更されたら、フォームの値を更新
  useEffect(() => {
    if (item) {
      setTitle(item.title || "")

      if (item.date) {
        const itemDate = new Date(item.date)
        setDate(itemDate)

        // 時間の設定（日ビューの場合）
        if (viewType === "day") {
          const hours = itemDate.getHours().toString().padStart(2, "0")
          const minutes = itemDate.getMinutes().toString().padStart(2, "0")
          setTime(`${hours}:${minutes}`)
        }
      }

      if (item.type === "milestone" && item.importance) {
        setImportance(item.importance)
      }

      if (item.type === "ball" && item.stakeholder) {
        setStakeholder(item.stakeholder)
      }

      if (item.type === "task" && item.status) {
        setStatus(item.status)
      }
    }
  }, [item, viewType])

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
    if (item?.type === "ball" && showNewStakeholder && newStakeholder.trim()) {
      finalStakeholder = newStakeholder.trim()
      onAddStakeholder(finalStakeholder)
    }

    // Set time for the date if in day view
    const finalDate = new Date(date)
    if (viewType === "day" && time) {
      const [hours, minutes] = time.split(":").map(Number)
      finalDate.setHours(hours, minutes, 0, 0)
    }

    // Create updated item
    const updatedItem = {
      ...item,
      title,
      date: finalDate.toISOString(),
    }

    if (item?.type === "milestone") {
      updatedItem.importance = importance
    } else if (item?.type === "ball") {
      updatedItem.stakeholder = finalStakeholder
    } else if (item?.type === "task") {
      updatedItem.status = status
    }

    onUpdate(updatedItem)
    resetForm()
    onOpenChange(false)

    toast({
      title: "更新成功",
      description: `${
        item?.type === "milestone" ? "マイルストーン" : item?.type === "ball" ? "ボール" : "タスク"
      }が更新されました`,
    })
  }

  const handleDelete = () => {
    if (item) {
      onDelete(item)
      resetForm()
      onOpenChange(false)
      setIsDeleteDialogOpen(false)

      toast({
        title: "削除成功",
        description: `${
          item.type === "milestone" ? "マイルストーン" : item.type === "ball" ? "ボール" : "タスク"
        }が削除されました`,
      })
    }
  }

  const timeOptions = []
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, "0")
      const formattedMinute = minute.toString().padStart(2, "0")
      timeOptions.push(`${formattedHour}:${formattedMinute}`)
    }
  }

  if (!item) return null

  return (
    <>
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
              {item.type === "milestone" ? "マイルストーン" : item.type === "ball" ? "対象ボール" : "自作業タスク"}
              を編集
            </DialogTitle>
            <DialogDescription>タイムライン上のアイテムを編集します</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  item.type === "milestone" ? "例：最終納品" : item.type === "ball" ? "例：進捗報告" : "例：資料作成"
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

            {item.type === "milestone" && (
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

            {item.type === "ball" && (
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

            {item.type === "task" && (
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

            <DialogFooter className="pt-4 flex items-center justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex items-center"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                削除
              </Button>
              <Button type="submit">更新</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemType={item.type}
        itemTitle={item.title}
      />
    </>
  )
}
