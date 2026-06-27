import "server-only"
import { db } from "@/lib/db"
import { exams, results } from "@/lib/db/schema"
import { desc, eq, sql } from "drizzle-orm"
import { getAnswerSheetStructure, type Exam, type ExamResult } from "@/lib/types"

function toExam(row: typeof exams.$inferSelect): Exam {
  const examType = row.answerKey.examType ?? "standard"
  return {
    id: row.id,
    title: row.title,
    pdfUrl: row.pdfUrl,
    durationMinutes: row.durationMinutes,
    examType,
    customStructure: getAnswerSheetStructure(row.answerKey),
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

export async function getTopResultsForExam(examId: string, limit = 5): Promise<ExamResult[]> {
  const rows = await db
    .select()
    .from(results)
    .where(eq(results.examId, examId))
    .orderBy(desc(results.score), desc(results.submittedAt))
    .limit(limit)
  return rows.map(toResult)
}

export async function getResultCountForExam(examId: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`count(*)` })
    .from(results)
    .where(eq(results.examId, examId))

  return Number(row?.total ?? 0)
}
