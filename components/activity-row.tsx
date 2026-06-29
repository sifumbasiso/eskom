import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ActivityEntry } from "@/lib/cems-data"

const DOT: Record<ActivityEntry["tone"], string> = {
  create: "bg-[#00A651]",
  edit: "bg-[#B8860B]",
  delete: "bg-[#8B2500]",
  login: "bg-[#0072CE]",
}

export function ActivityRow({ entry }: { entry: ActivityEntry }) {
  return (
    <div className="flex items-start gap-3 border-b border-border py-3 last:border-0">
      <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", DOT[entry.tone])} aria-hidden="true" />
      <div className="flex-1">
        <p className="font-mono text-sm font-semibold text-foreground">{entry.action}</p>
        <p className="text-xs text-muted-foreground">
          by {entry.actor} — {entry.description}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground">
          {entry.date} {entry.time}
        </span>
        <Badge variant="outline" className="text-[0.65rem]">
          {entry.type}
        </Badge>
      </div>
    </div>
  )
}
