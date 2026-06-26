import {
  type AnswerSheet,
  PART1_COUNT,
  PART2_COUNT,
  PART3_COUNT,
  part3ToString,
} from "./types"

export interface GradeBreakdown {
  part1: number
  part2: number
  part3: number
  total: number
}

// Phần II: điểm theo số ý đúng trong 1 câu
function part2QuestionScore(correctCount: number): number {
  switch (correctCount) {
    case 1:
      return 0.1
    case 2:
      return 0.25
    case 3:
      return 0.5
    case 4:
      return 1
    default:
      return 0
  }
}

function normalizePart3(cols: string[]): string {
  // Ghép các cột thành chuỗi, bỏ khoảng trắng để so sánh chính xác
  return part3ToString(cols).replace(/\s+/g, "").trim()
}

export function gradeAnswers(key: AnswerSheet, student: AnswerSheet): GradeBreakdown {
  // Phần I: mỗi câu đúng 0.25đ (tối đa 3đ)
  let part1 = 0
  for (let i = 0; i < PART1_COUNT; i++) {
    if (student.part1?.[i] != null && student.part1[i] === key.part1?.[i]) {
      part1 += 0.25
    }
  }

  // Phần II: chấm độc lập từng câu lớn theo số ý đúng (tối đa 4đ)
  let part2 = 0
  for (let q = 0; q < PART2_COUNT; q++) {
    let correct = 0
    for (let sub = 0; sub < 4; sub++) {
      const k = key.part2?.[q]?.[sub]
      const s = student.part2?.[q]?.[sub]
      if (s != null && s === k) correct++
    }
    part2 += part2QuestionScore(correct)
  }

  // Phần III: đối chiếu chính xác chuỗi, mỗi câu đúng 0.5đ (tối đa 3đ)
  let part3 = 0
  for (let i = 0; i < PART3_COUNT; i++) {
    const k = normalizePart3(key.part3?.[i] ?? [])
    const s = normalizePart3(student.part3?.[i] ?? [])
    if (k.length > 0 && k === s) {
      part3 += 0.5
    }
  }

  const round = (n: number) => Math.round(n * 100) / 100
  part1 = round(part1)
  part2 = round(part2)
  part3 = round(part3)

  return {
    part1,
    part2,
    part3,
    total: round(part1 + part2 + part3),
  }
}
