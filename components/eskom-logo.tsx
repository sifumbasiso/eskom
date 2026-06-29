import { cn } from "@/lib/utils"

export function EskomLogo({ className }: { className?: string }) {
  return (
    <img
      src="/images/eskom-logo.png"
      alt="Eskom"
      className={cn("h-10 w-auto object-contain", className)}
    />
  )
}
