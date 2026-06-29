"use client"

import { useState, useMemo } from "react"
import { Download, FileSpreadsheet, UploadCloud, AlertCircle, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppContext } from "@/lib/app-context"

interface ParsedHousehold {
  fullName: string
  idNumber: string
  dob: string
  gender: string
  cellphone: string
  altPhone: string
  address: string
  suburb: string
  area: string
  province: string
  postalCode: string
  meterNumber: string
  projectName: string
  notes: string
  isValid?: boolean
  errors?: string[]
  selected?: boolean
}

export function ExportImportDialog({
  label,
  variant = "default",
  size = "default",
}: {
  label: React.ReactNode
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "gradient"
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm"
}) {
  const { state, addHousehold, addAuditEntry, showToast, generateHousehodId, generateRefNo } = useAppContext()
  const [file, setFile] = useState<string | null>(null)
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [areaFilter, setAreaFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [importTab, setImportTab] = useState<"export" | "import">("export")
  const [parsedData, setParsedData] = useState<ParsedHousehold[]>([])
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const authenticatedUser = state.auth.user
  const userAssignedProject = useMemo(() => {
    if (!authenticatedUser) return null
    const user = state.users.find((u) => u.id === authenticatedUser.id)
    if (!user?.assignedProject) return null
    return state.projects.find((p) => p.id === user.assignedProject)
  }, [authenticatedUser, state.users, state.projects])

  const filteredHouseholds = useMemo(() => {
    let filtered = state.households

    if (projectFilter !== "all") {
      filtered = filtered.filter((h) => h.projectName === projectFilter)
    }

    if (areaFilter !== "all") {
      filtered = filtered.filter((h) => h.area.toLowerCase() === areaFilter.toLowerCase())
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((h) => h.status === statusFilter)
    }

    return filtered
  }, [state.households, projectFilter, areaFilter, statusFilter])

  const areas = useMemo(() => {
    const unique = new Set(state.households.map((h) => h.area))
    return Array.from(unique).sort()
  }, [state.households])

  function validateSAID(idNumber: string): boolean {
    return /^\d{13}$/.test(idNumber)
  }

  function validateCellphone(cellphone: string): boolean {
    const cleaned = cellphone.replace(/\D/g, "")
    return /^(06|07|08)\d{8}$/.test(cleaned)
  }

  function validateRow(row: ParsedHousehold): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!row.fullName?.trim()) errors.push("Full Name is required")
    if (!row.idNumber?.trim()) {
      errors.push("SA ID Number is required")
    } else if (!validateSAID(row.idNumber)) {
      errors.push("Invalid SA ID (must be 13 digits)")
    }
    if (!row.dob?.trim()) {
      errors.push("Date of birth is required")
    }
    if (!row.gender?.trim()) errors.push("Gender is required")
    if (!row.cellphone?.trim()) {
      errors.push("Cellphone is required")
    } else if (!validateCellphone(row.cellphone)) {
      errors.push("Invalid phone format")
    }
    if (!row.address?.trim()) errors.push("Address is required")
    if (!row.suburb?.trim()) errors.push("Suburb is required")
    if (!row.area?.trim()) errors.push("Area is required")
    if (!row.province?.trim()) errors.push("Province is required")
    if (!row.postalCode?.trim() || !/^[0-9]{4}$/.test(row.postalCode)) {
      errors.push("Postal Code must be 4 digits")
    }
    if (!row.meterNumber?.trim()) errors.push("Meter Number is required")
    if (!row.projectName?.trim()) errors.push("Project Name is required")

    // Project name must match an existing project
    if (row.projectName?.trim()) {
      const projectExists = state.projects.some(
        (p) => p.name.toLowerCase() === row.projectName.toLowerCase()
      )
      if (!projectExists) {
        errors.push("Unknown project - not found in system")
      }
    }

    // If user has assigned project, verify row matches it
    if (userAssignedProject && row.projectName?.trim()) {
      if (row.projectName.toLowerCase() !== userAssignedProject.name.toLowerCase()) {
        errors.push("Not your assigned project")
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  function handleExportCSV() {
    const headers = [
      "ID",
      "Reference",
      "Full Name",
      "ID Number",
      "Date of Birth",
      "Gender",
      "Cellphone",
      "Alternative Number",
      "Street Address",
      "Suburb",
      "Area/District",
      "Province",
      "Postal Code",
      "Meter Number",
      "Project Name",
      "Status",
      "Submitted",
      "Authenticated By",
    ]
    const rows = filteredHouseholds.map((h) => [
      h.id,
      h.refNo,
      h.fullName,
      h.idNumber,
      h.dob,
      h.gender,
      h.cellphone,
      h.altPhone,
      h.address,
      h.suburb,
      h.area,
      h.province,
      h.postalCode,
      h.meterNumber,
      h.projectName,
      h.status,
      h.submittedAt,
      h.authenticatedBy || "-",
    ])

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) =>
            typeof cell === "string" && cell.includes(",")
              ? `"${cell.replace(/"/g, '""')}"`
              : cell
          )
          .join(",")
      )
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `households-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    showToast(`Exported ${filteredHouseholds.length} records`, "success")
  }

  function downloadTemplate() {
    const headers = [
      "Full Name*",
      "SA ID Number*",
      "Date of Birth*",
      "Gender*",
      "Cellphone No.*",
      "Alternative No.",
      "Street Address*",
      "Suburb*",
      "Area/District*",
      "Province*",
      "Postal Code*",
      "Meter Number*",
      "Project Name*",
      "Notes/Remarks",
    ]

    const csv = headers.join(",") + "\n"
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "import-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile.name)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          showToast("No valid data found in this file", "error")
          return
        }

        // Skip header and parse data rows
        const dataLines = lines.slice(1)
        const parsed: ParsedHousehold[] = dataLines.map((line) => {
          // Simple CSV parsing - handles basic comma-separated values
          const values = line
            .split(",")
            .map((v) => v.trim().replace(/^"|"$/g, ""))
            .map((v) => (v === "-" ? "" : v))

          const row: ParsedHousehold = {
            fullName: values[0] || "",
            idNumber: values[1] || "",
            dob: values[2] || "",
            gender: values[3] || "",
            cellphone: values[4] || "",
            altPhone: values[5] || "",
            address: values[6] || "",
            suburb: values[7] || "",
            area: values[8] || "",
            province: values[9] || "Western Cape",
            postalCode: values[10] || "",
            meterNumber: values[11] || "",
            projectName: values[12] || "",
            notes: values[13] || "",
          }

          const validation = validateRow(row)
          row.isValid = validation.isValid
          row.errors = validation.errors
          row.selected = validation.isValid // Pre-select valid rows

          return row
        })

        setParsedData(parsed)

        // Pre-select all valid rows
        const validIndices = new Set(
          parsed.map((_, i) => i).filter((i) => parsed[i].isValid)
        )
        setSelectedRows(validIndices)
      } catch (error) {
        showToast("Error parsing file", "error")
      }
    }

    reader.readAsText(selectedFile)
  }

  function handleImport() {
    const rowsToImport = Array.from(selectedRows).map((i) => parsedData[i])
    if (rowsToImport.length === 0) {
      showToast("No rows selected for import", "warning")
      return
    }

    let importedCount = 0
    rowsToImport.forEach((row) => {
      const project = state.projects.find(
        (p) => p.name.toLowerCase() === row.projectName.toLowerCase()
      )

      const newHousehold = {
        id: generateHousehodId(),
        refNo: generateRefNo(),
        fullName: row.fullName,
        idNumber: row.idNumber,
        dob: row.dob,
        gender: row.gender || "Not specified",
        cellphone: row.cellphone,
        altPhone: row.altPhone,
        address: row.address,
        suburb: row.suburb,
        area: row.area,
        province: row.province || "Western Cape",
        postalCode: row.postalCode,
        meterNumber: row.meterNumber,
        projectId: project?.id || "",
        projectName: row.projectName,
        status: "pending" as const,
        submittedAt: new Date().toLocaleString("en-ZA"),
        authenticatedBy: null,
        authenticatedAt: "",
        idFront: false,
        idBack: false,
        selfie: false,
        notes: row.notes,
      }

      addHousehold(newHousehold)
      importedCount++
    })

    addAuditEntry({
      action: "households_imported",
      performedBy: state.auth.user?.name || "System",
      description: `Imported ${importedCount} households via CSV for project '${
        rowsToImport[0]?.projectName || "Unknown"
      }'`,
      timestamp: new Date().toLocaleString("en-ZA"),
      type: "Import",
    })

    showToast(`${importedCount} households imported successfully`, "success")
    setParsedData([])
    setSelectedRows(new Set())
    setFile(null)
  }

  return (
    <Dialog>
      <DialogTrigger
        className={
          "inline-flex items-center justify-center gap-2 rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm font-medium text-[#1A4FA0] hover:bg-[#F4F6FB] transition-colors"
        }
      >
        {label}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export / Import Households</DialogTitle>
          <DialogDescription>
            Download household records or bulk-import new registrations from CSV.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 border-b">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              importTab === "export"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setImportTab("export")}
          >
            Export
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              importTab === "import"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setImportTab("import")}
          >
            Import
          </button>
        </div>

        {importTab === "export" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Filter & Export to CSV</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <FilterField
                  label="Project"
                  value={projectFilter}
                  onChange={(value) => value !== null && setProjectFilter(value)}
                >
                  <SelectItem value="all">All Projects</SelectItem>
                  {state.projects.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </FilterField>
                <FilterField
                  label="Area"
                  value={areaFilter}
                  onChange={(value) => value !== null && setAreaFilter(value)}
                >
                  <SelectItem value="all">All Areas</SelectItem>
                  {areas.map((a) => (
                    <SelectItem key={a} value={a.toLowerCase()}>
                      {a}
                    </SelectItem>
                  ))}
                </FilterField>
                <FilterField
                  label="Status"
                  value={statusFilter}
                  onChange={(value) => value !== null && setStatusFilter(value)}
                >
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="authenticated">Authenticated</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </FilterField>
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredHouseholds.length} records match your filters
              </p>
              <Button
                onClick={handleExportCSV}
                disabled={filteredHouseholds.length === 0}
                className="self-start"
              >
                <Download className="mr-2 size-4" />
                Export as CSV
              </Button>
            </div>
          </div>
        )}

        {importTab === "import" && (
          <div className="flex flex-col gap-4">
            {!userAssignedProject && authenticatedUser?.role === "admin" && (
              <div className="flex gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                <AlertCircle className="mt-0.5 size-4 flex-shrink-0" />
                <p>
                  You must be assigned to a project before importing household data. Contact your Root Administrator.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Import Template</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  disabled={!userAssignedProject && authenticatedUser?.role === "admin"}
                >
                  <Download className="mr-2 size-4" />
                  Download Template
                </Button>
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 p-6 text-center transition-colors hover:border-primary/60 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">
                <UploadCloud className="size-7 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {file ?? "Drag & drop a .csv file here, or click to browse"}
                </span>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={!userAssignedProject && authenticatedUser?.role === "admin"}
                />
              </label>
            </div>

            {parsedData.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Preview & Select Rows</h3>
                  <div className="text-xs text-muted-foreground">
                    {selectedRows.size} of {parsedData.filter((r) => r.isValid).length} valid rows selected
                  </div>
                </div>

                <div className="max-h-96 overflow-x-auto rounded-lg border">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-muted">
                      <tr>
                        <th className="w-10 px-3 py-2 text-left font-medium">
                          <Checkbox
                            checked={
                              selectedRows.size > 0 &&
                              selectedRows.size ===
                                parsedData.filter((r) => r.isValid).length
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRows(
                                  new Set(
                                    parsedData
                                      .map((_, i) => i)
                                      .filter((i) => parsedData[i].isValid)
                                  )
                                )
                              } else {
                                setSelectedRows(new Set())
                              }
                            }}
                          />
                        </th>
                        <th className="px-3 py-2 text-left font-medium">Full Name</th>
                        <th className="px-3 py-2 text-left font-medium">ID</th>
                        <th className="px-3 py-2 text-left font-medium">Project</th>
                        <th className="px-3 py-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.map((row, i) => (
                        <tr
                          key={i}
                          className="border-t hover:bg-muted/50"
                        >
                          <td className="px-3 py-2">
                            <Checkbox
                              checked={selectedRows.has(i)}
                              onCheckedChange={(checked) => {
                                const newSelected = new Set(selectedRows)
                                if (checked && row.isValid) {
                                  newSelected.add(i)
                                } else {
                                  newSelected.delete(i)
                                }
                                setSelectedRows(newSelected)
                              }}
                              disabled={!row.isValid}
                            />
                          </td>
                          <td className="px-3 py-2">{row.fullName}</td>
                          <td className="px-3 py-2">{row.idNumber}</td>
                          <td className="px-3 py-2">{row.projectName}</td>
                          <td className="px-3 py-2">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-green-700">
                                <CheckCircle2 className="size-3" />
                                Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-red-700">
                                <AlertCircle className="size-3" />
                                Errors
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-semibold">Validation Details:</p>
                  {parsedData.map((row, i) => (
                    row.errors && row.errors.length > 0 && (
                      <div key={i} className="text-xs text-muted-foreground">
                        <strong>{row.fullName}</strong>: {row.errors.join(", ")}
                      </div>
                    )
                  ))}
                </div>

                <Button
                  onClick={handleImport}
                  disabled={selectedRows.size === 0 || (!userAssignedProject && authenticatedUser?.role === "admin")}
                  className="self-start"
                >
                  <UploadCloud className="mr-2 size-4" />
                  Import {selectedRows.size > 0 && `(${selectedRows.size})`} Selected Rows
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function FilterField({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string | null) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  )
}
