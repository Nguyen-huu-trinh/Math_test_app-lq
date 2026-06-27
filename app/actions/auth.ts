"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  AUTH_COOKIE_NAME,
  issueToken,
  validateTeacherCredentials,
} from "@/lib/auth"

export async function loginTeacher(formData: FormData) {
  const username = formData.get("username")
  const password = formData.get("password")

  if (typeof username !== "string" || typeof password !== "string") {
    redirect("/login?error=missing")
  }

  const teacher = await validateTeacherCredentials(username.trim(), password)
  if (!teacher) {
    redirect("/login?error=invalid")
  }

  const token = await issueToken({ username: teacher.username })
  const cookieStore = await cookies()
  console.log("[auth] login token:", token)

  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  redirect("/")
}

export async function logout() {
  const cookieStore = await cookies()

  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    maxAge: 0,
  })

  redirect("/login")
}
