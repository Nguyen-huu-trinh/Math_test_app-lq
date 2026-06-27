"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Plus, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CreateExamMenu({ align = "right" }: { align?: "left" | "right" }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <Button type="button" onClick={() => setOpen((value) => !value)}>
        <Plus />
        Thêm đề thi mới
      </Button>
      {open ? (
        <div
          className={`absolute top-full z-20 mt-2 w-64 rounded-lg border border-border bg-card p-1 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <Link
            href="/create"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <FileText className="size-4 text-primary" />
            Đề thi theo bộ giáo dục
          </Link>
          <Link
            href="/create/custom"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <Settings2 className="size-4 text-primary" />
            Đề thi tự do
          </Link>
        </div>
      ) : null}
    </div>
  )
}
