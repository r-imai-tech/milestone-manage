"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronRight, Home, Share2, Target, Lightbulb, Edit } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface ProjectHeaderProps {
  project: {
    id: string
    name: string
    startDate: string
    endDate: string
    description: string
    purpose?: string
    goals?: string[] | string
  }
  onEditClick: () => void
}

export function ProjectHeader({ project, onEditClick }: ProjectHeaderProps) {
  // goalsが文字列の場合は配列に変換（後方互換性のため）
  const goalsArray = Array.isArray(project.goals) ? project.goals : project.goals ? [project.goals] : []

  return (
    <header className="border-b bg-background">
      <div className="container px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/" className="flex items-center hover:text-foreground">
            <Home className="mr-1 h-3 w-3" />
            ホーム
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>プロジェクト</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{project.name}</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(project.startDate)}</span>
              <span>〜</span>
              <span>{formatDate(project.endDate)}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{project.description}</p>

            {/* 目的・目標を常に表示する */}
            <div className="w-full max-w-2xl mt-4 space-y-4">
              {project.purpose && (
                <div className="space-y-1">
                  <div className="flex items-center text-sm font-medium">
                    <Lightbulb className="mr-2 h-4 w-4 text-amber-500" />
                    目的
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line pl-6">{project.purpose}</p>
                </div>
              )}

              {goalsArray.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center text-sm font-medium">
                    <Target className="mr-2 h-4 w-4 text-green-500" />
                    目標
                  </div>
                  <ul className="text-sm text-muted-foreground pl-6 space-y-1">
                    {goalsArray.map((goal, index) => (
                      <li key={index} className="whitespace-pre-line">
                        ・{goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEditClick}>
              <Edit className="mr-2 h-4 w-4" />
              編集
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              共有
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
