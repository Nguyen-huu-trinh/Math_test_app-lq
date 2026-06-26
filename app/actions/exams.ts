"use server"

import { db } from "@/lib/db"
import { exams, results } from "@/lib/db/schema"
import { gradeAnswers, type GradeBreakdown } from "@/lib/grading"
import type { AnswerSheet } from "@/lib/types"
import { del } from "@vercel/blob"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function createExam(input: {
  title: string
  pdfUrl: string
  durationMinutes: number
  answerKey: AnswerSheet
}): Promise<{ id: string }> {
  const title = input.title.trim() || "Đề thi không tên"
  const [row] = await db
    .insert(exams)
    .values({
      title,
      pdfUrl: input.pdfUrl,
      durationMinutes: input.durationMinutes || 90,
      answerKey: input.answerKey,
    })
    .returning({ id: exams.id })

  revalidatePath("/")
  return { id: row.id }
}

export async function updateAnswerKey(examId: string, answerKey: AnswerSheet): Promise<void> {
  await db.update(exams).set({ answerKey }).where(eq(exams.id, examId))
  revalidatePath("/")
}

export async function deleteExam(examId: string): Promise<void> {
  // Lấy PDF url để xóa khỏi Blob, tiết kiệm dung lượng
  const [row] = await db
    .select({ pdfUrl: exams.pdfUrl })
    .from(exams)
    .where(eq(exams.id, examId))
    .limit(1)

  await db.delete(results).where(eq(results.examId, examId))
  await db.delete(exams).where(eq(exams.id, examId))

  if (row?.pdfUrl) {
    try {
      await del(row.pdfUrl)
    } catch {
      // PDF có thể đã bị xóa — bỏ qua
    }
  }

  revalidatePath("/")
}

export async function submitExam(input: {
  examId: string
  studentName: string
  answers: AnswerSheet
}): Promise<{ breakdown: GradeBreakdown; answerKey: AnswerSheet }> {
  const [exam] = await db
    .select({ answerKey: exams.answerKey })
    .from(exams)
    .where(eq(exams.id, input.examId))
    .limit(1)

  if (!exam) throw new Error("Không tìm thấy đề thi")

  const breakdown = gradeAnswers(exam.answerKey, input.answers)

  await db.insert(results).values({
    examId: input.examId,
    studentName: input.studentName.trim() || "Học sinh ẩn danh",
    score: breakdown.total,
    answers: input.answers,
  })

  revalidatePath("/")
  return { breakdown, answerKey: exam.answerKey }
}
