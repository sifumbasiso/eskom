"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { EskomLogo } from "@/components/eskom-logo"
import { useAppContext } from "@/lib/app-context"

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function AdminRegisterPage() {
  const router = useRouter()
  const { state, addUser, addAuditEntry, showToast, generateAdminId } = useAppContext()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [cellphone, setCellphone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [employeeNumber, setEmployeeNumber] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const emailValid = useMemo(() => validateEmail(email), [email])
  const passwordValid = useMemo(() => password.length >= 6, [password])
  const confirmValid = useMemo(() => password === confirmPassword, [password, confirmPassword])
  const cellphoneValid = useMemo(() => /^[0-9]{9,15}$/.test(cellphone), [cellphone])
  const emailUnique = useMemo(
    () => !state.users.some((user) => user.email.toLowerCase() === email.toLowerCase()),
    [email, state.users]
  )

  const canSubmit =
    fullName.trim().length > 1 &&
    emailValid &&
    emailUnique &&
    cellphoneValid &&
    passwordValid &&
    confirmValid &&
    employeeNumber.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!canSubmit) return

    const adminId = generateAdminId()
    const today = new Date().toISOString().split("T")[0]

    addUser({
      id: adminId,
      name: fullName.trim(),
      email: email.trim(),
      password,
      role: "admin",
      status: "pending",
      assignedProject: null,
      registeredAt: today,
      employeeNumber: employeeNumber.trim(),
      cellphone: cellphone.trim(),
    })

    addAuditEntry({
      action: "coordinator_registered",
      performedBy: fullName.trim(),
      description: `New coordinator registration: ${fullName.trim()} (${email.trim()}) — awaiting approval`,
      timestamp: new Date().toLocaleString("en-ZA"),
      type: "Registration",
    })

    showToast("Coordinator registration submitted", "success")
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="min-h-dvh bg-background px-4 py-10">
        <div className="mx-auto w-full max-w-md">
          <Card>
            <CardContent className="flex flex-col items-center gap-6 p-10 text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FEF3C7] text-[#B45309]">
                <Clock className="size-10" />
              </span>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Registration Submitted</h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  Your account is pending approval from the Root Administrator. You will not be able to log in until your account is approved.
                </p>
              </div>
              <Button variant="default" size="lg" nativeButton={false} render={<Link href="/">Back to Login</Link>}>
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <EskomLogo className="h-12" />
            <h1 className="mt-4 text-2xl font-semibold text-foreground">Register as Project Coordinator</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Submit your details for approval by the Root Administrator.
            </p>
          </div>
          <Button variant="outline" nativeButton={false} render={<Link href="/">Back to Login</Link>}>
            Back to Login
          </Button>
        </div>

        <Card>
          <CardContent className="grid gap-6 p-8">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Sarah Mokoena" />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@eskom.co.za" />
                  {!emailValid && email && (
                    <span className="text-xs text-[#8B2500]">Enter a valid email address.</span>
                  )}
                  {emailValid && !emailUnique && (
                    <span className="text-xs text-[#8B2500]">This email is already registered.</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cellphone">Cellphone Number</Label>
                  <Input id="cellphone" value={cellphone} onChange={(e) => setCellphone(e.target.value)} placeholder="0712345678" />
                  {!cellphoneValid && cellphone && (
                    <span className="text-xs text-[#8B2500]">Enter a valid cellphone number.</span>
                  )}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                  {!passwordValid && password && (
                    <span className="text-xs text-[#8B2500]">Password must be at least 6 characters.</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                  {!confirmValid && confirmPassword && (
                    <span className="text-xs text-[#8B2500]">Passwords must match.</span>
                  )}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="employeeNumber">Employee / Staff Number</Label>
                  <Input id="employeeNumber" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} placeholder="EMP-004" />
                </div>
                <div className="flex items-end">
                  <Button type="submit" size="lg" variant="default" className="w-full" disabled={!canSubmit}>
                    Register
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
