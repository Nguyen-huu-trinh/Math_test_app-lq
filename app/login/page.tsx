import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginTeacher } from "@/app/actions/auth"
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth"
import { Lock, User } from "lucide-react"

export const metadata = {
  title: "Đăng nhập",
}

type LoginPageProps = {
  searchParams?: Promise<{ error?: string | string[] }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (token && (await verifyToken(token))) {
    redirect("/")
  }

  const resolvedSearchParams = await searchParams
  const rawError = resolvedSearchParams?.error
  const error = Array.isArray(rawError) ? rawError[0] : rawError
  const errorMessage =
    error === "invalid"
      ? "Tên đăng nhập hoặc mật khẩu không đúng"
      : error === "missing"
      ? "Vui lòng điền đầy đủ thông tin"
      : undefined

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Giáo viên
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Đăng nhập</h1>
          <p className="text-sm text-muted-foreground">
            Sử dụng tài khoản giáo viên để truy cập dashboard và quản lý đề thi.
          </p>
        </div>

        {errorMessage ? (
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <form action={loginTeacher} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập</Label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
              <User className="size-5 text-muted-foreground" />
              <Input
                id="username"
                name="username"
                autoComplete="username"
                placeholder="Username"
                className="border-0 bg-transparent p-0 focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
              <Lock className="size-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="border-0 bg-transparent p-0 focus-visible:ring-0"
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Đăng nhập
          </Button>
        </form>
      </div>
    </main>
  )
}
