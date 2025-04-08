"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, ChevronLeft, ChevronRight, Plus, Settings } from "lucide-react"
import { VisualTimeline } from "@/components/visual-timeline"
import { ProjectHeader } from "@/components/project-header"
import { AddItemDialog } from "@/components/add-item-dialog"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { EditItemDialog } from "@/components/edit-item-dialog"
import { EditStakeholderDialog } from "@/components/edit-stakeholder-dialog"
import { EditProjectDialog } from "@/components/edit-project-dialog"

// Mock project data - would be fetched from Supabase
const mockProjects = {
  "1": {
    id: "1",
    name: "社内研修資料作成",
    startDate: "2025-05-01",
    endDate: "2025-06-30",
    description: "新入社員向け研修資料の作成と進行管理",
    purpose: "新入社員が効率的に業務を学べる環境を整える",
    goals: ["研修資料の完成", "研修プログラムの策定", "講師の育成"],
  },
  "2": {
    id: "2",
    name: "クライアントA向けドキュメント",
    startDate: "2025-04-15",
    endDate: "2025-07-15",
    description: "製品仕様書と操作マニュアルの作成",
    purpose: "クライアントが製品を効果的に活用できるようにする",
    goals: ["仕様書の完成", "操作マニュアルの作成", "サポート体制の構築"],
  },
}

// Mock timeline data
const mockTimelineData = {
  milestones: [
    { id: "m1", title: "企画書承認", date: "2025-05-10", type: "milestone", importance: "high" },
    { id: "m2", title: "中間レビュー", date: "2025-06-01", type: "milestone", importance: "medium" },
    { id: "m3", title: "最終納品", date: "2025-06-25", type: "milestone", importance: "high" },
  ],
  balls: [
    { id: "b1", title: "企画書提出", date: "2025-05-05", type: "ball", stakeholder: "上司" },
    { id: "b2", title: "フィードバック共有", date: "2025-05-20", type: "ball", stakeholder: "クライアント" },
    { id: "b3", title: "進捗報告", date: "2025-06-10", type: "ball", stakeholder: "チーム" },
  ],
  tasks: [
    { id: "t1", title: "資料構成検討", date: "2025-05-03", type: "task", status: "completed" },
    { id: "t2", title: "ドラフト作成", date: "2025-05-15", type: "task", status: "in-progress" },
    { id: "t3", title: "デザイン調整", date: "2025-06-05", type: "task", status: "not-started" },
    { id: "t4", title: "最終チェック", date: "2025-06-20", type: "task", status: "not-started" },
  ],
}

