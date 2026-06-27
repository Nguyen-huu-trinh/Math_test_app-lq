import { GraduationCap, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExamCard } from "@/components/exam-card"
import { CreateExamMenu } from "@/components/create-exam-menu"
import { getExams, getResultCountForExam, getTopResultsForExam } from "@/lib/data"
import { logout } from "@/app/actions/auth"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const exams = await getExams()
  const examsWithResults = await Promise.all(
    exams.map(async (exam) => ({
      exam,
      results: await getTopResultsForExam(exam.id, 5),
      resultCount: await getResultCountForExam(exam.id),
    })),
  )

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Quản lý đề thi Toán
              </h1>
              <p className="text-xs text-muted-foreground">
                Định dạng đề mới của Bộ GD&amp;ĐT
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CreateExamMenu />
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut />
                Đăng xuất
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {examsWithResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-4 py-16 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <GraduationCap className="size-7" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Chưa có đề thi nào</h2>
            <p className="mb-5 mt-1 max-w-sm text-sm text-muted-foreground">
              Bắt đầu bằng cách tạo đề thi đầu tiên: tải lên file PDF và nhập phiếu đáp án mẫu.
            </p>
            <CreateExamMenu align="left" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {examsWithResults.map(({ exam, results, resultCount }) => (
              <ExamCard key={exam.id} exam={exam} results={results} resultCount={resultCount} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
