import "server-only"
import { db } from "@/lib/db"
import { exams, results } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import type { Exam, ExamResult } from "@/lib/types"

function toExam(row: typeof exams.$inferSelect): Exam {
  return {
    id: row.id,
    title: row.title,
    pdfUrl: row.pdfUrl,
    durationMinutes: row.durationMinutes,
    answerKey: row.answerKey,
    createdAt: row.createdAt.toISOString(),
  }
}

function toResult(row: typeof results.$inferSelect): ExamResult {
  return {
    id: row.id,
    examId: row.examId,
    studentName: row.studentName,
    score: row.score,
    answers: row.answers,
    submittedAt: row.submittedAt.toISOString(),
  }
}

export async function getExams(): Promise<Exam[]> {
  const rows = await db.select().from(exams).orderBy(desc(exams.createdAt))
  return rows.map(toExam)
}

export async function getExam(id: string): Promise<Exam | null> {
  const rows = await db.select().from(exams).where(eq(exams.id, id)).limit(1)
  return rows[0] ? toExam(rows[0]) : null
}

// Kết quả sắp xếp theo điểm số giảm dần
export async function getResultsForExam(examId: string): Promise<ExamResult[]> {
  const rows = await db
    .select()
    .from(results)
    .where(eq(results.examId, examId))
    .orderBy(desc(results.score), desc(results.submittedAt))
  return rows.map(toResult)
}
