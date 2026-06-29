import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { HouseholdStatus } from "@/lib/app-context"

const LABELS: Record<HouseholdStatus, string> = {
  authenticated: "Authenticated",
  pending: "Pending",
  flagged: "Flagged",
}

const STYLES: Record<HouseholdStatus, string> = {
  authenticated: "bg-[#E6F4EA] text-[#00A651] border border-[#00A651]",
  pending: "bg-[#FFF8E1] text-[#B8860B] border border-[#B8860B]",
  flagged: "bg-[#FDECEA] text-[#8B2500] border border-[#8B2500]",
}

export function StatusBadge({ status, className }: { status: HouseholdStatus; className?: string }) {
  return (
    <Badge className={cn("rounded-full px-2.5 py-0.5 font-medium", STYLES[status], className)}>
      {LABELS[status]}
    </Badge>
  )
}

export function StatusDot({ status }: { status: HouseholdStatus }) {
  const tone =
    status === "authenticated" ? "bg-[#00A651]" : status === "pending" ? "bg-[#B8860B]" : "bg-[#8B2500]"
  return <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", tone)} aria-hidden="true" />
}
