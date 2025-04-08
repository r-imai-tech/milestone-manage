"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock, Flag, Users } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"

interface UpcomingItemsProps {
  data: {
    milestones: any[]
    balls: any[]
    tasks: any[]
  }
  maxItems?: number
}

export function UpcomingItems({ data, maxItems = 3 }: UpcomingItemsProps) {
  // Get current date
  const now = new Date()

  // Filter items that are in the future
  const futureMilestones = data.milestones
    .filter((item) => new Date(item.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const futureBalls = data.balls
    .filter((item) => new Date(item.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const futureTasks = data.tasks
    .filter((item) => new Date(item.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Combine and sort all upcoming items
  const allUpcomingItems = [...futureMilestones, ...futureBalls, ...futureTasks]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, maxItems)

  if (allUpcomingItems.length === 0) {
    return <div className="text-center text-muted-foreground py-2">直近の予定はありません</div>
  }

  return (
    <div className="space-y-2">
      {allUpcomingItems.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          {item.type === "milestone" && (
            <>
              <Flag
                className={cn(
                  "h-4 w-4",
                  item.importance === "high"
                    ? "text-red-500"
                    : item.importance === "medium"
                      ? "text-amber-500"
                      : "text-blue-500",
                )}
              />
              <Badge variant="secondary" className="mr-1 px-1 py-0 text-xs">
                マイルストーン
              </Badge>
              <span className="font-medium">{item.title}</span>
              <Badge variant="outline" className="ml-auto">
                {formatDate(item.date)}
              </Badge>
            </>
          )}

          {item.type === "ball" && (
            <>
              <Users className="h-4 w-4 text-purple-500" />
              <Badge variant="secondary" className="mr-1 px-1 py-0 text-xs">
                対象ボール
              </Badge>
              <span className="font-medium">{item.title}</span>
              <Badge variant="outline" className="ml-1 px-1 py-0 text-xs">
                {item.stakeholder}
              </Badge>
              <Badge variant="outline" className="ml-auto">
                {formatDate(item.date)}
              </Badge>
            </>
          )}

          {item.type === "task" && (
            <>
              {item.status === "completed" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : item.status === "in-progress" ? (
                <Clock className="h-4 w-4 text-blue-500" />
              ) : (
                <Circle className="h-4 w-4 text-gray-500" />
              )}
              <Badge variant="secondary" className="mr-1 px-1 py-0 text-xs">
                タスク
              </Badge>
              <span className="font-medium">{item.title}</span>
              <Badge variant="outline" className="ml-auto">
                {formatDate(item.date)}
              </Badge>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
