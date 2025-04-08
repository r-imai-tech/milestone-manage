"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, Circle, Clock, Edit } from "lucide-react"
import { cn, formatDate, formatDateShort, formatTime } from "@/lib/utils"
import { addDays, addMonths, differenceInDays, differenceInMonths, isToday } from "date-fns"
import { UpcomingItems } from "@/components/upcoming-items"
import { Button } from "@/components/ui/button"

// VisualTimelinePropsインターフェースに編集関連のプロパティを追加
interface VisualTimelineProps {
  data: {
    milestones: any[]
    balls: any[]
    tasks: any[]
  }
  viewType: "project" | "year" | "month" | "week" | "day"
  currentDate: Date
  projectStartDate: Date
  projectEndDate: Date
  onItemMove?: (item: any, newDate: Date) => void
  stakeholders: string[]
  onEditItem: (item: any) => void
  onEditStakeholder: (stakeholder: string) => void
}

export function VisualTimeline({
  data,
  viewType,
  currentDate,
  projectStartDate,
  projectEndDate,
  onItemMove,
  stakeholders,
  onEditItem,
  onEditStakeholder,
}: VisualTimelineProps) {
  const [draggingItem, setDraggingItem] = useState<any>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [timelineWidth, setTimelineWidth] = useState(0)

  useEffect(() => {
    if (timelineRef.current) {
      setTimelineWidth(timelineRef.current.offsetWidth)
    }

    const handleResize = () => {
      if (timelineRef.current) {
        setTimelineWidth(timelineRef.current.offsetWidth)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Generate timeline markers based on view type
  const generateTimelineMarkers = () => {
    const markers = []
    let startDate, endDate, format, interval

    if (viewType === "project") {
      // Project view - show the entire project with month markers
      startDate = new Date(projectStartDate)
      endDate = new Date(projectEndDate)
      const monthDiff = differenceInMonths(endDate, startDate) + 1

      for (let i = 0; i < monthDiff; i++) {
        const date = addMonths(startDate, i)
        markers.push({
          label: `${date.getMonth() + 1}月`,
          date,
          isCurrentPeriod: new Date().getMonth() === date.getMonth() && new Date().getFullYear() === date.getFullYear(),
        })
      }
    } else if (viewType === "year") {
      // Year view - 12 months
      for (let month = 0; month < 12; month++) {
        const date = new Date(currentDate.getFullYear(), month, 1)
        markers.push({
          label: `${month + 1}月`,
          date,
          isCurrentPeriod: new Date().getMonth() === month && new Date().getFullYear() === currentDate.getFullYear(),
        })
      }
    } else if (viewType === "month") {
      // Month view - weeks in month
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

      // Create week markers
      for (let day = 1; day <= daysInMonth; day += 7) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        const weekNumber = Math.ceil(day / 7)
        markers.push({
          label: `${weekNumber}週目`,
          date,
          isCurrentPeriod:
            new Date().getDate() >= day &&
            new Date().getDate() < day + 7 &&
            new Date().getMonth() === currentDate.getMonth() &&
            new Date().getFullYear() === currentDate.getFullYear(),
        })
      }
    } else if (viewType === "week") {
      // Week view - 7 days
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()) // Start from Sunday

      for (let day = 0; day < 7; day++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + day)

        const dayNames = ["日", "月", "火", "水", "木", "金", "土"]
        markers.push({
          label: `${dayNames[day]}`,
          date,
          isCurrentPeriod: isToday(date),
        })
      }
    } else if (viewType === "day") {
      // Day view - hours in a day (15-minute increments)
      for (let hour = 9; hour <= 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          // Show every 30 minutes as marker
          const date = new Date(currentDate)
          date.setHours(hour, minute, 0, 0)

          // Only show hour markers (to avoid cluttering)
          if (minute === 0) {
            markers.push({
              label: `${hour}:00`,
              date,
              isCurrentPeriod:
                new Date().getHours() === hour &&
                new Date().getMinutes() >= minute &&
                new Date().getMinutes() < minute + 30 &&
                isToday(currentDate),
            })
          }
        }
      }
    }

    return markers
  }

  const timelineMarkers = generateTimelineMarkers()

  // Calculate position on timeline based on date
  const getPositionForDate = (date: Date) => {
    const dateObj = new Date(date)

    if (viewType === "project") {
      const totalDays = differenceInDays(projectEndDate, projectStartDate)
      const daysPassed = differenceInDays(dateObj, projectStartDate)
      return (daysPassed / totalDays) * 100
    } else if (viewType === "year") {
      // Position based on month and day within year
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1)
      const daysInYear = 365 + (currentDate.getFullYear() % 4 === 0 ? 1 : 0)
      const dayOfYear = differenceInDays(dateObj, startOfYear)
      return (dayOfYear / daysInYear) * 100
    } else if (viewType === "month") {
      // Position based on day within month
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
      return ((dateObj.getDate() - 1) / daysInMonth) * 100
    } else if (viewType === "week") {
      // Position based on day within week
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      const dayOfWeek = differenceInDays(dateObj, startOfWeek)
      return (dayOfWeek / 7) * 100
    } else if (viewType === "day") {
      // Position based on hour and minute within day (9am-6pm)
      const hour = dateObj.getHours()
      const minute = dateObj.getMinutes()

      // Calculate position within 9-hour workday (9am to 6pm)
      // Convert to decimal hours (e.g., 10:30 = 10.5)
      const decimalHour = hour + minute / 60

      // Calculate position as percentage of workday
      // 9am = 0%, 6pm = 100%
      const position = (decimalHour - 9) / 9

      return Math.max(0, Math.min(100, position * 100))
    }

    return 0
  }

  // Check if an item should be displayed in the current view
  const isItemInView = (item: any) => {
    const itemDate = new Date(item.date)

    if (viewType === "project") {
      return itemDate >= projectStartDate && itemDate <= projectEndDate
    } else if (viewType === "year") {
      return itemDate.getFullYear() === currentDate.getFullYear()
    } else if (viewType === "month") {
      return itemDate.getFullYear() === currentDate.getFullYear() && itemDate.getMonth() === currentDate.getMonth()
    } else if (viewType === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return itemDate >= startOfWeek && itemDate <= endOfWeek
    } else if (viewType === "day") {
      return (
        itemDate.getFullYear() === currentDate.getFullYear() &&
        itemDate.getMonth() === currentDate.getMonth() &&
        itemDate.getDate() === currentDate.getDate()
      )
    }

    return false
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: any) => {
    setDraggingItem(item)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggingItem || !timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const position = ((e.clientX - rect.left) / rect.width) * 100

    let newDate: Date

    if (viewType === "project") {
      const totalDays = differenceInDays(projectEndDate, projectStartDate)
      const daysToAdd = Math.floor((position / 100) * totalDays)
      newDate = addDays(new Date(projectStartDate), daysToAdd)
    } else if (viewType === "year") {
      const month = Math.floor((position / 100) * 12)
      const day = 15 // Middle of month by default
      newDate = new Date(currentDate.getFullYear(), month, day)
    } else if (viewType === "month") {
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
      const day = Math.max(1, Math.min(daysInMonth, Math.floor((position / 100) * daysInMonth) + 1))
      newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    } else if (viewType === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      const daysToAdd = Math.floor((position / 100) * 7)
      newDate = addDays(startOfWeek, daysToAdd)
    } else if (viewType === "day") {
      // Calculate time with 15-minute precision
      const workdayHours = 9 // 9 hours from 9am to 6pm
      const decimalHour = 9 + (position / 100) * workdayHours

      const hour = Math.floor(decimalHour)
      const minute = Math.floor(((decimalHour - hour) * 60) / 15) * 15 // Round to nearest 15 minutes

      newDate = new Date(currentDate)
      newDate.setHours(hour, minute, 0, 0)
    } else {
      newDate = new Date()
    }

    if (onItemMove) {
      onItemMove(draggingItem, newDate)
    }

    setDraggingItem(null)
  }

  // Get title for the timeline based on view type
  const getTimelineTitle = () => {
    if (viewType === "project") {
      return `${formatDateShort(projectStartDate.toISOString())} 〜 ${formatDateShort(projectEndDate.toISOString())}`
    } else if (viewType === "year") {
      return `${currentDate.getFullYear()}年`
    } else if (viewType === "month") {
      return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`
    } else if (viewType === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return `${formatDateShort(startOfWeek.toISOString())} 〜 ${formatDateShort(endOfWeek.toISOString())}`
    } else if (viewType === "day") {
      return formatDate(currentDate.toISOString())
    }
    return ""
  }

  // Get start and end labels for the timeline
  const getTimelineStartLabel = () => {
    if (viewType === "project" || viewType === "year" || viewType === "month" || viewType === "week") {
      return "本日"
    } else if (viewType === "day") {
      return "9:00"
    }
    return ""
  }

  const getTimelineEndLabel = () => {
    if (viewType === "project") {
      const monthDiff = differenceInMonths(projectEndDate, new Date())
      return `${monthDiff}ヶ月後`
    } else if (viewType === "year") {
      return "12ヶ月後"
    } else if (viewType === "month") {
      return "1ヶ月後"
    } else if (viewType === "week") {
      return "1週間後"
    } else if (viewType === "day") {
      return "18:00"
    }
    return ""
  }

  // Filter items for the current view
  const visibleMilestones = data.milestones.filter(isItemInView)
  const visibleBalls = data.balls.filter(isItemInView)
  const visibleTasks = data.tasks.filter(isItemInView)

  // 各ステークホルダーに関連するボールを取得
  const getBallsForStakeholder = (stakeholder: string) => {
    return visibleBalls.filter((ball) => ball.stakeholder === stakeholder)
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg p-6 shadow-sm border">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold">{getTimelineTitle()}</h3>
        <div className="mt-2">
          <UpcomingItems data={data} maxItems={3} />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_5fr] gap-4">
        {/* Left column - row labels */}
        <div className="flex flex-col justify-between min-h-[300px]">
          <div className="h-8 flex items-center font-bold">{getTimelineStartLabel()}</div>

          {stakeholders.map((stakeholder) => (
            <div
              key={stakeholder}
              className="flex items-center justify-between font-medium text-gray-700 dark:text-gray-300"
            >
              <span>対{stakeholder}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onEditStakeholder && onEditStakeholder(stakeholder)}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          ))}

          <div className="flex items-center font-medium text-gray-700 dark:text-gray-300">作業</div>
          <div className="h-8 flex items-center justify-end font-bold">{getTimelineEndLabel()}</div>
        </div>

        {/* Right column - timeline */}
        <div>
          {/* Timeline header with markers */}
          <div className="flex justify-between mb-2">
            {timelineMarkers.map((marker, index) => (
              <div
                key={index}
                className={cn(
                  "text-center text-sm font-medium",
                  marker.isCurrentPeriod && "text-blue-600 dark:text-blue-400",
                )}
              >
                {marker.label}
              </div>
            ))}
          </div>

          {/* Main timeline */}
          <div ref={timelineRef} className="relative" onDragOver={handleDragOver} onDrop={handleDrop}>
            {/* Timeline line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-700"></div>

            {/* Timeline end points */}
            <div className="absolute top-2 left-0 w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400"></div>
            <div className="absolute top-2 right-0 w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400"></div>

            {/* Timeline content */}
            <div className="pt-8 pb-4 min-h-[300px] flex flex-col justify-between">
              {/* Milestones row */}
              <div className="relative h-24">
                <div className="absolute left-0 right-0 top-12 h-0.5 border-t-2 border-dashed border-gray-300 dark:border-gray-700"></div>

                {visibleMilestones.map((milestone) => {
                  const position = getPositionForDate(new Date(milestone.date))

                  return (
                    <TooltipProvider key={milestone.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "absolute transform -translate-x-1/2 cursor-pointer px-2 py-1 rounded text-xs font-medium max-w-[150px] text-center",
                              milestone.importance === "high"
                                ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                                : milestone.importance === "medium"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
                            )}
                            style={{
                              left: `${position}%`,
                              top: 0,
                            }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, milestone)}
                            onClick={() => onEditItem && onEditItem(milestone)}
                          >
                            {milestone.title}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{formatDate(milestone.date)}</p>
                          {viewType === "day" && <p>{formatTime(milestone.date)}</p>}
                          <p className="text-xs text-muted-foreground mt-1">クリックして編集</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>

              {/* Stakeholder rows - one row per stakeholder */}
              {stakeholders.map((stakeholder) => {
                // 各ステークホルダーに関連するボールを取得
                const stakeholderBalls = getBallsForStakeholder(stakeholder)

                return (
                  <div key={stakeholder} className="relative h-24">
                    <div className="absolute left-0 right-0 top-12 h-0.5 border-t-2 border-dashed border-gray-300 dark:border-gray-700"></div>

                    {stakeholderBalls.map((ball) => {
                      const position = getPositionForDate(new Date(ball.date))

                      return (
                        <TooltipProvider key={ball.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute transform -translate-x-1/2 cursor-pointer bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-1 rounded text-xs font-medium max-w-[150px] text-center"
                                style={{
                                  left: `${position}%`,
                                  top: 0,
                                }}
                                draggable
                                onDragStart={(e) => handleDragStart(e, ball)}
                                onClick={() => onEditItem && onEditItem(ball)}
                              >
                                <Badge variant="outline" className="mb-1 px-1 py-0 text-[10px]">
                                  {ball.stakeholder}
                                </Badge>
                                <div>{ball.title}</div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{formatDate(ball.date)}</p>
                              {viewType === "day" && <p>{formatTime(ball.date)}</p>}
                              <p className="text-xs text-muted-foreground mt-1">クリックして編集</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}

                    {/* Connection lines for balls */}
                    {stakeholderBalls.map((ball, index, filteredBalls) => {
                      if (index === 0) return null

                      const prevBall = filteredBalls[index - 1]
                      const prevPosition = getPositionForDate(new Date(prevBall.date))
                      const currentPosition = getPositionForDate(new Date(ball.date))

                      return (
                        <svg
                          key={`line-${ball.id}`}
                          className="absolute top-0 left-0 w-full h-full pointer-events-none"
                          style={{ overflow: "visible" }}
                        >
                          <line
                            x1={`${prevPosition}%`}
                            y1="20"
                            x2={`${currentPosition}%`}
                            y2="20"
                            stroke="#d1d5db"
                            strokeWidth="1"
                            strokeDasharray="4"
                          />
                        </svg>
                      )
                    })}
                  </div>
                )
              })}

              {/* Tasks row */}
              <div className="relative h-24">
                <div className="absolute left-0 right-0 top-12 h-0.5 border-t-2 border-dashed border-gray-300 dark:border-gray-700"></div>

                {visibleTasks.map((task) => {
                  const position = getPositionForDate(new Date(task.date))

                  return (
                    <TooltipProvider key={task.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "absolute transform -translate-x-1/2 cursor-pointer px-2 py-1 rounded text-xs font-medium max-w-[150px] text-center flex items-center gap-1",
                              task.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                                : task.status === "in-progress"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                            )}
                            style={{
                              left: `${position}%`,
                              top: 0,
                            }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            onClick={() => onEditItem && onEditItem(task)}
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
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{formatDate(task.date)}</p>
                          {viewType === "day" && <p>{formatTime(task.date)}</p>}
                          <p className="text-xs text-muted-foreground mt-1">クリックして編集</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}

                {/* Connection lines for tasks */}
                {visibleTasks.map((task, index) => {
                  if (index === 0) return null

                  const prevTask = visibleTasks[index - 1]
                  const prevPosition = getPositionForDate(new Date(prevTask.date))
                  const currentPosition = getPositionForDate(new Date(task.date))

                  return (
                    <svg
                      key={`line-${task.id}`}
                      className="absolute top-0 left-0 w-full h-full pointer-events-none"
                      style={{ overflow: "visible" }}
                    >
                      <line
                        x1={`${prevPosition}%`}
                        y1="20"
                        x2={`${currentPosition}%`}
                        y2="20"
                        stroke="#d1d5db"
                        strokeWidth="1"
                        strokeDasharray="4"
                      />
                    </svg>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
