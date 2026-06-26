import { type AnswerSheet, part3ToString, PART2_COUNT, PART3_COUNT } from "@/lib/types"
import { cn } from "@/lib/utils"

function tf(v: boolean | null) {
  if (v === true) return "Đúng"
  if (v === false) return "Sai"
  return "—"
}

interface AnswerKeyDisplayProps {
  answerKey: AnswerSheet
  student?: AnswerSheet
}

// Hiển thị đáp án chi tiết để đối chiếu. Nếu có `student`, tô màu đúng/sai.
export function AnswerKeyDisplay({ answerKey, student }: AnswerKeyDisplayProps) {
  return (
    <div className="flex flex-col gap-5 text-sm">
      <div>
        <p className="mb-2 font-bold text-foreground">Phần I</p>
        <div className="flex flex-wrap gap-1.5">
          {answerKey.part1.map((c, i) => {
            const ok = student ? student.part1[i] === c : undefined
            return (
              <span
                key={i}
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md border px-2 py-1 text-xs font-medium tabular-nums",
                  ok === undefined && "border-border bg-card",
                  ok === true && "border-primary bg-primary/15 text-foreground",
                  ok === false && "border-destructive/40 bg-destructive/10 text-destructive",
                )}
              >
                <span className="text-muted-foreground">{i + 1}</span>
                {c ?? "—"}
              </span>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 font-bold text-foreground">Phần II</p>
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: PART2_COUNT }).map((_, q) => (
            <div key={q} className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-muted-foreground">Câu {q + 1}:</span>
              {answerKey.part2[q].map((v, sub) => {
                const ok = student ? student.part2[q][sub] === v : undefined
                return (
                  <span
                    key={sub}
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-xs font-medium",
                      ok === undefined && "border-border bg-card",
                      ok === true && "border-primary bg-primary/15 text-foreground",
                      ok === false && "border-destructive/40 bg-destructive/10 text-destructive",
                    )}
                  >
                    {tf(v)}
                  </span>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-bold text-foreground">Phần III</p>
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: PART3_COUNT }).map((_, q) => {
            const keyStr = part3ToString(answerKey.part3[q]) || "—"
            const stuStr = student ? part3ToString(student.part3[q]) : undefined
            const ok = student ? part3ToString(answerKey.part3[q]) === stuStr : undefined
            return (
              <div key={q} className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-muted-foreground">Câu {q + 1}:</span>
                <span
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums",
                    ok === undefined && "border-border bg-card",
                    ok === true && "border-primary bg-primary/15 text-foreground",
                    ok === false && "border-destructive/40 bg-destructive/10 text-destructive",
                  )}
                >
                  {keyStr}
                </span>
                {student && ok === false && (
                  <span className="text-xs text-muted-foreground">
                    (em chọn: {stuStr || "—"})
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
