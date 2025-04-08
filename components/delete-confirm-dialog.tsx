"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  itemType: "milestone" | "ball" | "task" | "stakeholder"
  itemTitle: string
}

export function DeleteConfirmDialog({ open, onOpenChange, onConfirm, itemType, itemTitle }: DeleteConfirmDialogProps) {
  const getItemTypeName = () => {
    switch (itemType) {
      case "milestone":
        return "マイルストーン"
      case "ball":
        return "対象ボール"
      case "task":
        return "自作業タスク"
      case "stakeholder":
        return "関係者"
      default:
        return "アイテム"
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getItemTypeName()}を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>「{itemTitle}」を削除します。この操作は元に戻せません。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            削除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
