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
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"

interface EditStakeholderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stakeholder: string
  stakeholders: string[]
  onUpdate: (oldStakeholder: string, newStakeholder: string) => void
  onDelete: (stakeholder: string) => void
}

export function EditStakeholderDialog({
  open,
  onOpenChange,
  stakeholder,
  stakeholders,
  onUpdate,
  onDelete,
}: EditStakeholderDialogProps) {
  const { toast } = useToast()
  const [newStakeholderName, setNewStakeholderName] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // stakeholderが変更されたときにnewStakeholderNameを更新
  useEffect(() => {
    if (stakeholder) {
      setNewStakeholderName(stakeholder)
    }
  }, [stakeholder, open])

  // ダイアログが閉じられたときにフォームをリセット
  useEffect(() => {
    if (!open) {
      setIsDeleteDialogOpen(false)
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newStakeholderName.trim()) {
      toast({
        title: "入力エラー",
        description: "関係者名を入力してください",
        variant: "destructive",
      })
      return
    }

    // 同じ名前の関係者が既に存在するかチェック（自分自身は除く）
    if (stakeholders.some((s) => s !== stakeholder && s.toLowerCase() === newStakeholderName.trim().toLowerCase())) {
      toast({
        title: "入力エラー",
        description: "同じ名前の関係者が既に存在します",
        variant: "destructive",
      })
      return
    }

    onUpdate(stakeholder, newStakeholderName.trim())
    onOpenChange(false)

    toast({
      title: "更新成功",
      description: "関係者名が更新されました",
    })
  }

  const handleDelete = () => {
    onDelete(stakeholder)
    setIsDeleteDialogOpen(false)
    onOpenChange(false)
  }

  // stakeholderが空の場合はダイアログを表示しない
  if (!stakeholder) {
    return null
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>関係者を編集</DialogTitle>
            <DialogDescription>関係者の名前を変更または削除します</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stakeholder-name">関係者名</Label>
              <Input
                id="stakeholder-name"
                value={newStakeholderName}
                onChange={(e) => setNewStakeholderName(e.target.value)}
                placeholder="例：クライアントB"
                required
              />
            </div>

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
        itemType="stakeholder"
        itemTitle={stakeholder}
      />
    </>
  )
}
