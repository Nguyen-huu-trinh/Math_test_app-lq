"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { upload } from "@vercel/blob/client"
import { toast } from "sonner"
import { ArrowLeft, FileText, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AnswerSheetForm } from "@/components/answer-sheet"
import { createExam } from "@/app/actions/exams"
import { emptyAnswerSheet, type AnswerSheet, DEFAULT_DURATION } from "@/lib/types"

export function CreateExamForm() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState(DEFAULT_DURATION)
  const [file, setFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [answerKey, setAnswerKey] = useState<AnswerSheet>(emptyAnswerSheet())

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== "application/pdf") {
      toast.error("Vui lòng chọn file PDF")
      return
    }
    setFile(f)
    setUploading(true)
    try {
      const blob = await upload(f.name, f, {
        access: "public",
        handleUploadUrl: "/api/upload",
      })
      setPdfUrl(blob.url)
      toast.success("Tải lên đề thi PDF thành công")
    } catch (err) {
      console.error("[v0] upload error", err)
      toast.error("Tải lên thất bại, vui lòng thử lại")
      setFile(null)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên đề thi")
      return
    }
    if (!pdfUrl) {
      toast.error("Vui lòng tải lên file đề thi PDF")
      return
    }
    setSubmitting(true)
    try {
      await createExam({ title, pdfUrl, durationMinutes: duration, answerKey })
      toast.success("Tạo đề thi thành công")
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error("[v0] create exam error", err)
      toast.error("Có lỗi xảy ra khi tạo đề thi")
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Quay lại"
          render={<Link href="/" />}
        >
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tạo đề thi mới</h1>
          <p className="text-sm text-muted-foreground">
            Tải lên đề PDF và nhập phiếu đáp án mẫu theo định dạng mới của Bộ GD&amp;ĐT.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Thông tin chung */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Tên đề thi</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Kiểm tra giữa kỳ Toán 12"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="duration">Thời gian (phút)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label>File đề thi (PDF)</Label>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-1.5 flex w-full items-center gap-3 rounded-lg border border-dashed border-border bg-background px-4 py-4 text-left transition-colors hover:border-primary/60 hover:bg-accent disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="size-5 animate-spin text-primary" />
              ) : pdfUrl ? (
                <FileText className="size-5 text-primary" />
              ) : (
                <Upload className="size-5 text-muted-foreground" />
              )}
              <span className="text-sm">
                {uploading
                  ? "Đang tải lên..."
                  : file
                    ? file.name
                    : "Nhấn để chọn file PDF đề thi"}
              </span>
            </button>
          </div>
        </div>

        {/* Phiếu đáp án mẫu */}
        <div>
          <h2 className="mb-3 text-lg font-bold text-foreground">Phiếu đáp án mẫu (Key)</h2>
          <AnswerSheetForm value={answerKey} onChange={setAnswerKey} />
        </div>

        <div className="sticky bottom-4 flex justify-end">
          <Button size="lg" onClick={handleSubmit} disabled={submitting || uploading}>
            {submitting && <Loader2 className="animate-spin" />}
            Tạo đề thi thành công
          </Button>
        </div>
      </div>
    </div>
  )
}
