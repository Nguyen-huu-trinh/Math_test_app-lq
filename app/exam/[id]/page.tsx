import { notFound } from "next/navigation"
import { getExam } from "@/lib/data"
import { ExamRunner } from "@/components/exam-runner"

export const dynamic = "force-dynamic"

export default async function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const exam = await getExam(id)
  if (!exam) notFound()

  return (
    <ExamRunner
      examId={exam.id}
      title={exam.title}
      pdfUrl={exam.pdfUrl}
      durationMinutes={exam.durationMinutes}
    />
  )
}
