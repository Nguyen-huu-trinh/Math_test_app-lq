// Shared types for the math exam answer sheet (Bộ GD new format)

export const PART1_COUNT = 12 // Phần I: 12 câu trắc nghiệm A/B/C/D
export const PART2_COUNT = 4 // Phần II: 4 câu, mỗi câu 4 ý Đúng/Sai
export const PART2_SUB_COUNT = 4 // a, b, c, d
export const PART3_COUNT = 6 // Phần III: 6 câu điền đáp số
export const PART3_MAX_CHARS = 4 // tối đa 4 ký tự

export const DEFAULT_DURATION = 90 // phút

export type ExamType = "standard" | "custom"

export interface CustomExamStructure {
  multipleChoiceCount: number
  trueFalseCount: number
  shortAnswerCount: number
}

export const STANDARD_EXAM_STRUCTURE: CustomExamStructure = {
  multipleChoiceCount: PART1_COUNT,
  trueFalseCount: PART2_COUNT,
  shortAnswerCount: PART3_COUNT,
}

// Phần I: "A" | "B" | "C" | "D" hoặc null nếu chưa chọn
export type Part1Choice = "A" | "B" | "C" | "D" | null

// Phần II: mỗi ý là true (Đúng) | false (Sai) | null (chưa chọn)
export type Part2Choice = boolean | null

export interface AnswerSheet {
  examType?: ExamType
  customStructure?: CustomExamStructure
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
  examType: ExamType
  customStructure: CustomExamStructure
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

export function getAnswerSheetStructure(answerSheet?: Partial<AnswerSheet>): CustomExamStructure {
  return answerSheet?.customStructure ?? {
    multipleChoiceCount: answerSheet?.part1?.length ?? PART1_COUNT,
    trueFalseCount: answerSheet?.part2?.length ?? PART2_COUNT,
    shortAnswerCount: answerSheet?.part3?.length ?? PART3_COUNT,
  }
}

export function totalScoringUnits(structure: CustomExamStructure): number {
  return (
    structure.multipleChoiceCount +
    structure.trueFalseCount * PART2_SUB_COUNT +
    structure.shortAnswerCount
  )
}

export function emptyAnswerSheet(
  structure: CustomExamStructure = STANDARD_EXAM_STRUCTURE,
  examType: ExamType = "standard",
): AnswerSheet {
  return {
    examType,
    customStructure: structure,
    part1: Array(structure.multipleChoiceCount).fill(null),
    part2: Array.from({ length: structure.trueFalseCount }, () => Array(PART2_SUB_COUNT).fill(null)),
    part3: Array.from({ length: structure.shortAnswerCount }, () => Array(PART3_MAX_CHARS).fill("")),
  }
}
