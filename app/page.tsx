"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EskomLogo } from "@/components/eskom-logo"
import { BackgroundSlideshow } from "@/components/background-slideshow"
import { useAppContext } from "@/lib/app-context"

const ROLE_ROUTES: Record<string, string> = {
  general: "/register",
  admin: "/admin",
  root: "/root-admin",
}

const ROLE_LABELS: Record<string, string> = {
  general: "General User",
  admin: "Project Coordinator (Admin)",
  root: "Root Administrator",
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, showToast } = useAppContext()
  const [role, setRole] = useState("admin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(searchParams.get("error") ?? "")
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (role === "general") {
      router.push("/register")
      return
    }

    setIsLoading(true)
    const result = login(email, password, role)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error || "Invalid email or password")
      showToast(result.error || "Invalid email or password", "error")
      return
    }

    showToast(`Welcome! You're now logged in as ${ROLE_LABELS[role]}.`, "success")
    router.push(ROLE_ROUTES[role] ?? "/admin")
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center p-4 bg-[#F4F6FB]">
      <BackgroundSlideshow />

      <div className="relative w-full max-w-[420px] rounded-2xl overflow-hidden bg-card shadow-xl">
        {/* Gradient stripe at top */}
        <div className="h-1 bg-gradient-to-r from-[#1A4FA0] to-[#00A651]" />
        
        <div className="p-8 sm:p-10">
          <div className="mb-6 flex items-center justify-between gap-3">
            <EskomLogo className="h-12" />
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#00A651]">
              <span className="size-2 rounded-full bg-[#00A651]" aria-hidden="true" />
              System Online
            </span>
          </div>

          <div className="mb-7">
            <h1 className="text-lg font-semibold text-balance text-foreground">
              Community Electrification Management System
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              City of Cape Town — Electrification Programme
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">User Type</Label>
              <Select value={role} onValueChange={(value) => value !== null && setRole(value)}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select user type">
                    {(value: string) => ROLE_LABELS[value] ?? "Select user type"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General User</SelectItem>
                  <SelectItem value="admin">Project Coordinator (Admin)</SelectItem>
                  <SelectItem value="root">Root Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "admin" || role === "root" ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@eskom.co.za"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-[#FDECEA] px-3 py-2 text-sm text-[#8B2500]">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" className="mt-1 w-full" variant="gradient" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </>
            ) : (
              // General user: prompt to register as resident
              <Button type="button" size="lg" className="mt-1 w-full" variant="gradient" nativeButton={false} render={<Link href="/register" />}>
                Register as Resident
              </Button>
            )}
          </form>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <div className="flex flex-col gap-3 text-center">
            {role === "admin" && (
              <>
                <p className="text-sm text-muted-foreground">Don't have a coordinator account?</p>
                <Button variant="secondary" size="lg" className="w-full" nativeButton={false} render={<Link href="/admin-register" />}>
                  Register as Coordinator
                </Button>
              </>
            )}
            {role === "general" && (
              <p className="text-sm text-muted-foreground">Already registered? Use the sign in option above.</p>
            )}
            {role === "root" && (
              <p className="text-sm text-muted-foreground">Root Administrators must sign in to continue.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
