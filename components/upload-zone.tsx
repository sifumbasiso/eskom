"use client"

import { useState } from "react"
import { Camera, Check, ScanFace } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  label: string
  hint?: string
  variant?: "id" | "selfie"
  uploaded: boolean
  onUpload: () => void
}

export function UploadZone({ label, hint, variant = "id", uploaded, onUpload }: UploadZoneProps) {
  const [hover, setHover] = useState(false)
  const Icon = variant === "selfie" ? ScanFace : Camera

  return (
    <button
      type="button"
      onClick={onUpload}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
        variant === "selfie" ? "min-h-40" : "min-h-32",
        uploaded
          ? "border-[#00A651] bg-[#E6F4EA]"
          : hover
            ? "border-[#1A4FA0]/60 bg-[#F4F6FB]"
            : "border-[#D6E0F0] bg-[#F4F6FB]/40",
      )}
    >
      {uploaded ? (
        <>
          <span className="flex size-10 items-center justify-center rounded-full bg-[#00A651]">
            <Check className="size-5 text-white" />
          </span>
          <span className="text-sm font-medium text-[#00A651]">{label} uploaded</span>
          <span className="text-xs text-muted-foreground">Tap to replace</span>
        </>
      ) : (
        <>
          <Icon className="size-7 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{label}</span>
          {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
        </>
      )}
    </button>
  )
}
