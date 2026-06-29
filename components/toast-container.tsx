"use client"

import { useAppContext } from "@/lib/app-context"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function ToastContainer() {
  const { state } = useAppContext()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {state.toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg animate-slide-up",
            toast.type === "success" && "bg-[#E6F4EA] text-[#00A651]",
            toast.type === "error" && "bg-[#FDECEA] text-[#8B2500]",
            toast.type === "warning" && "bg-[#FFF8E1] text-[#B8860B]",
            toast.type === "info" && "bg-[#E3F2FD] text-[#0072CE]"
          )}
        >
          {toast.type === "success" && <CheckCircle2 className="size-5 shrink-0 mt-0.5" />}
          {toast.type === "error" && <AlertCircle className="size-5 shrink-0 mt-0.5" />}
          {toast.type === "warning" && <AlertCircle className="size-5 shrink-0 mt-0.5" />}
          {toast.type === "info" && <Info className="size-5 shrink-0 mt-0.5" />}
          <div className="flex-1">{toast.message}</div>
        </div>
      ))}
    </div>
  )
}