type ViewType = "project" | "year" | "month" | "week" | "day"

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.id as string
  const { toast } = useToast()

  const [project, setProject] = useState<any>(null)
  const [timelineData, setTimelineData] = useState<any>(null)
  const [viewType, setViewType] = useState<ViewType>("month")
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addItemType, setAddItemType] = useState<"milestone" | "ball" | "task">("milestone")
  const [stakeholders, setStakeholders] = useState<string[]>(["上司", "クライアント", "チーム", "部門"])
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedStakeholder, setSelectedStakeholder] = useState<string>("")
  const [isEditStakeholderDialogOpen, setIsEditStakeholderDialogOpen] = useState(false)
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false)

  useEffect(() => {
    // ローカルストレージからプロジェクトを取得
    const storedProjectsJSON = localStorage.getItem("projects")
    let projectData = null

    if (storedProjectsJSON) {
      try {
        const storedProjects = JSON.parse(storedProjectsJSON)
        // プロジェクトIDに一致するプロジェクトを探す
        if (storedProjects[projectId]) {
          projectData = storedProjects[projectId]
        }
      } catch (error) {
        console.error("プロジェクトデータの読み込みに失敗しました:", error)
      }
    }

    // ローカルストレージにプロジェクトがない場合はモックデータを使用
    if (!projectData && mockProjects[projectId as keyof typeof mockProjects]) {
      projectData = mockProjects[projectId as keyof typeof mockProjects]
    }

    setProject(projectData)
    setTimelineData(mockTimelineData)
  }, [projectId])

  // 関係者が削除された後にボールデータを更新する
  useEffect(() => {
    if (timelineData) {
      // 存在しない関係者に関連するボールをフィルタリング
      const validBalls = timelineData.balls.filter((ball: any) => stakeholders.includes(ball.stakeholder))

      // ボールデータが変更された場合のみ更新
      if (validBalls.length !== timelineData.balls.length) {
        setTimelineData({
          ...timelineData,
          balls: validBalls,
        })
      }
    }
  }, [stakeholders, timelineData])

  if (!project || !timelineData) {
    return <div className="container p-8">Loading...</div>
  }

  const handlePrevious = () => {
    const newDate = new Date(currentDate)
    if (viewType === "project") {
      // No change for project view
    } else if (viewType === "year") {
      newDate.setFullYear(newDate.getFullYear() - 1)
    } else if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (viewType === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else if (viewType === "day") {
      newDate.setDate(newDate.getDate() - 1)
    }
    setCurrentDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (viewType === "project") {
      // No change for project view
    } else if (viewType === "year") {
      newDate.setFullYear(newDate.getFullYear() + 1)
    } else if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (viewType === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else if (viewType === "day") {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  const openAddDialog = (type: "milestone" | "ball" | "task") => {
    setAddItemType(type)
    setIsAddDialogOpen(true)
  }

  const handleAddItem = (item: any) => {
    // In a real app, this would save to Supabase
    // For now, we'll just update the local state
    if (item.type === "milestone") {
      setTimelineData({
        ...timelineData,
        milestones: [...timelineData.milestones, item],
      })
    } else if (item.type === "ball") {
      setTimelineData({
        ...timelineData,
        balls: [...timelineData.balls, item],
      })
    } else if (item.type === "task") {
      setTimelineData({
        ...timelineData,
        tasks: [...timelineData.tasks, item],
      })
    }
  }

  const handleAddStakeholder = (stakeholder: string) => {
    if (!stakeholders.includes(stakeholder)) {
      setStakeholders([...stakeholders, stakeholder])
    }
  }

  const handleItemMove = (item: any, newDate: Date) => {
    // Update the item's date
    const updatedItem = { ...item, date: newDate.toISOString() }

    // Update the appropriate array in timelineData
    if (item.type === "milestone") {
      const updatedMilestones = timelineData.milestones.map((m: any) => (m.id === item.id ? updatedItem : m))
      setTimelineData({
        ...timelineData,
        milestones: updatedMilestones,
      })
    } else if (item.type === "ball") {
      const updatedBalls = timelineData.balls.map((b: any) => (b.id === item.id ? updatedItem : b))
      setTimelineData({
        ...timelineData,
        balls: updatedBalls,
      })
    } else if (item.type === "task") {
      const updatedTasks = timelineData.tasks.map((t: any) => (t.id === item.id ? updatedItem : t))
      setTimelineData({
        ...timelineData,
        tasks: updatedTasks,
      })
    }

    toast({
      title: "項目を移動しました",
      description: `${item.title}の日付を${formatDate(newDate.toISOString())}に変更しました`,
    })
  }

  const handleEditItem = (item: any) => {
    setSelectedItem(item)
    setIsEditDialogOpen(true)
  }

  const handleUpdateItem = (updatedItem: any) => {
    // Update the appropriate array in timelineData
    if (updatedItem.type === "milestone") {
      const updatedMilestones = timelineData.milestones.map((m: any) => (m.id === updatedItem.id ? updatedItem : m))
      setTimelineData({
        ...timelineData,
        milestones: updatedMilestones,
      })
    } else if (updatedItem.type === "ball") {
      const updatedBalls = timelineData.balls.map((b: any) => (b.id === updatedItem.id ? updatedItem : b))
      setTimelineData({
        ...timelineData,
        balls: updatedBalls,
      })
    } else if (updatedItem.type === "task") {
      const updatedTasks = timelineData.tasks.map((t: any) => (t.id === updatedItem.id ? updatedItem : t))
      setTimelineData({
        ...timelineData,
        tasks: updatedTasks,
      })
    }
  }

  const handleDeleteItem = (item: any) => {
    // Remove the item from the appropriate array
    if (item.type === "milestone") {
      const updatedMilestones = timelineData.milestones.filter((m: any) => m.id !== item.id)
      setTimelineData({
        ...timelineData,
        milestones: updatedMilestones,
      })
    } else if (item.type === "ball") {
      const updatedBalls = timelineData.balls.filter((b: any) => b.id !== item.id)
      setTimelineData({
        ...timelineData,
        balls: updatedBalls,
      })
    } else if (item.type === "task") {
      const updatedTasks = timelineData.tasks.filter((t: any) => t.id !== item.id)
      setTimelineData({
        ...timelineData,
        tasks: updatedTasks,
      })
    }

    // アイテムが削除されたら選択状態をリセット
    setSelectedItem(null)
    setIsEditDialogOpen(false)
  }

  const handleEditStakeholder = (stakeholder: string) => {
    if (stakeholder && stakeholders.includes(stakeholder)) {
      setSelectedStakeholder(stakeholder)
      setIsEditStakeholderDialogOpen(true)
    }
  }

  const handleUpdateStakeholder = (oldStakeholder: string, newStakeholder: string) => {
    // Update stakeholder in the stakeholders array
    const updatedStakeholders = stakeholders.map((s) => (s === oldStakeholder ? newStakeholder : s))
    setStakeholders(updatedStakeholders)

    // Update stakeholder in all balls
    const updatedBalls = timelineData.balls.map((ball: any) => {
      if (ball.stakeholder === oldStakeholder) {
        return { ...ball, stakeholder: newStakeholder }
      }
      return ball
    })

    setTimelineData({
      ...timelineData,
      balls: updatedBalls,
    })

    // 更新後、選択されたステークホルダーも更新
    setSelectedStakeholder(newStakeholder)
  }

  const handleDeleteStakeholder = (stakeholder: string) => {
    // Remove stakeholder from the stakeholders array
    const updatedStakeholders = stakeholders.filter((s) => s !== stakeholder)
    setStakeholders(updatedStakeholders)

    // 選択状態をリセット
    setSelectedStakeholder("")
    setIsEditStakeholderDialogOpen(false)

    toast({
      title: "関係者を削除しました",
      description: `「${stakeholder}」が削除されました`,
    })
  }

  const handleUpdateProject = (updatedProject: any) => {
    // ローカルストレージから既存のプロジェクトを取得
    const storedProjectsJSON = localStorage.getItem("projects")
    let storedProjects = {}

    if (storedProjectsJSON) {
      try {
        storedProjects = JSON.parse(storedProjectsJSON)
      } catch (error) {
        console.error("プロジェクトデータの読み込みに失敗しました:", error)
      }
    }

    // プロジェクトを更新
    const updatedProjects = {
      ...storedProjects,
      [updatedProject.id]: updatedProject,
    }

    // ローカルストレージに保存
    localStorage.setItem("projects", JSON.stringify(updatedProjects))

    // 状態を更新
    setProject(updatedProject)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ProjectHeader project={project} onEditClick={() => setIsEditProjectDialogOpen(true)} />

      <main className="flex-1 container px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">
                {viewType === "project" && "プロジェクト全体"}
                {viewType === "year" && currentDate.getFullYear()}
                {viewType === "month" && `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`}
                {viewType === "week" && `${formatDate(currentDate.toISOString())} 週`}
                {viewType === "day" && formatDate(currentDate.toISOString())}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Tabs value={viewType} onValueChange={(v) => setViewType(v as ViewType)} className="w-auto">
              <TabsList>
                <TabsTrigger value="project">全体</TabsTrigger>
                <TabsTrigger value="year">年</TabsTrigger>
                <TabsTrigger value="month">月</TabsTrigger>
                <TabsTrigger value="week">週</TabsTrigger>
                <TabsTrigger value="day">日</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openAddDialog("milestone")}>
                <Plus className="mr-1 h-4 w-4" />
                マイルストーン
              </Button>
              <Button variant="outline" size="sm" onClick={() => openAddDialog("ball")}>
                <Plus className="mr-1 h-4 w-4" />
                ボール
              </Button>
              <Button variant="outline" size="sm" onClick={() => openAddDialog("task")}>
                <Plus className="mr-1 h-4 w-4" />
                タスク
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <VisualTimeline
          data={timelineData}
          viewType={viewType}
          currentDate={currentDate}
          projectStartDate={new Date(project.startDate)}
          projectEndDate={new Date(project.endDate)}
          onItemMove={handleItemMove}
          stakeholders={stakeholders}
          onEditItem={handleEditItem}
          onEditStakeholder={handleEditStakeholder}
        />
      </main>

      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        itemType={addItemType}
        onAdd={handleAddItem}
        projectStartDate={new Date(project.startDate)}
        projectEndDate={new Date(project.endDate)}
        stakeholders={stakeholders}
        onAddStakeholder={handleAddStakeholder}
        viewType={viewType}
      />

      {selectedItem && (
        <EditItemDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          item={selectedItem}
          onUpdate={handleUpdateItem}
          onDelete={handleDeleteItem}
          projectStartDate={new Date(project.startDate)}
          projectEndDate={new Date(project.endDate)}
          stakeholders={stakeholders}
          onAddStakeholder={handleAddStakeholder}
          viewType={viewType}
        />
      )}

      {selectedStakeholder && (
        <EditStakeholderDialog
          open={isEditStakeholderDialogOpen}
          onOpenChange={setIsEditStakeholderDialogOpen}
          stakeholder={selectedStakeholder}
          stakeholders={stakeholders}
          onUpdate={handleUpdateStakeholder}
          onDelete={handleDeleteStakeholder}
        />
      )}

      <EditProjectDialog
        open={isEditProjectDialogOpen}
        onOpenChange={setIsEditProjectDialogOpen}
        project={project}
        onUpdate={handleUpdateProject}
      />
    </div>
  )
}
