"use client"

import { Check, Flag } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/status-badge"
import type { Household } from "@/lib/app-context"

interface ProfileSheetProps {
  household: Household | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthenticate?: (household: Household) => void
  onFlag?: (household: Household) => void
}

export function ProfileSheet({ household, open, onOpenChange, onAuthenticate, onFlag }: ProfileSheetProps) {
  if (!household) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-[520px]">
        <SheetHeader className="border-b border-border">
          <div className="flex items-center justify-between gap-3 pr-8">
            <SheetTitle className="text-lg">{household.fullName}</SheetTitle>
            <StatusBadge status={household.status} />
          </div>
          <SheetDescription>Reference {household.refNo}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 p-4">
          {household.status === "authenticated" && household.authenticatedBy ? (
            <div className="rounded-lg bg-[#E6F4EA] px-4 py-3 text-sm text-[#00A651]">
              Authenticated by {household.authenticatedBy} on {household.authenticatedAt}
            </div>
          ) : null}

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">ID Verification</h3>
            <div className="grid grid-cols-3 gap-3">
              {["ID Front", "ID Back", "Selfie"].map((label) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <div className="flex aspect-[3/4] items-center justify-center rounded-lg border border-border bg-muted text-xs text-muted-foreground">
                    Image
                  </div>
                  <span className="text-center text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Details</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Detail label="ID Number" value={household.idNumber} />
              <Detail label="Date of Birth" value={household.dob} />
              <Detail label="Gender" value={household.gender} />
              <Detail label="Cellphone" value={household.cellphone} />
              <Detail label="Alternative Number" value={household.altPhone || "-"} />
              <Detail label="Street Address" value={household.address} />
              <Detail label="Suburb" value={household.suburb} />
              <Detail label="Area / District" value={household.area} />
              <Detail label="Province" value={household.province || "-"} />
              <Detail label="Postal Code" value={household.postalCode || "-"} />
              <Detail label="Meter Number" value={household.meterNumber} />
              <Detail label="Submitted" value={household.submittedAt} />
            </dl>
          </section>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 border-t border-border p-4">
          <Button 
            className="flex-1" 
            disabled={household.status === "authenticated"}
            onClick={() => onAuthenticate?.(household)}
          >
            <Check data-icon="inline-start" />
            Authenticate
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => onFlag?.(household)}
          >
            <Flag data-icon="inline-start" />
            Flag for Review
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}
