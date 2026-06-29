import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatTileProps {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: "green" | "amber" | "red" | "blue"
}

const TONES: Record<string, string> = {
  green: "border-l-[#00A651] text-[#00A651]",
  amber: "border-l-[#B8860B] text-[#B8860B]",
  red: "border-l-[#8B2500] text-[#8B2500]",
  blue: "border-l-[#0072CE] text-[#0072CE]",
}

export function StatTile({ label, value, icon: Icon, tone = "green" }: StatTileProps) {
  return (
    <Card className={cn("flex flex-row items-start justify-between border-l-4 p-5", TONES[tone])}>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-4xl font-bold tracking-tight text-foreground">{value}</span>
      </div>
      <span className={cn("flex size-10 items-center justify-center rounded-lg")}>
        <Icon className="size-5" />
      </span>
    </Card>
  )
}
