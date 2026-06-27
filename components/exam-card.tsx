"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  FileText,
  Link2,
  Loader2,
  Pencil,
  Trash2,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { deleteExam, updateAnswerKey } from "@/app/actions/exams"
import { exportResultsToExcel } from "@/app/actions/export-results"
import type { Exam, ExamResult, AnswerSheet } from "@/lib/types"

function formatScore(n: number) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2).replace(/0$/, "")
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ExamCard({
  exam,
  results,
  resultCount,
}: {
  exam: Exam
  results: ExamResult[]
  resultCount: number
}) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [resultsOpen, setResultsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [draftKey, setDraftKey] = useState<AnswerSheet>(exam.answerKey)
  const [saving, startSaving] = useTransition()
  const [deleting, startDeleting] = useTransition()
  const [exporting, startExporting] = useTransition()

  function copyLink() {
    const url = `${window.location.origin}/exam/${exam.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      toast.success("Đã sao chép link làm bài")
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function saveKey() {
    startSaving(async () => {
      try {
        await updateAnswerKey(exam.id, draftKey)
        toast.success("Đã cập nhật đáp án mẫu")
        setEditOpen(false)
        router.refresh()
      } catch {
        toast.error("Lưu đáp án thất bại")
      }
    })
  }

  function confirmDelete() {
    startDeleting(async () => {
      try {
        await deleteExam(exam.id)
        toast.success("Đã xóa đề thi")
        setDeleteOpen(false)
        router.refresh()
      } catch {
        toast.error("Xóa đề thi thất bại")
      }
    })
  }

  function downloadExcel() {
    startExporting(async () => {
      try {
        const file = await exportResultsToExcel(exam.id)
        const binary = window.atob(file.base64)
        const bytes = new Uint8Array(binary.length)

        for (let index = 0; index < binary.length; index += 1) {
          bytes[index] = binary.charCodeAt(index)
        }

        const url = URL.createObjectURL(new Blob([bytes], { type: file.contentType }))
        const link = document.createElement("a")
        link.href = url
        link.download = file.filename
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
      } catch {
        toast.error("Không thể tải file Excel")
      }
    })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-foreground">{exam.title}</h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" /> {exam.durationMinutes} phút
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" /> {resultCount} lượt làm
              </span>
              <span>Tạo {formatTime(exam.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}>
            {copied ? <Check className="text-primary" /> : <Link2 />}
            Copy Link
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setDraftKey(exam.answerKey); setEditOpen(true) }}>
            <Pencil />
            Sửa đáp án
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 />
            Xóa đề thi
          </Button>
        </div>
      </div>

      {/* Bảng kết quả */}
      <div className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-foreground">
            Kết quả làm bài của học sinh
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-expanded={resultsOpen}
            onClick={() => setResultsOpen((open) => !open)}
          >
            {resultsOpen ? <ChevronUp /> : <ChevronDown />}
            Xem danh sách kết quả
          </Button>
        </div>

        {resultsOpen ? (
          <div className="mt-3 space-y-3">
            {resultCount === 0 ? (
              <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                Chưa có học sinh nào nộp bài.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium">Họ và tên</th>
                      <th className="px-3 py-2 text-right font-medium">Số điểm</th>
                      <th className="px-3 py-2 text-right font-medium">Thời gian nộp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={r.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 tabular-nums text-muted-foreground">{i + 1}</td>
                        <td className="px-3 py-2 font-medium text-foreground">{r.studentName}</td>
                        <td className="px-3 py-2 text-right">
                          <span className="inline-flex min-w-10 justify-center rounded-md bg-primary/15 px-2 py-0.5 font-bold tabular-nums text-foreground">
                            {formatScore(r.score)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                          {formatTime(r.submittedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={downloadExcel} disabled={exporting}>
                {exporting ? <Loader2 className="animate-spin" /> : <Download />}
                Tải file Excel toàn bộ kết quả
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Dialog sửa đáp án */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sửa đáp án — {exam.title}</DialogTitle>
            <DialogDescription>
              Thay đổi đáp án mẫu. Các bài đã chấm trước đó sẽ không tự cập nhật.
            </DialogDescription>
          </DialogHeader>
          <AnswerSheetForm value={draftKey} onChange={setDraftKey} />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Hủy</DialogClose>
            <Button onClick={saveKey} disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              Lưu đáp án
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa đề thi?</DialogTitle>
            <DialogDescription>
              Đề thi &quot;{exam.title}&quot; cùng toàn bộ kết quả và file PDF sẽ bị xóa vĩnh
              viễn. Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Hủy</DialogClose>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting && <Loader2 className="animate-spin" />}
              Xóa vĩnh viễn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
