import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EskomLogo } from "@/components/eskom-logo"
import { useAppContext } from "@/lib/app-context"

interface TopNavProps {
  title: string
  subtitle?: string
  userLabel?: string
  showStatus?: boolean
}

export function TopNav({ title, subtitle, userLabel, showStatus = true }: TopNavProps) {
  const router = useRouter()
  const { state, logout, showToast } = useAppContext()

  function handleSignOut() {
    logout()
    showToast("You've been signed out", "info")
    router.push("/")
  }

  const displayUserLabel = userLabel || state.auth.user?.name || "User"

  return (
    <header className="border-b-0 bg-gradient-to-r from-[#1A4FA0] to-[#00A651] text-white">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <EskomLogo />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-white">{title}</span>
            {subtitle ? <span className="text-xs text-white/80">{subtitle}</span> : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showStatus ? (
            <span className="hidden items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white sm:flex">
              <span className="size-2 rounded-full bg-white" aria-hidden="true" />
              System Online
            </span>
          ) : null}

          {state.auth.user ? (
            <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 py-1 pl-1 pr-3">
              <Avatar className="size-7">
                <AvatarFallback className="bg-white text-xs text-[#1A4FA0] font-medium">
                  {displayUserLabel.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-white">{displayUserLabel}</span>
            </div>
          ) : null}

          {state.auth.isAuthenticated && (
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white text-white hover:bg-white/10" 
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
