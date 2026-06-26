import { jsonb, integer, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core"
import type { AnswerSheet } from "@/lib/types"

export const exams = pgTable("exams", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(90),
  answerKey: jsonb("answer_key").$type<AnswerSheet>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const results = pgTable("results", {
  id: uuid("id").primaryKey().defaultRandom(),
  examId: uuid("exam_id").notNull(),
  studentName: text("student_name").notNull(),
  score: real("score").notNull(),
  answers: jsonb("answers").$type<AnswerSheet>().notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
})

export type ExamRow = typeof exams.$inferSelect
export type ResultRow = typeof results.$inferSelect
