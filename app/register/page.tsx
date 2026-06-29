"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EskomLogo } from "@/components/eskom-logo"
import { UploadZone } from "@/components/upload-zone"
import { cn } from "@/lib/utils"
import { useAppContext } from "@/lib/app-context"

const STEPS = ["Identity Verification", "Personal & Contact Details", "Address & Meter Number", "Review & Submit"]

function validateSaId(id: string) {
  if (!/^\d{13}$/.test(id)) return false
  const digits = id.split("").map(Number)
  let sum = 0
  for (let i = 0; i < 12; i++) {
    if (i % 2 === 0) {
      sum += digits[i]
    } else {
      const d = digits[i] * 2
      sum += d > 9 ? d - 9 : d
    }
  }
  const check = (10 - (sum % 10)) % 10
  return check === digits[12]
}

function validateCellphone(phone: string) {
  return /^[0-9]{9}$/.test(phone)
}

function validateDob(value: string) {
  if (!value) return false
  const dob = new Date(value)
  if (Number.isNaN(dob.getTime())) return false

  const today = new Date()
  if (dob >= today) return false

  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  const dayDiff = today.getDate() - dob.getDate()
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--
  }

  return age >= 18
}

export default function RegisterPage() {
  const { state, addHousehold, generateHousehodId, addAuditEntry, showToast } = useAppContext()
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [refNumber, setRefNumber] = useState("")

  const [uploads, setUploads] = useState({ front: null, back: null, selfie: null })
  const [fullName, setFullName] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [cellphone, setCellphone] = useState("")
  const [address, setAddress] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("")
  const [altPhone, setAltPhone] = useState("")
  const [suburb, setSuburb] = useState("")
  const [area, setArea] = useState("")
  const [province, setProvince] = useState("Western Cape")
  const [postalCode, setPostalCode] = useState("")
  const [projectId, setProjectId] = useState("")
  const [meterNumber, setMeterNumber] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  const allUploaded = uploads.front && uploads.back && uploads.selfie
  const idValid = useMemo(() => validateSaId(idNumber), [idNumber])
  const cellphoneValid = useMemo(() => validateCellphone(cellphone), [cellphone])
  const altPhoneValid = useMemo(() => altPhone === "" || validateCellphone(altPhone), [altPhone])
  const dobValid = useMemo(() => validateDob(dob), [dob])
  const step2Valid =
    fullName.trim().length > 1 &&
    idValid &&
    cellphoneValid &&
    dobValid &&
    gender.trim().length > 0 &&
    altPhoneValid
  const step3Valid =
    address.trim() &&
    suburb.trim() &&
    area.trim() &&
    province.trim() &&
    /^\d{4}$/.test(postalCode) &&
    projectId &&
    meterNumber.trim()

  function canAdvance() {
    if (step === 0) return allUploaded
    if (step === 1) return step2Valid
    if (step === 2) return step3Valid
    return true
  }

  function handleUpload(type: "front" | "back" | "selfie") {
    // In a real app, this would handle file upload
    // For now, we'll just set a mock URL
    setUploads((u) => ({ ...u, [type]: `data:image/placeholder/${type}` }))
  }

  function handleSubmit() {
    const hhId = generateHousehodId()
    const ref = `REF-${new Date().getFullYear()}-${String(Math.random()).slice(2, 7).toUpperCase()}`
    
    const selectedProject = state.projects.find((p) => p.id === projectId)
    const projectName = selectedProject?.name || ""

    addHousehold({
      id: hhId,
      refNo: ref,
      fullName,
      idNumber,
      dob,
      gender,
      cellphone: `0${cellphone}`,
      altPhone: altPhone ? `0${altPhone}` : "",
      address,
      suburb,
      area,
      province,
      postalCode,
      meterNumber,
      projectId,
      projectName,
      status: "pending",
      submittedAt: new Date().toLocaleString("en-ZA"),
      authenticatedBy: null,
      authenticatedAt: "",
      idFront: uploads.front ? true : false,
      idBack: uploads.back ? true : false,
      selfie: uploads.selfie ? true : false,
      notes: "",
    })

    addAuditEntry({
      action: "registration_added",
      performedBy: "System",
      description: `New registration submitted by ${fullName} for project ${projectName}`,
      timestamp: new Date().toLocaleString("en-ZA"),
      type: "Registration",
    })

    showToast(`Registration submitted successfully. Reference: ${ref}`, "success")
    setRefNumber(ref)
    setSubmitted(true)
  }

  function handleRegisterAnother() {
    setStep(0)
    setSubmitted(false)
    setRefNumber("")
    setUploads({ front: null, back: null, selfie: null })
    setFullName("")
    setIdNumber("")
    setCellphone("")
    setDob("")
    setGender("")
    setAltPhone("")
    setAddress("")
    setSuburb("")
    setArea("")
    setProvince("Western Cape")
    setPostalCode("")
    setProjectId("")
    setMeterNumber("")
    setConfirmed(false)
  }

  if (submitted) {
    return (
      <main className="flex min-h-dvh flex-col bg-background">
        <RegHeader />
        <div className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="flex flex-col items-center gap-4 py-10">
              <span className="flex size-16 items-center justify-center rounded-full bg-[#E6F4EA]">
                <CheckCircle2 className="size-9 text-[#00A651]" />
              </span>
              <h2 className="text-xl font-semibold text-foreground">Registration Submitted</h2>
              <p className="text-pretty text-sm text-muted-foreground">
                Your details have been received. A Project Coordinator will verify your information.
              </p>
              <div className="rounded-lg bg-muted px-4 py-2">
                <p className="text-xs text-muted-foreground">Reference Number</p>
                <p className="font-mono text-base font-semibold text-foreground">{refNumber}</p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Button className="w-full" nativeButton={false} render={<Link href="/" />}>
                  Back to Home
                </Button>
                <Button variant="outline" className="w-full" onClick={handleRegisterAnother}>
                  Register Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <RegHeader />

      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        {/* Stepper */}
        <ol className="mb-8 flex flex-wrap items-center gap-2">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  i === step
                    ? "bg-[#1A4FA0] text-white"
                    : i < step
                      ? "bg-[#E6F4EA] text-[#00A651]"
                      : "bg-[#F4F6FB] text-[#5A6A8A]",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[0.7rem] font-bold",
                    i === step ? "bg-white/30" : i < step ? "bg-[#00A651] text-white" : "bg-[#1A1A2E]/10",
                  )}
                >
                  {i < step ? <Check className="size-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </span>
            </li>
          ))}
        </ol>

        <Card>
          <CardContent className="py-6">
            {step === 0 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Upload Your ID Document</h2>
                  <p className="text-sm text-muted-foreground">Provide clear photos to verify your identity.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <UploadZone
                    label="ID Front"
                    hint="Front of ID / Smart Card"
                    uploaded={!!uploads.front}
                    onUpload={() => handleUpload("front")}
                  />
                  <UploadZone
                    label="ID Back"
                    hint="Back of ID / Smart Card"
                    uploaded={!!uploads.back}
                    onUpload={() => handleUpload("back")}
                  />
                </div>
                <UploadZone
                  label="Take a Selfie"
                  hint="Hold your face clearly in frame"
                  variant="selfie"
                  uploaded={!!uploads.selfie}
                  onUpload={() => handleUpload("selfie")}
                />
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-5">
                <h2 className="text-base font-semibold text-foreground">Personal & Contact Details</h2>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fullName">Full Name (as per ID)</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nomsa Dlamini" />
                  {fullName && fullName.trim().length < 2 && (
                    <span className="text-xs text-[#8B2500]">Full name is required</span>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="idNumber">South African ID Number</Label>
                    <Input
                      id="idNumber"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, "").slice(0, 13))}
                      placeholder="13-digit ID number"
                      inputMode="numeric"
                      aria-invalid={idNumber.length === 13 && !idValid}
                    />
                    {idNumber.length > 0 && (
                      <span
                        className={cn(
                          "flex items-center gap-1 text-xs font-medium",
                          idValid ? "text-[#00A651]" : "text-[#8B2500]",
                        )}
                      >
                        {idValid ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                        {idValid ? "Valid SA ID" : "Invalid ID number"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      aria-invalid={dob.length > 0 && !dobValid}
                    />
                    {dob && !dobValid && (
                      <span className="text-xs text-[#8B2500]">Please enter a valid date of birth</span>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={(value) => value !== null && setGender(value)}>
                      <SelectTrigger id="gender" className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    {gender === "" && (
                      <span className="text-xs text-[#8B2500]">Gender is required</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cell">Cellphone Number</Label>
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 items-center rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground">
                        +27
                      </span>
                      <Input
                        id="cell"
                        value={cellphone}
                        onChange={(e) => setCellphone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                        placeholder="82 451 7723"
                        className="flex-1"
                        inputMode="numeric"
                        aria-invalid={cellphone.length === 9 && !cellphoneValid}
                      />
                    </div>
                    {cellphone.length === 9 && !cellphoneValid && (
                      <span className="text-xs text-[#8B2500]">Must start with 06, 07, or 08</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="altPhone">Alternative Number</Label>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 items-center rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground">
                      +27
                    </span>
                    <Input
                      id="altPhone"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                      placeholder="61 234 5678"
                      className="flex-1"
                      inputMode="numeric"
                      aria-invalid={altPhone.length === 9 && !altPhoneValid}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">Optional</span>
                  {altPhone.length === 9 && !altPhoneValid && (
                    <span className="text-xs text-[#8B2500]">Must start with 06, 07, or 08</span>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-5">
                <h2 className="text-base font-semibold text-foreground">Address & Meter Number</h2>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="12 Mew Way" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="suburb">Suburb</Label>
                    <Input id="suburb" value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="Khayelitsha" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="area">Area / District</Label>
                    <Select value={area} onValueChange={(value) => value !== null && setArea(value)}>
                      <SelectTrigger id="area" className="w-full">
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Khayelitsha Section A">Khayelitsha Section A</SelectItem>
                        <SelectItem value="Khayelitsha Section B">Khayelitsha Section B</SelectItem>
                        <SelectItem value="Khayelitsha Section C">Khayelitsha Section C</SelectItem>
                        <SelectItem value="Delft South">Delft South</SelectItem>
                        <SelectItem value="Delft North">Delft North</SelectItem>
                        <SelectItem value="Mitchells Plain East">Mitchells Plain East</SelectItem>
                        <SelectItem value="Mitchells Plain West">Mitchells Plain West</SelectItem>
                        <SelectItem value="Gugulethu">Gugulethu</SelectItem>
                        <SelectItem value="Langa">Langa</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="province">Province</Label>
                    <Select value={province} onValueChange={(value) => value !== null && setProvince(value)}>
                      <SelectTrigger id="province" className="w-full">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Western Cape">Western Cape</SelectItem>
                        <SelectItem value="Gauteng">Gauteng</SelectItem>
                        <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                        <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                        <SelectItem value="Limpopo">Limpopo</SelectItem>
                        <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                        <SelectItem value="North West">North West</SelectItem>
                        <SelectItem value="Free State">Free State</SelectItem>
                        <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="7784"
                      inputMode="numeric"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="project">Select Your Project</Label>
                  <Select value={projectId} onValueChange={(value) => value !== null && setProjectId(value)}>
                    <SelectTrigger id="project" className="w-full">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.projects.filter((p) => p.status === "active").map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — {p.area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {state.projects.filter((p) => p.status === "active").length === 0 && (
                    <span className="text-xs text-[#8B2500]">No active projects available</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="meter">Allocated Meter Number</Label>
                  <Input id="meter" value={meterNumber} onChange={(e) => setMeterNumber(e.target.value)} placeholder="CT-0412" />
                  <span className="text-xs text-muted-foreground">
                    This is the number printed on your installed meter box.
                  </span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-5">
                <h2 className="text-base font-semibold text-foreground">Review & Submit</h2>
                <div className="flex flex-wrap gap-3">
                  {["ID Front", "ID Back", "Selfie"].map((l) => (
                    <div
                      key={l}
                      className="flex size-20 flex-col items-center justify-center gap-1 rounded-lg bg-[#E6F4EA] text-center"
                    >
                      <Check className="size-4 text-[#00A651]" />
                      <span className="text-[0.65rem] font-medium text-[#00A651]">{l}</span>
                    </div>
                  ))}
                </div>
                <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  <ReviewRow label="Full Name" value={fullName} />
                  <ReviewRow label="ID Number" value={idNumber} />
                  <ReviewRow label="Date of Birth" value={dob} />
                  <ReviewRow label="Gender" value={gender} />
                  <ReviewRow label="Cellphone" value={cellphone ? `+27 ${cellphone}` : ""} />
                  <ReviewRow label="Alternative Number" value={altPhone ? `+27 ${altPhone}` : ""} />
                  <ReviewRow label="Street Address" value={address} />
                  <ReviewRow label="Suburb" value={suburb} />
                  <ReviewRow label="Area / District" value={area} />
                  <ReviewRow label="Province" value={province} />
                  <ReviewRow label="Postal Code" value={postalCode} />
                  <ReviewRow label="Meter Number" value={meterNumber} />
                  <ReviewRow label="Project Name" value={state.projects.find((p) => p.id === projectId)?.name || ""} />
                </dl>
                <Separator />
                <label className="flex items-start gap-3">
                  <Checkbox checked={confirmed} onCheckedChange={(c) => setConfirmed(c === true)} className="mt-0.5" />
                  <span className="text-sm text-foreground">
                    I confirm that all information above is correct and true.
                  </span>
                </label>
              </div>
            )}

            {/* Nav buttons */}
            <div className="mt-7 flex items-center justify-between gap-3">
              {step > 0 ? (
                <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft data-icon="inline-start" />
                  Back
                </Button>
              ) : (
                <Button variant="ghost" nativeButton={false} render={<Link href="/" />}>
                  Cancel
                </Button>
              )}

              {step < 3 ? (
                <Button disabled={!canAdvance()} onClick={() => setStep((s) => s + 1)}>
                  Next Step
                  <ArrowRight data-icon="inline-end" />
                </Button>
              ) : (
                <Button disabled={!confirmed} onClick={handleSubmit}>
                  Submit Registration
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function RegHeader() {
  return (
    <header className="border-b-0 bg-gradient-to-r from-[#1A4FA0] to-[#00A651] text-white">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <EskomLogo />
          <span className="text-sm font-semibold text-white">CEMS</span>
        </div>
        <span className="text-sm font-medium text-white/80">General User Registration</span>
        <div className="w-16" />
      </div>
    </header>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value || "—"}</dd>
    </div>
  )
}
