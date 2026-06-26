"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  AlertTriangle,
  Clock,
  FileText,
  GraduationCap,
  ListChecks,
  Loader2,
  Play,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AnswerSheetForm } from "@/components/answer-sheet"
import { AnswerKeyDisplay } from "@/components/answer-key-display"
import { submitExam } from "@/app/actions/exams"
import { cn } from "@/lib/utils"
import { emptyAnswerSheet, type AnswerSheet } from "@/lib/types"
import type { GradeBreakdown } from "@/lib/grading"

interface ExamRunnerProps {
  examId: string
  title: string
  pdfUrl: string
  durationMinutes: number
}

type Phase = "intro" | "running" | "submitted"

function fmt(totalSeconds: number) {
  const s = Math.max(0, totalSeconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

function PdfViewer({ url }: { url: string }) {
  return (
    <iframe
      src={`${url}#toolbar=1&view=FitH`}
      title="Đề thi PDF"
      className="h-full w-full border-0 bg-muted"
    />
  )
}

export function ExamRunner({ examId, title, pdfUrl, durationMinutes }: ExamRunnerProps) {
  const [phase, setPhase] = useState<Phase>("intro")
  const [studentName, setStudentName] = useState("")
  const [answers, setAnswers] = useState<AnswerSheet>(emptyAnswerSheet())
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60)
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [mobileView, setMobileView] = useState<"pdf" | "sheet">("pdf")

  // kết quả sau khi nộp
  const [result, setResult] = useState<{ breakdown: GradeBreakdown; answerKey: AnswerSheet } | null>(
    null,
  )

  const deadlineRef = useRef<number | null>(null)
  const submittedRef = useRef(false)

  const doSubmit = useCallback(
    async (auto: boolean) => {
      if (submittedRef.current) return
      submittedRef.current = true
      setSubmitting(true)
      try {
        const res = await submitExam({ examId, studentName, answers })
        setResult(res)
        setPhase("submitted")
        setMobileView("sheet")
        if (auto) toast.info("Đã hết giờ — bài thi được tự động nộp")
        else toast.success("Nộp bài thành công")
      } catch (err) {
        console.error("[v0] submit error", err)
        toast.error("Nộp bài thất bại, vui lòng thử lại")
        submittedRef.current = false
      } finally {
        setSubmitting(false)
        setConfirmOpen(false)
      }
    },
    [answers, examId, studentName],
  )

  // Đồng hồ đếm ngược
  useEffect(() => {
    if (phase !== "running") return
    if (deadlineRef.current == null) {
      deadlineRef.current = Date.now() + durationMinutes * 60 * 1000
    }
    const tick = () => {
      const remaining = Math.round((deadlineRef.current! - Date.now()) / 1000)
      setSecondsLeft(remaining)
      if (remaining <= 0) {
        void doSubmit(true)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [phase, durationMinutes, doSubmit])

  function startExam() {
    if (!studentName.trim()) {
      toast.error("Vui lòng nhập họ và tên")
      return
    }
    setPhase("running")
  }

  // ----- INTRO -----
  if (phase === "intro") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex flex-col items-center text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-7" />
            </div>
            <h1 className="text-balance text-xl font-bold text-foreground">{title}</h1>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-4" />
              Thời gian làm bài: {durationMinutes} phút
            </p>
          </div>

          <div className="mb-4 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Lưu ý trước khi làm bài:</p>
            <ul className="list-inside list-disc space-y-0.5">
              <li>Đồng hồ bắt đầu chạy ngay khi bấm &quot;Bắt đầu làm bài&quot;.</li>
              <li>Bài sẽ tự động nộp khi hết thời gian.</li>
            </ul>
          </div>

          <div className="mb-5">
            <Label htmlFor="name">Họ và tên học sinh</Label>
            <Input
              id="name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startExam()}
              placeholder="Nhập họ và tên của bạn"
              className="mt-1.5"
              autoFocus
            />
          </div>

          <Button size="lg" className="w-full" onClick={startExam}>
            <Play />
            Bắt đầu làm bài
          </Button>
        </div>
      </main>
    )
  }

  const submitted = phase === "submitted"
  const lowTime = secondsLeft <= 300 && !submitted

  // ----- RUNNING / SUBMITTED (split screen) -----
  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="size-5 shrink-0 text-primary" />
          <span className="truncate text-sm font-semibold text-foreground">{title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {!submitted ? (
            <>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-sm font-bold tabular-nums",
                  lowTime
                    ? "bg-destructive/15 text-destructive"
                    : "bg-primary/15 text-foreground",
                )}
              >
                <Clock className="size-4" />
                {fmt(secondsLeft)}
              </span>
              <Button size="sm" onClick={() => setConfirmOpen(true)} disabled={submitting}>
                <Send />
                Nộp bài
              </Button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-2.5 py-1 text-sm font-bold text-foreground">
              <GraduationCap className="size-4" />
              {result ? `${result.breakdown.total} điểm` : "Đã nộp"}
            </span>
          )}
        </div>
      </header>

      {/* Split content */}
      <div className="flex min-h-0 flex-1">
        {/* Left: PDF */}
        <div
          className={cn(
            "min-h-0 flex-1 md:block md:w-1/2 md:flex-none md:border-r md:border-border",
            mobileView === "pdf" ? "block" : "hidden",
          )}
        >
          <PdfViewer url={pdfUrl} />
        </div>

        {/* Right: answer sheet OR results */}
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto md:block md:w-1/2 md:flex-none",
            mobileView === "sheet" ? "block" : "hidden",
          )}
        >
          <div className="p-3 sm:p-4">
            {submitted && result ? (
              <ResultsPanel result={result} answers={answers} studentName={studentName} />
            ) : (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <ListChecks className="size-5 text-primary" />
                  <h2 className="font-bold text-foreground">Phiếu trả lời</h2>
                </div>
                <AnswerSheetForm value={answers} onChange={setAnswers} disabled={submitting} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileView((v) => (v === "pdf" ? "sheet" : "pdf"))}
        className="fixed bottom-4 right-4 z-20 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg md:hidden"
      >
        {mobileView === "pdf" ? (
          <>
            <ListChecks className="size-4" />
            {submitted ? "Xem kết quả" : "Phiếu đáp án"}
          </>
        ) : (
          <>
            <FileText className="size-4" />
            Xem đề thi
          </>
        )}
      </button>

      {/* Confirm submit dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-primary" />
              Xác nhận nộp bài
            </DialogTitle>
            <DialogDescription>
              Sau khi nộp, bạn sẽ không thể chỉnh sửa đáp án. Bạn có chắc chắn muốn nộp bài?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Tiếp tục làm</DialogClose>
            <Button onClick={() => doSubmit(false)} disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              Nộp bài
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

function ScoreRow({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums text-foreground">
        {value} <span className="text-xs font-normal text-muted-foreground">/ {max}</span>
      </span>
    </div>
  )
}

function ResultsPanel({
  result,
  answers,
  studentName,
}: {
  result: { breakdown: GradeBreakdown; answerKey: AnswerSheet }
  answers: AnswerSheet
  studentName: string
}) {
  const { breakdown, answerKey } = result
  return (
    <div className="flex flex-col gap-5">
      {/* Bảng điểm */}
      <div className="rounded-xl border border-border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">{studentName}</p>
        <p className="mt-1 text-5xl font-extrabold tabular-nums text-primary">
          {breakdown.total}
        </p>
        <p className="text-sm text-muted-foreground">/ 10 điểm</p>
        <div className="mt-4 text-left">
          <ScoreRow label="Phần I (Trắc nghiệm)" value={breakdown.part1} max={3} />
          <ScoreRow label="Phần II (Đúng/Sai)" value={breakdown.part2} max={4} />
          <ScoreRow label="Phần III (Điền đáp số)" value={breakdown.part3} max={3} />
        </div>
      </div>

      {/* Đáp án chi tiết để đối chiếu */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 font-bold text-foreground">Đáp án chi tiết</h3>
        <AnswerKeyDisplay answerKey={answerKey} student={answers} />
      </div>
    </div>
  )
}
