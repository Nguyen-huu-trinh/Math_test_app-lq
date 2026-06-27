"use client"

import { cn } from "@/lib/utils"
import {
  type AnswerSheet,
  type Part1Choice,
  PART2_SUB_COUNT,
  PART3_MAX_CHARS,
  getAnswerSheetStructure,
  totalScoringUnits,
} from "@/lib/types"

const PART1_OPTIONS: Exclude<Part1Choice, null>[] = ["A", "B", "C", "D"]
const PART2_LABELS = ["a", "b", "c", "d"]
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

interface AnswerSheetFormProps {
  value: AnswerSheet
  onChange?: (value: AnswerSheet) => void
  disabled?: boolean
}

function Bubble({
  label,
  selected,
  onClick,
  disabled,
  size = "md",
}: {
  label: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
  size?: "sm" | "md"
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border font-semibold transition-colors",
        size === "md" ? "size-8 text-sm" : "size-6 text-xs",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground",
        !disabled && !selected && "hover:border-primary/60 hover:bg-accent",
        disabled && "cursor-default",
      )}
    >
      {label}
    </button>
  )
}

function SectionTitle({ no, title, points }: { no: string; title: string; points: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-2 border-b border-border pb-2">
      <h3 className="text-sm font-bold text-foreground sm:text-base">
        <span className="mr-1 text-primary">{no}.</span>
        {title}
      </h3>
      <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
        {points}
      </span>
    </div>
  )
}

export function AnswerSheetForm({ value, onChange, disabled }: AnswerSheetFormProps) {
  const emit = (next: AnswerSheet) => onChange?.(next)
  const structure = getAnswerSheetStructure(value)
  const totalUnits = totalScoringUnits(structure)
  const unitScore = totalUnits > 0 ? 10 / totalUnits : 0
  const isCustom = value.examType === "custom"
  const part1Points = isCustom
    ? `${(structure.multipleChoiceCount * unitScore).toFixed(2).replace(/0$/u, "").replace(/\.$/u, "")} điểm`
    : "3 điểm"
  const part2Points = isCustom
    ? `${(structure.trueFalseCount * PART2_SUB_COUNT * unitScore).toFixed(2).replace(/0$/u, "").replace(/\.$/u, "")} điểm`
    : "4 điểm"
  const part3Points = isCustom
    ? `${(structure.shortAnswerCount * unitScore).toFixed(2).replace(/0$/u, "").replace(/\.$/u, "")} điểm`
    : "3 điểm"

  const setPart1 = (q: number, choice: Exclude<Part1Choice, null>) => {
    if (disabled) return
    const part1 = [...value.part1]
    part1[q] = part1[q] === choice ? null : choice
    emit({ ...value, part1 })
  }

  const setPart2 = (q: number, sub: number, choice: boolean) => {
    if (disabled) return
    const part2 = value.part2.map((row) => [...row])
    part2[q][sub] = part2[q][sub] === choice ? null : choice
    emit({ ...value, part2 })
  }

  const setPart3 = (q: number, col: number, char: string) => {
    if (disabled) return
    const part3 = value.part3.map((row) => [...row])
    part3[q][col] = part3[q][col] === char ? "" : char
    emit({ ...value, part3 })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* PHẦN I */}
      <section className="rounded-xl border border-border bg-card p-4">
        <SectionTitle
          no="PHẦN I"
          title={`Trắc nghiệm nhiều lựa chọn (${structure.multipleChoiceCount} câu)`}
          points={part1Points}
        />
        <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {Array.from({ length: structure.multipleChoiceCount }).map((_, q) => (
            <div key={q} className="flex items-center gap-3 rounded-lg px-1 py-1">
              <span className="w-6 shrink-0 text-right text-sm font-bold tabular-nums text-foreground">
                {q + 1}
              </span>
              <div className="flex gap-2">
                {PART1_OPTIONS.map((opt) => (
                  <Bubble
                    key={opt}
                    label={opt}
                    selected={value.part1[q] === opt}
                    onClick={() => setPart1(q, opt)}
                    disabled={disabled}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PHẦN II */}
      <section className="rounded-xl border border-border bg-card p-4">
        <SectionTitle
          no="PHẦN II"
          title={`Trắc nghiệm Đúng / Sai (${structure.trueFalseCount} câu)`}
          points={part2Points}
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: structure.trueFalseCount }).map((_, q) => (
            <div key={q} className="rounded-lg border border-border p-3">
              <p className="mb-2 text-sm font-semibold text-foreground">Câu {q + 1}</p>
              <div className="flex flex-col gap-2">
                {Array.from({ length: PART2_SUB_COUNT }).map((_, sub) => (
                  <div key={sub} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">Ý {PART2_LABELS[sub]})</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={disabled}
                        aria-pressed={value.part2[q][sub] === true}
                        onClick={() => setPart2(q, sub, true)}
                        className={cn(
                          "rounded-md border px-3 py-1 text-xs font-semibold transition-colors",
                          value.part2[q][sub] === true
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:bg-accent",
                          disabled && "cursor-default",
                        )}
                      >
                        Đúng
                      </button>
                      <button
                        type="button"
                        disabled={disabled}
                        aria-pressed={value.part2[q][sub] === false}
                        onClick={() => setPart2(q, sub, false)}
                        className={cn(
                          "rounded-md border px-3 py-1 text-xs font-semibold transition-colors",
                          value.part2[q][sub] === false
                            ? "border-destructive bg-destructive/15 text-destructive"
                            : "border-border bg-card text-muted-foreground hover:bg-accent",
                          disabled && "cursor-default",
                        )}
                      >
                        Sai
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PHẦN III */}
      <section className="rounded-xl border border-border bg-card p-4">
        <SectionTitle
          no="PHẦN III"
          title={`Trả lời ngắn / Điền đáp số (${structure.shortAnswerCount} câu)`}
          points={part3Points}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: structure.shortAnswerCount }).map((_, q) => (
            <div key={q} className="rounded-lg border border-border p-3">
              <p className="mb-2 text-sm font-semibold text-foreground">Câu {q + 1}</p>
              <div className="flex gap-2">
                {Array.from({ length: PART3_MAX_CHARS }).map((_, col) => {
                  const special = col === 0 ? "-" : col === 1 ? "," : null
                  const current = value.part3[q]?.[col] ?? ""
                  return (
                    <div key={col} className="flex flex-1 flex-col items-center gap-1">
                      {/* ô hiển thị ký tự đã chọn */}
                      <div
                        className={cn(
                          "flex h-7 w-full items-center justify-center rounded-md border text-sm font-bold",
                          current
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-dashed border-border text-muted-foreground/40",
                        )}
                      >
                        {current || "·"}
                      </div>
                      {special && (
                        <Bubble
                          label={special}
                          size="sm"
                          selected={current === special}
                          onClick={() => setPart3(q, col, special)}
                          disabled={disabled}
                        />
                      )}
                      {!special && <div className="h-6" aria-hidden />}
                      {DIGITS.map((d) => (
                        <Bubble
                          key={d}
                          label={d}
                          size="sm"
                          selected={current === d}
                          onClick={() => setPart3(q, col, d)}
                          disabled={disabled}
                        />
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
