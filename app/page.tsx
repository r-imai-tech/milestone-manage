import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { ProjectList } from "@/components/project-list"
import { AuthButton } from "@/components/auth-button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">マイルストーン管理</h1>
          <AuthButton />
        </div>
      </header>
      <main className="container px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">プロジェクト一覧</h2>
            <p className="text-muted-foreground">
              タイムライン型のマイルストーン管理ツールでプロジェクトを効率的に管理しましょう
            </p>
          </div>
          <Link href="/projects/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新規プロジェクト
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ProjectList />

          {/* Quick start card */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>クイックスタート</CardTitle>
              <CardDescription>新しいプロジェクトを作成して始めましょう</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                プロジェクトの開始日・終了日を設定し、マイルストーンを追加することで、
                チーム全体の進捗を可視化できます。
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/projects/new" className="w-full">
                <Button className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  プロジェクト作成
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
