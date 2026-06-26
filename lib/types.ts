// Shared types for the math exam answer sheet (Bộ GD new format)

export const PART1_COUNT = 12 // Phần I: 12 câu trắc nghiệm A/B/C/D
export const PART2_COUNT = 4 // Phần II: 4 câu, mỗi câu 4 ý Đúng/Sai
export const PART2_SUB_COUNT = 4 // a, b, c, d
export const PART3_COUNT = 6 // Phần III: 6 câu điền đáp số
export const PART3_MAX_CHARS = 4 // tối đa 4 ký tự

export const DEFAULT_DURATION = 90 // phút

// Phần I: "A" | "B" | "C" | "D" hoặc null nếu chưa chọn
export type Part1Choice = "A" | "B" | "C" | "D" | null

// Phần II: mỗi ý là true (Đúng) | false (Sai) | null (chưa chọn)
export type Part2Choice = boolean | null

export interface AnswerSheet {
  // 12 phần tử
  part1: Part1Choice[]
  // 4 câu, mỗi câu 4 ý
  part2: Part2Choice[][]
  // 6 câu, mỗi câu 4 cột (ký tự "" nếu chưa chọn), ví dụ ["0", ",", "4", ""]
  part3: string[][]
}

// Ghép các cột của 1 câu Phần III thành chuỗi đáp án, ví dụ "0,4"
export function part3ToString(cols: string[]): string {
  return (cols ?? []).map((c) => c ?? "").join("")
}

export interface Exam {
  id: string
  title: string
  pdfUrl: string
  durationMinutes: number
  answerKey: AnswerSheet
  createdAt: string
}

export interface ExamResult {
  id: string
  examId: string
  studentName: string
  score: number
  answers: AnswerSheet
  submittedAt: string
}

export function emptyAnswerSheet(): AnswerSheet {
  return {
    part1: Array(PART1_COUNT).fill(null),
    part2: Array.from({ length: PART2_COUNT }, () => Array(PART2_SUB_COUNT).fill(null)),
    part3: Array.from({ length: PART3_COUNT }, () => Array(PART3_MAX_CHARS).fill("")),
  }
}
