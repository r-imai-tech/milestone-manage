"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarRange, ArrowRight, Lightbulb, Target } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

type Project = {
  id: string
  name: string
  startDate: string
  endDate: string
  description: string
  purpose?: string
  goals?: string[] | string
}

// Mock data - would be replaced with actual data from Supabase
const mockProjects: Project[] = [
  {
    id: "1",
    name: "社内研修資料作成",
    startDate: "2025-05-01",
    endDate: "2025-06-30",
    description: "新入社員向け研修資料の作成と進行管理",
    purpose: "新入社員が効率的に業務を学べる環境を整える",
    goals: ["研修資料の完成", "研修プログラムの策定", "講師の育成"],
  },
  {
    id: "2",
    name: "クライアントA向けドキュメント",
    startDate: "2025-04-15",
    endDate: "2025-07-15",
    description: "製品仕様書と操作マニュアルの作成",
    purpose: "クライアントが製品を効果的に活用できるようにする",
    goals: ["仕様書の完成", "操作マニュアルの作成", "サポート体制の構築"],
  },
]

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    // ローカルストレージからプロジェクトを取得
    const storedProjectsJSON = localStorage.getItem("projects")

    if (storedProjectsJSON) {
      try {
        const storedProjects = JSON.parse(storedProjectsJSON)
        // オブジェクトから配列に変換
        const projectsArray = Object.values(storedProjects) as Project[]
        setProjects([...mockProjects, ...projectsArray])
      } catch (error) {
        console.error("プロジェクトデータの読み込みに失敗しました:", error)
        setProjects(mockProjects)
      }
    } else {
      // ローカルストレージにデータがない場合はモックデータを使用
      setProjects(mockProjects)
    }
  }, [])

  if (projects.length === 0) {
    return (
      <Card className="col-span-full border-dashed">
        <CardHeader>
          <CardTitle>プロジェクトがありません</CardTitle>
          <CardDescription>新しいプロジェクトを作成して始めましょう</CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/projects/new" className="w-full">
            <Button className="w-full">プロジェクト作成</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <>
      {projects.map((project) => {
        // goalsが文字列の場合は配列に変換（後方互換性のため）
        const goalsArray = Array.isArray(project.goals) ? project.goals : project.goals ? [project.goals] : []

        return (
          <Link href={`/projects/${project.id}`} key={project.id} className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <CalendarRange className="h-4 w-4" />
                  <span>{formatDate(project.startDate)}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>{formatDate(project.endDate)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{project.description}</p>

                {/* 目的・目標を常に表示する */}
                <div className="space-y-3">
                  {project.purpose && (
                    <div className="space-y-1">
                      <div className="flex items-center text-xs font-medium">
                        <Lightbulb className="mr-1 h-3 w-3 text-amber-500" />
                        目的
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 pl-4">{project.purpose}</p>
                    </div>
                  )}

                  {goalsArray.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center text-xs font-medium">
                        <Target className="mr-1 h-3 w-3 text-green-500" />
                        目標
                      </div>
                      <ul className="text-xs text-muted-foreground pl-4">
                        {goalsArray.slice(0, 2).map((goal, index) => (
                          <li key={index} className="line-clamp-1">
                            ・{goal}
                          </li>
                        ))}
                        {goalsArray.length > 2 && (
                          <li className="text-xs text-muted-foreground">他 {goalsArray.length - 2} 件...</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Badge variant="outline" className="ml-auto">
                  詳細を見る
                </Badge>
              </CardFooter>
            </Card>
          </Link>
        )
      })}
    </>
  )
}
