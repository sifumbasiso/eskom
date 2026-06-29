"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Clock, Download, Flag, Search, UserCheck } from "lucide-react"
import { TopNav } from "@/components/top-nav"
import { StatTile } from "@/components/stat-tile"
import { StatusBadge, StatusDot } from "@/components/status-badge"
import { ProfileSheet } from "@/components/profile-sheet"
import { ExportImportDialog } from "@/components/export-import-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAppContext, type Household, type HouseholdStatus } from "@/lib/app-context"
import { cn } from "@/lib/utils"

const FILTERS = ["All", "Pending", "Verified", "Flagged"] as const

export default function AdminDashboard() {
  const router = useRouter()
  const { state, updateHousehold, addAuditEntry, showToast } = useAppContext()
  const [selected, setSelected] = useState<Household | null>(null)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All")
  const [query, setQuery] = useState("")

  // Protect route
  useEffect(() => {
    if (!state.auth.isAuthenticated || state.auth.user?.role !== "admin") {
      router.push("/")
    }
  }, [state.auth.isAuthenticated, state.auth.user, router])

  const currentAdmin = state.auth.user ? state.users.find((user) => user.id === state.auth.user?.id) : null
  const assignedProject = currentAdmin?.assignedProject
    ? state.projects.find((project) => project.id === currentAdmin.assignedProject)
    : null

  const projectHouseholds = assignedProject
    ? state.households.filter((h) => h.projectId === assignedProject.id)
    : []

  const pending = projectHouseholds.filter((h) => h.status === "pending")
  const verified = projectHouseholds.filter((h) => h.status === "authenticated")
  const flagged = projectHouseholds.filter((h) => h.status === "flagged")

  const recent = useMemo(() => {
    let list = projectHouseholds
    if (filter !== "All") {
      const map: Record<string, HouseholdStatus> = {
        Pending: "pending",
        Verified: "authenticated",
        Flagged: "flagged",
      }
      list = list.filter((h) => h.status === map[filter])
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (h) =>
          h.idNumber.includes(q) ||
          h.meterNumber.toLowerCase().includes(q) ||
          h.fullName.toLowerCase().includes(q)
      )
    }
    return list
  }, [filter, query, projectHouseholds])

  function viewProfile(h: Household) {
    setSelected(h)
    setOpen(true)
  }

  function handleAuthenticate(household: Household) {
    if (household.status === "authenticated") {
      showToast("Profile is already authenticated", "info")
      return
    }

    const currentUser = state.auth.user
    if (!currentUser) return

    updateHousehold(household.id, {
      status: "authenticated",
      authenticatedBy: currentUser.name,
      authenticatedAt: new Date().toLocaleString("en-ZA"),
    })

    addAuditEntry({
      action: "households_authenticated",
      performedBy: currentUser.name,
      description: `Authenticated household ${household.id} (${household.fullName})`,
      timestamp: new Date().toLocaleString("en-ZA"),
      type: "Assignment",
    })

    showToast("Profile authenticated successfully", "success")
    setOpen(false)
    setSelected(null)
  }

  function handleFlag(household: Household) {
    const currentUser = state.auth.user
    if (!currentUser) return

    updateHousehold(household.id, {
      status: "flagged",
    })

    addAuditEntry({
      action: "households_flagged",
      performedBy: currentUser.name,
      description: `Flagged household ${household.id} (${household.fullName}) for review`,
      timestamp: new Date().toLocaleString("en-ZA"),
      type: "Assignment",
    })

    showToast("Profile flagged for review", "warning")
    setOpen(false)
    setSelected(null)
  }

  if (!state.auth.isAuthenticated || state.auth.user?.role !== "admin") {
    return null
  }

  return (
    <main className="min-h-dvh bg-background">
      <TopNav
        title="CEMS | Project Coordinator"
        subtitle={
          assignedProject
            ? `CEMS | Project Coordinator — ${assignedProject.name}`
            : "CEMS | Project Coordinator — No Project Assigned"
        }
      />

      <Tabs defaultValue="overview" className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
        <TabsList className="mb-6 flex w-full justify-start gap-1 overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="households">Households</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verified ({verified.length})
          </TabsTrigger>
          <TabsTrigger value="flagged">
            Flagged ({flagged.length})
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Project</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedProject ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3 rounded-xl border border-border bg-muted p-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Project Name</p>
                      <p className="text-lg font-semibold text-foreground">{assignedProject.name}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Area</p>
                        <p className="text-sm font-medium text-foreground">{assignedProject.area}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Year</p>
                        <p className="text-sm font-medium text-foreground">{assignedProject.year}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Target Households</p>
                        <p className="text-sm font-medium text-foreground">{assignedProject.target}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Registered</p>
                        <p className="text-sm font-medium text-foreground">{assignedProject.registered}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Installed</p>
                        <p className="text-sm font-medium text-foreground">{assignedProject.installed}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="text-sm font-medium text-foreground">{assignedProject.status}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-muted p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-muted-foreground">Progress</p>
                      <p className="text-sm font-semibold text-foreground">
                        {assignedProject.target
                          ? `${Math.round((assignedProject.installed / assignedProject.target) * 100)}%`
                          : "0%"}
                      </p>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full bg-[#00A651]"
                        style={{ width: `${Math.min(
                          assignedProject.target
                            ? Math.round((assignedProject.installed / assignedProject.target) * 100)
                            : 0,
                          100
                        )}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted px-6 py-10 text-center">
                  <p className="text-sm font-semibold text-foreground">No project has been assigned to you yet.</p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Please contact your Root Administrator.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile label="Pending Verification" value={pending.length} icon={Clock} tone="amber" />
            <StatTile label="Verified Households" value={verified.length} icon={UserCheck} tone="green" />
            <StatTile label="Flagged for Review" value={flagged.length} icon={Flag} tone="red" />
          </div>

          <Card>
            <CardContent className="flex flex-col gap-2 py-5">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by ID Number or Meter Number..."
                    className="h-10 pl-9"
                  />
                </div>
                {assignedProject && (
                  <ExportImportDialog
                    label={
                      <>
                        <Download className="mr-2 size-4" />
                        Import Households
                      </>
                    }
                    variant="outline"
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground">Primary: ID Number &nbsp;|&nbsp; Fallback: Meter Number</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Recent Registrations</CardTitle>
              <div className="flex flex-wrap gap-1.5">
                {[...FILTERS, "Today"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f === "Today" ? "All" : (f as (typeof FILTERS)[number]))}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      filter === f
                        ? "bg-[#1A4FA0] text-white"
                        : "bg-[#F4F6FB] text-[#5A6A8A] hover:bg-[#E6F4EA]"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col">
              {recent.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No registrations match your filters.</p>
              ) : (
                recent.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => viewProfile(h)}
                    className="flex items-start gap-3 border-b border-border py-3 text-left last:border-0 hover:bg-muted/50"
                  >
                    <StatusDot status={h.status} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{h.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.idNumber} • Meter {h.meterNumber} • {h.area}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">{h.submittedAt}</span>
                      <StatusBadge status={h.status} />
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* HOUSEHOLDS */}
        <TabsContent value="households">
          <HouseholdsTable
            rows={projectHouseholds}
            onView={viewProfile}
            title="All Households"
            onAuthenticate={handleAuthenticate}
            onFlag={handleFlag}
          />
        </TabsContent>

        {/* PENDING */}
        <TabsContent value="pending">
          <HouseholdsTable
            rows={pending}
            onView={viewProfile}
            title="Pending Verification"
            onAuthenticate={handleAuthenticate}
            onFlag={handleFlag}
            showActions
          />
        </TabsContent>

        {/* VERIFIED */}
        <TabsContent value="verified">
          <HouseholdsTable
            rows={verified}
            onView={viewProfile}
            title="Verified Households"
            onAuthenticate={handleAuthenticate}
            onFlag={handleFlag}
          />
        </TabsContent>

        {/* FLAGGED */}
        <TabsContent value="flagged">
          <HouseholdsTable
            rows={flagged}
            onView={viewProfile}
            title="Flagged for Review"
            onAuthenticate={handleAuthenticate}
            onFlag={handleFlag}
          />
        </TabsContent>

        {/* REPORTS */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Exports</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-3">
              <p className="text-sm text-muted-foreground">
                Generate CSV and Excel exports of household records filtered by project, area, status, and date.
              </p>
              <ExportImportDialog
                label={
                  <>
                    <Download data-icon="inline-start" />
                    Open Export / Import
                  </>
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selected && (
        <ProfileSheet
          household={selected}
          open={open}
          onOpenChange={setOpen}
          onAuthenticate={() => handleAuthenticate(selected)}
          onFlag={() => handleFlag(selected)}
        />
      )}
    </main>
  )
}

function HouseholdsTable({
  rows,
  onView,
  title,
  onAuthenticate,
  onFlag,
  showActions,
}: {
  rows: Household[]
  onView: (h: Household) => void
  title: string
  onAuthenticate: (h: Household) => void
  onFlag: (h: Household) => void
  showActions?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <ExportImportDialog
          label={
            <>
              <Download data-icon="inline-start" />
              Export
            </>
          }
          variant="outline"
          size="sm"
        />
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>ID Number</TableHead>
              <TableHead>Meter No.</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((h, i) => (
                <TableRow key={h.id} className={cn(i % 2 === 1 && "bg-muted/40")}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium text-foreground">{h.fullName}</TableCell>
                  <TableCell className="font-mono text-xs">{h.idNumber}</TableCell>
                  <TableCell>{h.meterNumber}</TableCell>
                  <TableCell>{h.area}</TableCell>
                  <TableCell className="text-muted-foreground">{h.submittedAt}</TableCell>
                  <TableCell>
                    <StatusBadge status={h.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {showActions ? (
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="xs"
                          disabled={h.status === "authenticated"}
                          onClick={() => onAuthenticate(h)}
                        >
                          Authenticate
                        </Button>
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => onFlag(h)}
                        >
                          Flag
                        </Button>
                      </div>
                    ) : (
                      <Button size="xs" variant="outline" onClick={() => onView(h)}>
                        View Profile
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
          <span>Showing {rows.length} records</span>
        </div>
      </CardContent>
    </Card>
  )
}
