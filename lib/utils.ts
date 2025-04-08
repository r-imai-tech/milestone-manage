import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return format(date, "yyyy年MM月dd日", { locale: ja })
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return format(date, "MM/dd", { locale: ja })
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return format(date, "HH:mm", { locale: ja })
}
