"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock, Flag, User, Users } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"

interface TimelineProps {
  data: {
    milestones: any[]
    balls: any[]
    tasks: any[]
  }
  viewType: "year" | "month" | "week"
  currentDate: Date
  projectStartDate: Date
  projectEndDate: Date
}

export function Timeline({ data, viewType, currentDate, projectStartDate, projectEndDate }: TimelineProps) {
  const [draggingItem, setDraggingItem] = useState<any>(null)

  // Generate timeline grid based on view type
  const generateTimelineGrid = () => {
    const cells = []

    if (viewType === "year") {
      // Year view - 12 months
      for (let month = 0; month < 12; month++) {
        const date = new Date(currentDate.getFullYear(), month, 1)
        cells.push({
          label: `${month + 1}月`,
          date,
          isCurrentPeriod: new Date().getMonth() === month && new Date().getFullYear() === currentDate.getFullYear(),
        })
      }
    } else if (viewType === "month") {
      // Month view - days in month
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        cells.push({
          label: `${day}`,
          date,
          isCurrentPeriod:
            new Date().getDate() === day &&
            new Date().getMonth() === currentDate.getMonth() &&
            new Date().getFullYear() === currentDate.getFullYear(),
        })
      }
    } else if (viewType === "week") {
      // Week view - 7 days starting from current date
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()) // Start from Sunday

      for (let day = 0; day < 7; day++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + day)

        const dayNames = ["日", "月", "火", "水", "木", "金", "土"]
        cells.push({
          label: `${dayNames[day]} ${date.getDate()}`,
          date,
          isCurrentPeriod:
            new Date().getDate() === date.getDate() &&
            new Date().getMonth() === date.getMonth() &&
            new Date().getFullYear() === date.getFullYear(),
        })
      }
    }

    return cells
  }

  const timelineCells = generateTimelineGrid()

  // Helper to check if an item falls on a specific date cell
  const isItemInCell = (item: any, cell: any) => {
    const itemDate = new Date(item.date)

    if (viewType === "year") {
      return itemDate.getFullYear() === cell.date.getFullYear() && itemDate.getMonth() === cell.date.getMonth()
    } else if (viewType === "month") {
      return (
        itemDate.getFullYear() === cell.date.getFullYear() &&
        itemDate.getMonth() === cell.date.getMonth() &&
        itemDate.getDate() === cell.date.getDate()
      )
    } else if (viewType === "week") {
      return (
        itemDate.getFullYear() === cell.date.getFullYear() &&
        itemDate.getMonth() === cell.date.getMonth() &&
        itemDate.getDate() === cell.date.getDate()
      )
    }

    return false
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: any) => {
    setDraggingItem(item)
  }

  const handleDragOver = (e: React.DragEvent, cell: any) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, cell: any) => {
    e.preventDefault()

    if (!draggingItem) return

    // In a real app, this would update the item date in Supabase
    console.log(`Moved ${draggingItem.title} to ${formatDate(cell.date.toISOString())}`)

    setDraggingItem(null)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Timeline header */}
            <div className="grid grid-cols-[150px_1fr] border-b">
              <div className="border-r p-2 font-medium">タイムライン</div>
              <div
                className="grid"
                style={{ gridTemplateColumns: `repeat(${timelineCells.length}, minmax(100px, 1fr))` }}
              >
                {timelineCells.map((cell, index) => (
                  <div
                    key={index}
                    className={cn(
                      "border-r p-2 text-center text-sm",
                      cell.isCurrentPeriod && "bg-blue-50 dark:bg-blue-950",
                    )}
                  >
                    {cell.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones row */}
            <div className="grid grid-cols-[150px_1fr] border-b">
              <div className="border-r p-3 font-medium flex items-center">
                <Flag className="mr-2 h-4 w-4" />
                マイルストーン
              </div>
              <div
                className="grid relative min-h-[80px]"
                style={{ gridTemplateColumns: `repeat(${timelineCells.length}, minmax(100px, 1fr))` }}
              >
                {timelineCells.map((cell, index) => (
                  <div
                    key={index}
                    className="border-r h-full"
                    onDragOver={(e) => handleDragOver(e, cell)}
                    onDrop={(e) => handleDrop(e, cell)}
                  />
                ))}

                {data.milestones.map((milestone) => {
                  // Find the cell index for this milestone
                  const cellIndex = timelineCells.findIndex((cell) => isItemInCell(milestone, cell))
                  if (cellIndex === -1) return null

                  return (
                    <div
                      key={milestone.id}
                      className={cn(
                        "absolute top-1 rounded-md px-2 py-1 text-xs font-medium cursor-move",
                        milestone.importance === "high"
                          ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          : milestone.importance === "medium"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
                      )}
                      style={{
                        left: `calc(${cellIndex * (100 / timelineCells.length)}% + 4px)`,
                        width: `calc(${100 / timelineCells.length}% - 8px)`,
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, milestone)}
                    >
                      {milestone.title}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Balls row */}
            <div className="grid grid-cols-[150px_1fr] border-b">
              <div className="border-r p-3 font-medium flex items-center">
                <Users className="mr-2 h-4 w-4" />
                対象ボール
              </div>
              <div
                className="grid relative min-h-[80px]"
                style={{ gridTemplateColumns: `repeat(${timelineCells.length}, minmax(100px, 1fr))` }}
              >
                {timelineCells.map((cell, index) => (
                  <div
                    key={index}
                    className="border-r h-full"
                    onDragOver={(e) => handleDragOver(e, cell)}
                    onDrop={(e) => handleDrop(e, cell)}
                  />
                ))}

                {data.balls.map((ball) => {
                  // Find the cell index for this ball
                  const cellIndex = timelineCells.findIndex((cell) => isItemInCell(ball, cell))
                  if (cellIndex === -1) return null

                  return (
                    <div
                      key={ball.id}
                      className="absolute top-1 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-md px-2 py-1 text-xs font-medium cursor-move"
                      style={{
                        left: `calc(${cellIndex * (100 / timelineCells.length)}% + 4px)`,
                        width: `calc(${100 / timelineCells.length}% - 8px)`,
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, ball)}
                    >
                      <Badge variant="outline" className="mr-1 px-1 py-0 text-[10px]">
                        {ball.stakeholder}
                      </Badge>
                      {ball.title}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tasks row */}
            <div className="grid grid-cols-[150px_1fr]">
              <div className="border-r p-3 font-medium flex items-center">
                <User className="mr-2 h-4 w-4" />
                自作業タスク
              </div>
              <div
                className="grid relative min-h-[80px]"
                style={{ gridTemplateColumns: `repeat(${timelineCells.length}, minmax(100px, 1fr))` }}
              >
                {timelineCells.map((cell, index) => (
                  <div
                    key={index}
                    className="border-r h-full"
                    onDragOver={(e) => handleDragOver(e, cell)}
                    onDrop={(e) => handleDrop(e, cell)}
                  />
                ))}

                {data.tasks.map((task) => {
                  // Find the cell index for this task
                  const cellIndex = timelineCells.findIndex((cell) => isItemInCell(task, cell))
                  if (cellIndex === -1) return null

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "absolute top-1 rounded-md px-2 py-1 text-xs font-medium cursor-move flex items-center gap-1",
                        task.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                          : task.status === "in-progress"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                      )}
                      style={{
                        left: `calc(${cellIndex * (100 / timelineCells.length)}% + 4px)`,
                        width: `calc(${100 / timelineCells.length}% - 8px)`,
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                    >
                      {task.status === "completed" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : task.status === "in-progress" ? (
                        <Clock className="h-3 w-3" />
                      ) : (
                        <Circle className="h-3 w-3" />
                      )}
                      {task.title}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
