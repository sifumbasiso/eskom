"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ActivitySquare, BarChart3, Users } from "lucide-react"
import { TopNav } from "@/components/top-nav"
import { StatTile } from "@/components/stat-tile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppContext, type Household, type Project, type User } from "@/lib/app-context"
import { generateCEMSFile } from "@/lib/cems-file"
import JSZip from "jszip"
import { cn } from "@/lib/utils"

type AuditType = "All" | "Logins" | "Registration" | "Edit" | "Delete" | "Add" | "Assignment" | "General" | "Pending" | "Reports"

type AdminFilter = "All" | "Pending" | "Active" | "Rejected / Suspended"

const AUDIT_FILTERS: AuditType[] = [
  "All",
  "Logins",
  "Registration",
  "Edit",
  "Delete",
  "Add",
  "Assignment",
  "General",
  "Pending",
  "Reports",
]

export default function RootAdminDashboard() {
  const router = useRouter()
  const { state, addProject, updateProject, updateUser, addAuditEntry, showToast, generateProjectId } = useAppContext()
  const [activeTab, setActiveTab] = useState<AuditType>("All")
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectYear, setNewProjectYear] = useState("2024")
  const [newProjectArea, setNewProjectArea] = useState("Khayelitsha")
  const [newProjectTarget, setNewProjectTarget] = useState("")
  const [newProjectAdmin, setNewProjectAdmin] = useState("unassigned")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedAssignmentAdmin, setSelectedAssignmentAdmin] = useState("unassigned")
  const [adminFilter, setAdminFilter] = useState<AdminFilter>("All")
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"reject" | "suspend" | null>(null)
  const [confirmAdmin, setConfirmAdmin] = useState<User | null>(null)
  const [formsProjectId, setFormsProjectId] = useState<string>(state.projects[0]?.id ?? "")

  // Protect route
  useEffect(() => {
    if (!state.auth.isAuthenticated || state.auth.user?.role !== "root") {
      router.push("/")
    }
  }, [state.auth.isAuthenticated, state.auth.user, router])

  const pending = state.households.filter((h) => h.status === "pending")
  const auditEntries = state.auditLog

  const filteredAuditLog = useMemo(() => {
    if (activeTab === "All") return auditEntries

    if (activeTab === "Assignment") {
      return auditEntries.filter((entry) =>
        entry.type === "Assignment" || entry.action.includes("project_created") || entry.action.includes("project_assigned")
      )
    }

    if (activeTab === "Reports") {
      return auditEntries.filter((entry) => entry.type === "Reports")
    }

    const typeMap: Record<string, string> = {
      Logins: "login",
      Registration: "registration",
      Edit: "edit",
      Delete: "delete",
      Add: "project_created",
      General: "general",
      Pending: "pending",
    }

    const searchType = typeMap[activeTab]
    return auditEntries.filter((entry) =>
      entry.action.includes(searchType) || entry.type.toLowerCase().includes(searchType)
    )
  }, [activeTab, auditEntries])

  const auditTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: auditEntries.length,
      Logins: auditEntries.filter((e) => e.action.includes("login")).length,
      Registration: auditEntries.filter((e) => e.action.includes("registration")).length,
      Edit: auditEntries.filter((e) => e.action.includes("edit")).length,
      Delete: auditEntries.filter((e) => e.action.includes("delete")).length,
      Add: auditEntries.filter((e) => e.action.includes("project_created")).length,
      Assignment: auditEntries.filter((e) => e.type === "Assignment" || e.action.includes("project_assigned")).length,
      General: auditEntries.filter((e) => e.type === "General").length,
      Pending: auditEntries.filter((e) => e.action.includes("pending")).length,
      Reports: auditEntries.filter((e) => e.type === "Reports").length,
    }
    return counts
  }, [auditEntries])

  const admins = useMemo(() => state.users.filter((user) => user.role === "admin"), [state.users])

  const currentRootName = state.auth.user?.name ?? "Root Administrator"

  const formsProject = useMemo(
    () => state.projects.find((project) => project.id === formsProjectId) ?? state.projects[0] ?? null,
    [formsProjectId, state.projects]
  )

  const authenticatedHouseholds = useMemo(() => {
    if (!formsProject) return []
    return state.households.filter(
      (household) => household.projectId === formsProject.id && household.status === "authenticated"
    )
  }, [formsProject, state.households])

  const authenticatedCount = authenticatedHouseholds.length
  const totalProjectHouseholds = useMemo(() => {
    if (!formsProject) return 0
    return state.households.filter((household) => household.projectId === formsProject.id).length
  }, [formsProject, state.households])

  const resetProjectForm = () => {
    setNewProjectName("")
    setNewProjectYear("2024")
    setNewProjectArea("Khayelitsha")
    setNewProjectTarget("")
    setNewProjectAdmin("unassigned")
  }

  const activeAdmins = useMemo(
    () => admins.filter((admin) => admin.status === "active"),
    [admins]
  )

  useEffect(() => {
    if (!formsProjectId && state.projects.length > 0) {
      setFormsProjectId(state.projects[0].id)
    }
  }, [formsProjectId, state.projects])

  const filteredAdmins = useMemo(() => {
    if (adminFilter === "All") return admins
    if (adminFilter === "Pending") return admins.filter((admin) => admin.status === "pending")
    if (adminFilter === "Active") return admins.filter((admin) => admin.status === "active")
    return admins.filter((admin) => admin.status === "rejected" || admin.status === "suspended")
  }, [adminFilter, admins])

  const pendingAdminCount = admins.filter((admin) => admin.status === "pending").length
  const activeAdminCount = admins.filter((admin) => admin.status === "active").length
  const suspendedRejectedCount = admins.filter(
    (admin) => admin.status === "rejected" || admin.status === "suspended"
  ).length

  const handleCreateProject = () => {
    if (!newProjectName.trim() || !newProjectArea || !newProjectTarget) {
      return
    }

    const projectId = generateProjectId()
    const selectedAdminId = newProjectAdmin === "unassigned" ? null : newProjectAdmin
    const project = {
      id: projectId,
      name: newProjectName.trim(),
      year: newProjectYear.trim(),
      area: newProjectArea,
      target: Number(newProjectTarget),
      registered: 0,
      installed: 0,
      status: "active" as const,
      assignedAdmin: selectedAdminId,
      createdAt: new Date().toISOString().split("T")[0],
    }

    if (selectedAdminId) {
      const currentAssignment = state.projects.find((p) => p.assignedAdmin === selectedAdminId)
      if (currentAssignment && currentAssignment.id !== projectId) {
        updateProject(currentAssignment.id, { assignedAdmin: null })
      }
      updateUser(selectedAdminId, { assignedProject: projectId })
    }

    addProject(project)

    addAuditEntry({
      action: "project_created",
      performedBy: currentRootName,
      description: `Created project: ${project.name} — assigned to ${
        selectedAdminId
          ? admins.find((admin) => admin.id === selectedAdminId)?.name ?? "Unknown"
          : "Unassigned"
      }`,
      timestamp: new Date().toLocaleString("en-ZA"),
      type: "Add",
    })

    showToast("Project created successfully", "success")
    resetProjectForm()
    setProjectDialogOpen(false)
  }

  const openAssignmentDialog = (project: Project) => {
    setSelectedProject(project)
    setSelectedAssignmentAdmin(project.assignedAdmin ?? "unassigned")
    setAssignmentDialogOpen(true)
  }

  const handleSaveAssignment = () => {
    if (!selectedProject) return

    const previousAdminId = selectedProject.assignedAdmin ?? null
    const newAdminId = selectedAssignmentAdmin === "unassigned" ? null : selectedAssignmentAdmin

    updateProject(selectedProject.id, { assignedAdmin: newAdminId })

    if (previousAdminId && previousAdminId !== newAdminId) {
      updateUser(previousAdminId, { assignedProject: null })
    }

    if (newAdminId) {
      updateUser(newAdminId, { assignedProject: selectedProject.id })
    }

    addAuditEntry({
      action: "project_assigned",
      performedBy: currentRootName,
      description:
        newAdminId === null
          ? `Unassigned project '${selectedProject.name}'`
          : `Assigned project '${selectedProject.name}' to ${
              admins.find((admin) => admin.id === newAdminId)?.name ?? "Unknown"
            }`,
      timestamp: new Date().toLocaleString("en-ZA"),
      type: "Assignment",
    })

    showToast("Project assignment updated", "success")
    setAssignmentDialogOpen(false)
    setSelectedProject(null)
  }

  const handleNewProjectAreaChange = (value: string | null) => {
    if (value !== null) setNewProjectArea(value)
  }

  const handleNewProjectAdminChange = (value: string | null) => {
    if (value !== null) setNewProjectAdmin(value)
  }

  const handleSelectedAssignmentAdminChange = (value: string | null) => {
    if (value !== null) setSelectedAssignmentAdmin(value)
  }

  const openConfirmModal = (admin: User, action: "reject" | "suspend") => {
    setConfirmAdmin(admin)
    setConfirmAction(action)
    setConfirmModalOpen(true)
  }

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = fileName
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const handleSingleCEMSDownload = async (household: Household) => {
    if (household.status !== "authenticated") {
      showToast(
        "This household must be authenticated by a Project Coordinator before a CEMS File can be generated.",
        "error"
      )
      return
    }

    if (!formsProject) {
      showToast("Unable to find project details for this household.", "error")
      return
    }

    const pdf = await generateCEMSFile(household, formsProject, {
      name: household.authenticatedBy ?? currentRootName,
    })

    const fileName = `CEMS_File_${household.refNo}_${household.fullName.replace(/\s+/g, "_")}.pdf`
    // use save when available
    try {
      pdf.save(fileName)
    } catch (e) {
      const blob = await pdf.output("blob")
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }

    addAuditEntry({
      action: "cems_file_generated",
      performedBy: currentRootName,
      description: `Generated CEMS File for ${household.fullName} (${household.refNo}) — project '${formsProject.name}'`,
      timestamp: new Date().toLocaleString("en-ZA"),
      type: "Reports",
    })

    showToast(`CEMS File generated for ${household.fullName}`, "success")
  }

  const handleGenerateAllCEMSFiles = async () => {
    if (!formsProject) {
      showToast("Select a project before generating files.", "error")
      return
    }

    if (authenticatedHouseholds.length === 0) {
      showToast("No authenticated households in this project to generate.", "info")
      return
    }

    if (authenticatedHouseholds.length === 1) {
      handleSingleCEMSDownload(authenticatedHouseholds[0])
      return
    }

    const zip = new JSZip()
    await Promise.all(
      authenticatedHouseholds.map(async (household) => {
        const pdf = await generateCEMSFile(household, formsProject, {
          name: household.authenticatedBy ?? currentRootName,
        })
        const blob = await pdf.output("blob")
        const fileName = `CEMS_File_${household.refNo}_${household.fullName.replace(/\s+/g, "_")}.pdf`
        zip.file(fileName, blob)
      })
    )

    const zipBlob = await zip.generateAsync({ type: "blob" })
    downloadBlob(zipBlob, `CEMS_Files_${formsProject.name.replace(/\s+/g, "_")}.zip`)

    authenticatedHouseholds.forEach((household) => {
      addAuditEntry({
        action: "cems_file_generated",
        performedBy: currentRootName,
        description: `Generated CEMS File for ${household.fullName} (${household.refNo}) — project '${formsProject.name}'`,
        timestamp: new Date().toLocaleString("en-ZA"),
        type: "Reports",
      })
    })

    showToast(`CEMS Files generated for ${authenticatedHouseholds.length} households`, "success")
  }

  const handleConfirmAction = () => {
    if (!confirmAdmin || !confirmAction) return

    const adminName = confirmAdmin.name
    const adminEmail = confirmAdmin.email

    if (confirmAction === "reject") {
      updateUser(confirmAdmin.id, { status: "rejected" })
      addAuditEntry({
        action: "coordinator_rejected",
        performedBy: currentRootName,
        description: `Rejected coordinator account: ${adminName} (${adminEmail})`,
        timestamp: new Date().toLocaleString("en-ZA"),
        type: "Delete",
      })
      showToast("Coordinator registration rejected", "error")
    }

    if (confirmAction === "suspend") {
      let description = `Suspended coordinator: ${adminName}`
      if (confirmAdmin.assignedProject) {
        const project = state.projects.find((p) => p.id === confirmAdmin.assignedProject)
        if (project) {
          updateProject(project.id, { assignedAdmin: null })
          description += ` — project '${project.name}' unassigned`
        }
      }
      updateUser(confirmAdmin.id, { status: "suspended", assignedProject: null })
      addAuditEntry({
        action: "coordinator_suspended",
        performedBy: currentRootName,
        description,
        timestamp: new Date().toLocaleString("en-ZA"),
        type: "Edit",
      })
      showToast("Coordinator suspended", "warning")
    }

    setConfirmModalOpen(false)
    setConfirmAdmin(null)
    setConfirmAction(null)
  }

  if (!state.auth.isAuthenticated || state.auth.user?.role !== "root") {
    return null
  }

  return (
    <main className="min-h-dvh bg-background">
      <TopNav title="CEMS | System Administrator" />

      <Tabs defaultValue="overview" className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
        <TabsList className="mb-6 flex w-full justify-start gap-1 overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile 
              label="Pending Requests" 
              value={pending.length} 
              icon={BarChart3} 
              tone="amber" 
            />
            <StatTile 
              label="Active Admins" 
              value={2} 
              icon={Users} 
              tone="blue" 
            />
            <StatTile 
              label="System Activities" 
              value={auditEntries.length} 
              icon={ActivitySquare} 
              tone="green" 
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Households Registered</span>
                <span className="font-semibold text-foreground">{state.households.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Verified Households</span>
                <span className="font-semibold text-[#00A651]">
                  {state.households.filter((h) => h.status === "authenticated").length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending Verification</span>
                <span className="font-semibold text-[#B8860B]">
                  {state.households.filter((h) => h.status === "pending").length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Flagged for Review</span>
                <span className="font-semibold text-[#8B2500]">
                  {state.households.filter((h) => h.status === "flagged").length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latest System Activities</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              {auditEntries.slice(0, 10).map((entry, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between border-b border-border py-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{entry.description}</p>
                    <p className="text-xs text-muted-foreground">{entry.performedBy}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                </div>
              ))}
              {auditEntries.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No activities yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIT LOG */}
        <TabsContent value="audit" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Filter Activities</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {AUDIT_FILTERS.map((filter) => (
                <Button
                  key={filter}
                  onClick={() => setActiveTab(filter)}
                  variant={activeTab === filter ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    activeTab === filter && "bg-[#1A4FA0] text-white hover:bg-[#1A4FA0]"
                  )}
                >
                  {filter} ({auditTypeCounts[filter]})
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLog.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        No activities found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAuditLog.map((entry, i) => (
                      <TableRow key={i} className={cn(i % 2 === 1 && "bg-muted/40")}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{entry.action}</TableCell>
                        <TableCell className="max-w-[300px] text-sm">{entry.description}</TableCell>
                        <TableCell className="text-sm">{entry.performedBy}</TableCell>
                        <TableCell>
                          <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {entry.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{entry.timestamp}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
                <span>Showing {filteredAuditLog.length} activities</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FORMS */}
        <TabsContent value="forms" className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Forms</h2>
              <p className="text-sm text-muted-foreground">
                Generate authenticated CEMS File PDFs for residents in the selected project.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="grid gap-2">
                <Label>Project</Label>
                <Select value={formsProjectId} onValueChange={(value) => setFormsProjectId(value)}>
                  {state.projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <Button onClick={handleGenerateAllCEMSFiles} variant="default">
                Generate All CEMS Files for this Project
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Authenticated Households</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-foreground">{authenticatedCount}</div>
                <div className="text-sm text-muted-foreground">Eligible for CEMS File</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Households</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-foreground">{totalProjectHouseholds}</div>
                <div className="text-sm text-muted-foreground">Registered in selected project</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Authenticated Household Records</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {authenticatedHouseholds.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-10 text-center">
                  <p className="text-lg font-semibold text-foreground">
                    No authenticated households in this project yet.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Households must be verified by the assigned Project Coordinator first.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Meter Number</TableHead>
                      <TableHead>Reference No.</TableHead>
                      <TableHead>Authenticated By</TableHead>
                      <TableHead>Date Authenticated</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authenticatedHouseholds.map((household, index) => (
                      <TableRow key={household.id} className={cn(index % 2 === 1 && "bg-muted/40")}>
                        <TableCell>{household.fullName}</TableCell>
                        <TableCell>{household.idNumber}</TableCell>
                        <TableCell>{household.meterNumber}</TableCell>
                        <TableCell>{household.refNo}</TableCell>
                        <TableCell>{household.authenticatedBy}</TableCell>
                        <TableCell>{household.authenticatedAt}</TableCell>
                        <TableCell>
                          <Button size="xs" onClick={() => handleSingleCEMSDownload(household)}>
                            📄 Generate CEMS File
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROJECTS */}
        <TabsContent value="projects" className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Projects Management</h2>
              <p className="text-sm text-muted-foreground">Create and assign project coordinators.</p>
            </div>
            <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
              <div className="flex items-center gap-3">
                <Button onClick={() => setProjectDialogOpen(true)} variant="default">
                  Create New Project
                </Button>
              </div>
              <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>Set project details and assign a coordinator.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Project Name</Label>
                    <Input
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Khayelitsha Phase 4"
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Year</Label>
                      <Input
                        value={newProjectYear}
                        onChange={(e) => setNewProjectYear(e.target.value)}
                        placeholder="2025"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Area / District</Label>
                      <Select value={newProjectArea} onValueChange={handleNewProjectAreaChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Khayelitsha">Khayelitsha</SelectItem>
                          <SelectItem value="Delft">Delft</SelectItem>
                          <SelectItem value="Mitchells Plain">Mitchells Plain</SelectItem>
                          <SelectItem value="Gugulethu">Gugulethu</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Target Households</Label>
                      <Input
                        type="number"
                        value={newProjectTarget}
                        onChange={(e) => setNewProjectTarget(e.target.value)}
                        placeholder="1000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Assign to Coordinator</Label>
                      <Select value={newProjectAdmin} onValueChange={handleNewProjectAdminChange} disabled={activeAdmins.length === 0}>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              activeAdmins.length === 0
                                ? "No active coordinators available"
                                : "Select coordinator"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {activeAdmins.map((admin) => (
                            <SelectItem key={admin.id} value={admin.id}>
                              {admin.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim() || !newProjectArea || !newProjectTarget}
                  >
                    Create Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Installed</TableHead>
                    <TableHead>% Complete</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Coordinator</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.projects.map((project, index) => {
                    const assignedAdmin = project.assignedAdmin
                      ? admins.find((admin) => admin.id === project.assignedAdmin)
                      : null
                    const percentComplete = project.target
                      ? Math.round((project.installed / project.target) * 100)
                      : 0

                    return (
                      <TableRow key={project.id} className={cn(index % 2 === 1 && "bg-muted/40")}>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>{project.year}</TableCell>
                        <TableCell>{project.area}</TableCell>
                        <TableCell>{project.target}</TableCell>
                        <TableCell>{project.registered}</TableCell>
                        <TableCell>{project.installed}</TableCell>
                        <TableCell>{percentComplete}%</TableCell>
                        <TableCell>{project.status}</TableCell>
                        <TableCell>
                          {assignedAdmin ? (
                            <span className="font-medium text-foreground">{assignedAdmin.name}</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="xs" onClick={() => openAssignmentDialog(project)}>
                            Assign / Reassign
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>
                {selectedProject ? `Assign / Reassign ${selectedProject.name}` : "Assign Project"}
              </DialogTitle>
              <DialogDescription>Choose a project coordinator or leave unassigned.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Assign to Coordinator</Label>
                <Select value={selectedAssignmentAdmin} onValueChange={handleSelectedAssignmentAdminChange} disabled={activeAdmins.length === 0}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        activeAdmins.length === 0
                          ? "No active coordinators available"
                          : "Select coordinator"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {activeAdmins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveAssignment}>Save Assignment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>
                {confirmAction === "reject" ? "Reject Coordinator" : "Suspend Coordinator"}
              </DialogTitle>
              <DialogDescription>
                {confirmAdmin ? (
                  confirmAction === "reject" ? (
                    `Reject ${confirmAdmin.name}'s registration and prevent login access.`
                  ) : (
                    `Suspend ${confirmAdmin.name} and clear their current project assignment.`
                  )
                ) : (
                  "Confirm this action."
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={confirmAction === "reject" ? "destructive" : "secondary"}
                onClick={handleConfirmAction}
              >
                {confirmAction === "reject" ? "Reject" : "Suspend"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ADMINS */}
        <TabsContent value="admins" className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile label="Pending Approvals" value={pendingAdminCount} icon={BarChart3} tone="amber" />
            <StatTile label="Active Coordinators" value={activeAdminCount} icon={Users} tone="green" />
            <StatTile label="Suspended / Rejected" value={suspendedRejectedCount} icon={ActivitySquare} tone="red" />
          </div>

          <Card>
            <CardHeader className="items-center gap-4">
              <div>
                <CardTitle>Coordinator Registrations</CardTitle>
                <p className="text-sm text-muted-foreground">Review and manage coordinator access.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["All", "Pending", "Active", "Rejected / Suspended"] as AdminFilter[]).map((filter) => (
                  <Button
                    key={filter}
                    size="sm"
                    variant={adminFilter === filter ? "default" : "outline"}
                    onClick={() => setAdminFilter(filter)}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cellphone</TableHead>
                    <TableHead>Employee No.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Project</TableHead>
                    <TableHead>Registered Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                        No matching coordinators found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAdmins.map((admin, i) => {
                      const projectName = admin.assignedProject
                        ? state.projects.find((project) => project.id === admin.assignedProject)?.name
                        : null

                      const statusClass =
                        admin.status === "pending"
                          ? "bg-[#FEF3C7] text-[#B45309]"
                          : admin.status === "active"
                          ? "bg-[#E6F4EA] text-[#047857]"
                          : admin.status === "rejected"
                          ? "bg-[#FEE2E2] text-[#B91C1C]"
                          : "bg-[#E5E7EB] text-[#4B5563]"

                      return (
                        <TableRow key={admin.id} className={cn(i % 2 === 1 && "bg-muted/40")}>
                          <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="font-medium text-foreground">{admin.name}</TableCell>
                          <TableCell className="text-sm">{admin.email}</TableCell>
                          <TableCell>{admin.cellphone || "—"}</TableCell>
                          <TableCell>{admin.employeeNumber || "—"}</TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
                              {admin.status ?? "active"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {projectName ? (
                              <span className="font-medium text-foreground">{projectName}</span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                                Unassigned
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{admin.registeredAt ?? "—"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {admin.status === "pending" && (
                                <>
                                  <Button
                                    size="xs"
                                    variant="default"
                                    onClick={() => {
                                      updateUser(admin.id, { status: "active" })
                                      addAuditEntry({
                                        action: "coordinator_approved",
                                        performedBy: currentRootName,
                                        description: `Approved coordinator account: ${admin.name} (${admin.email})`,
                                        timestamp: new Date().toLocaleString("en-ZA"),
                                        type: "Add",
                                      })
                                      showToast("Coordinator approved successfully", "success")
                                    }}
                                  >
                                    ✓ Approve
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="destructive"
                                    onClick={() => openConfirmModal(admin, "reject")}
                                  >
                                    ✗ Reject
                                  </Button>
                                </>
                              )}
                              {admin.status === "active" && (
                                <Button
                                  size="xs"
                                  variant="destructive"
                                  onClick={() => openConfirmModal(admin, "suspend")}
                                >
                                  Suspend
                                </Button>
                              )}
                              {(admin.status === "rejected" || admin.status === "suspended") && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => {
                                    updateUser(admin.id, { status: "active" })
                                    addAuditEntry({
                                      action: "coordinator_reactivated",
                                      performedBy: currentRootName,
                                      description: `Reactivated coordinator: ${admin.name}`,
                                      timestamp: new Date().toLocaleString("en-ZA"),
                                      type: "Edit",
                                    })
                                    showToast("Coordinator reactivated", "success")
                                  }}
                                >
                                  Reactivate
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
                <span>Showing {filteredAdmins.length} coordinators</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
