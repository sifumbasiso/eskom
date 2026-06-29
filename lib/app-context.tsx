"use client"

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react"

export type HouseholdStatus = "pending" | "authenticated" | "flagged"

export interface Household {
  id: string
  refNo: string
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
  projectId: string
  projectName: string
  status: HouseholdStatus
  submittedAt: string
  authenticatedBy: string | null
  authenticatedAt: string
  idFront: boolean
  idBack: boolean
  selfie: boolean
  notes: string
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: "admin" | "root"
  status?: "pending" | "active" | "rejected" | "suspended"
  assignedProject?: string | null
  registeredAt?: string
  employeeNumber?: string
  cellphone?: string
}

export interface AuthState {
  isAuthenticated: boolean
  user:
    | {
        id: string
        name: string
        email: string
        role: "admin" | "root"
        status?: "pending" | "active" | "rejected" | "suspended"
        assignedProject?: string | null
      }
    | null
}

export interface Project {
  id: string
  name: string
  year: string
  area: string
  target: number
  registered: number
  installed: number
  status: "active" | "complete"
  assignedAdmin?: string | null
  createdAt: string
}

export interface AuditEntry {
  id: string
  action: string
  performedBy: string
  description: string
  timestamp: string
  type:
    | "Login"
    | "Registration"
    | "Edit"
    | "Delete"
    | "Assignment"
    | "Add"
    | "Import"
    | "General"
    | "Reports"
}

export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "warning" | "info"
}

interface AppState {
  auth: AuthState
  households: Household[]
  users: User[]
  projects: Project[]
  auditLog: AuditEntry[]
  toasts: Toast[]
}

type AppAction =
  | { type: "LOGIN"; payload: { user: User } }
  | { type: "LOGOUT" }
  | { type: "ADD_HOUSEHOLD"; payload: Household }
  | { type: "UPDATE_HOUSEHOLD"; payload: Partial<Household> & { id: string } }
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: Partial<Project> & { id: string } }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: Partial<User> & { id: string } }
  | { type: "ADD_AUDIT_ENTRY"; payload: AuditEntry }
  | { type: "ADD_TOAST"; payload: Toast }
  | { type: "REMOVE_TOAST"; payload: string }
  | { type: "IMPORT_HOUSEHOLDS"; payload: Household[] }

const MOCK_USERS: User[] = [
  {
    id: "admin_001",
    name: "James Coordinator",
    email: "coordinator_james@eskom.co.za",
    password: "admin123",
    role: "admin",
    status: "active",
    assignedProject: "PROJ001",
    registeredAt: "2024-01-08",
    employeeNumber: "EMP-001",
  },
  {
    id: "admin_002",
    name: "Thandi Jones",
    email: "coordinator_jones@eskom.co.za",
    password: "admin123",
    role: "admin",
    status: "active",
    assignedProject: "PROJ003",
    registeredAt: "2023-03-10",
    employeeNumber: "EMP-002",
  },
  {
    id: "admin_003",
    name: "Sarah Mokoena",
    email: "coordinator_sarah@eskom.co.za",
    password: "admin123",
    role: "admin",
    status: "pending",
    assignedProject: null,
    registeredAt: "2024-11-16",
    employeeNumber: "EMP-003",
  },
  {
    id: "root_001",
    name: "Manager Dlamini",
    email: "manager@eskom.co.za",
    password: "root123",
    role: "root",
  },
]

const MOCK_HOUSEHOLDS: Household[] = [
  {
    id: "HH001",
    refNo: "REF-2024-00001",
    fullName: "Sipho Nkosi",
    idNumber: "8801015009087",
    dob: "1988-01-01",
    gender: "Male",
    cellphone: "0712345678",
    altPhone: "",
    address: "14 Spine Road",
    suburb: "Khayelitsha",
    area: "Khayelitsha Section B",
    province: "Western Cape",
    postalCode: "7784",
    meterNumber: "CT-0441",
    projectId: "PROJ001",
    projectName: "Khayelitsha Phase 3",
    status: "authenticated",
    submittedAt: "2024-11-10 09:14",
    authenticatedBy: "James Coordinator",
    authenticatedAt: "2024-11-10 14:22",
    idFront: true,
    idBack: true,
    selfie: true,
    notes: "",
  },
  {
    id: "HH002",
    refNo: "REF-2024-00002",
    fullName: "Nomsa Dlamini",
    idNumber: "9203025800082",
    dob: "1992-03-02",
    gender: "Female",
    cellphone: "0823456789",
    altPhone: "0712341234",
    address: "7 Ntlazane Street",
    suburb: "Khayelitsha",
    area: "Khayelitsha Section C",
    province: "Western Cape",
    postalCode: "7784",
    meterNumber: "CT-0442",
    projectId: "PROJ001",
    projectName: "Khayelitsha Phase 3",
    status: "pending",
    submittedAt: "2024-11-12 11:30",
    authenticatedBy: null,
    authenticatedAt: "",
    idFront: false,
    idBack: false,
    selfie: false,
    notes: "Pending document verification",
  },
  {
    id: "HH003",
    refNo: "REF-2024-00003",
    fullName: "Lungelo Zulu",
    idNumber: "7506155023083",
    dob: "1975-06-15",
    gender: "Male",
    cellphone: "0634567890",
    altPhone: "",
    address: "3 Mew Way",
    suburb: "Delft",
    area: "Delft South",
    province: "Western Cape",
    postalCode: "7100",
    meterNumber: "CT-0443",
    projectId: "PROJ003",
    projectName: "Delft South Rollout",
    status: "flagged",
    submittedAt: "2024-11-13 14:05",
    authenticatedBy: null,
    authenticatedAt: "",
    idFront: true,
    idBack: false,
    selfie: true,
    notes: "ID mismatch detected - requires clarification",
  },
  {
    id: "HH004",
    refNo: "REF-2024-00004",
    fullName: "Fatima Adams",
    idNumber: "9912120044084",
    dob: "1999-12-12",
    gender: "Female",
    cellphone: "0745678901",
    altPhone: "0765432109",
    address: "22 Bluebell Street",
    suburb: "Mitchells Plain",
    area: "Mitchells Plain East",
    province: "Western Cape",
    postalCode: "7785",
    meterNumber: "CT-0444",
    projectId: "PROJ004",
    projectName: "Mitchells Plain East",
    status: "pending",
    submittedAt: "2024-11-14 08:50",
    authenticatedBy: null,
    authenticatedAt: "",
    idFront: false,
    idBack: false,
    selfie: false,
    notes: "",
  },
  {
    id: "HH005",
    refNo: "REF-2024-00005",
    fullName: "Bongani Mokoena",
    idNumber: "8509085031085",
    dob: "1985-09-08",
    gender: "Male",
    cellphone: "0856789012",
    altPhone: "0834567812",
    address: "5 Harare Street",
    suburb: "Khayelitsha",
    area: "Khayelitsha Section B",
    province: "Western Cape",
    postalCode: "7784",
    meterNumber: "CT-0445",
    projectName: "Khayelitsha Phase 3",
    status: "authenticated",
    submittedAt: "2024-11-14 10:22",
    authenticatedBy: "Thandi Jones",
    authenticatedAt: "2024-11-15 09:15",
    idFront: true,
    idBack: true,
    selfie: true,
    notes: "",
  },
  {
    id: "HH006",
    refNo: "REF-2024-00006",
    fullName: "Naledi Kwame",
    idNumber: "9107245012056",
    dob: "1991-07-24",
    gender: "Female",
    cellphone: "0678901234",
    altPhone: "",
    address: "12 Kwanobuhle Avenue",
    suburb: "Khayelitsha",
    area: "Khayelitsha Section B",
    province: "Western Cape",
    postalCode: "7784",
    meterNumber: "CT-0446",
    projectName: "Khayelitsha Phase 3",
    status: "authenticated",
    submittedAt: "2024-11-15 07:45",
    authenticatedBy: "James Coordinator",
    authenticatedAt: "2024-11-15 08:30",
    idFront: true,
    idBack: true,
    selfie: true,
    notes: "",
  },
  {
    id: "HH007",
    refNo: "REF-2024-00007",
    fullName: "Mandla Sithole",
    idNumber: "8812165098034",
    dob: "1988-12-16",
    gender: "Male",
    cellphone: "0789012345",
    altPhone: "0823456712",
    address: "8 Imizamo Yethu Road",
    suburb: "Khayelitsha",
    area: "Khayelitsha Section C",
    province: "Western Cape",
    postalCode: "7784",
    meterNumber: "CT-0447",
    projectName: "Khayelitsha Phase 3",
    status: "pending",
    submittedAt: "2024-11-15 10:15",
    authenticatedBy: null,
    authenticatedAt: "",
    idFront: true,
    idBack: true,
    selfie: false,
    notes: "Selfie pending",
  },
  {
    id: "HH008",
    refNo: "REF-2024-00008",
    fullName: "Thandi Mthembu",
    idNumber: "9205018067021",
    dob: "1992-05-01",
    gender: "Female",
    cellphone: "0812345678",
    altPhone: "",
    address: "15 Samora Machel Street",
    suburb: "Delft",
    area: "Delft South",
    province: "Western Cape",
    postalCode: "7100",
    meterNumber: "CT-0448",
    projectName: "Delft South Rollout",
    status: "authenticated",
    submittedAt: "2024-11-14 13:20",
    authenticatedBy: "Thandi Jones",
    authenticatedAt: "2024-11-15 09:45",
    idFront: true,
    idBack: true,
    selfie: true,
    notes: "",
  },
  {
    id: "HH009",
    refNo: "REF-2024-00009",
    fullName: "Kapela Khumalo",
    idNumber: "8704125087045",
    dob: "1987-04-12",
    gender: "Male",
    cellphone: "0823457890",
    altPhone: "0734567890",
    address: "4 Delft Street",
    suburb: "Delft",
    area: "Delft South",
    province: "Western Cape",
    postalCode: "7100",
    meterNumber: "CT-0449",
    projectName: "Delft South Rollout",
    status: "pending",
    submittedAt: "2024-11-15 11:50",
    authenticatedBy: null,
    authenticatedAt: "",
    idFront: false,
    idBack: false,
    selfie: false,
    notes: "",
  },
  {
    id: "HH010",
    refNo: "REF-2024-00010",
    fullName: "Joyce Petse",
    idNumber: "7808265043089",
    dob: "1978-08-26",
    gender: "Female",
    cellphone: "0834568901",
    altPhone: "0776543210",
    address: "30 Delft Avenue",
    suburb: "Delft",
    area: "Delft South",
    province: "Western Cape",
    postalCode: "7100",
    meterNumber: "CT-0450",
    projectId: "PROJ003",
    projectName: "Delft South Rollout",
    status: "authenticated",
    submittedAt: "2024-11-13 16:30",
    authenticatedBy: "Thandi Jones",
    authenticatedAt: "2024-11-14 10:20",
    idFront: true,
    idBack: true,
    selfie: true,
    notes: "",
  },
  {
    id: "HH011",
    refNo: "REF-2024-00011",
    fullName: "Rahman Khan",
    idNumber: "8906015098067",
    dob: "1989-06-01",
    gender: "Male",
    cellphone: "0712567890",
    altPhone: "",
    address: "42 Main Street",
    suburb: "Mitchells Plain",
    area: "Mitchells Plain East",
    province: "Western Cape",
    postalCode: "7785",
    meterNumber: "CT-0451",
    projectId: "PROJ004",
    projectName: "Mitchells Plain East",
    status: "authenticated",
    submittedAt: "2024-11-12 14:00",
    authenticatedBy: "James Coordinator",
    authenticatedAt: "2024-11-13 09:15",
    idFront: true,
    idBack: true,
    selfie: true,
    notes: "",
  },
  {
    id: "HH012",
    refNo: "REF-2024-00012",
    fullName: "Portia Lekalakala",
    idNumber: "9301145072013",
    dob: "1993-01-14",
    gender: "Female",
    cellphone: "0768901234",
    altPhone: "0823456890",
    address: "18 Hospital Street",
    suburb: "Gugulethu",
    area: "Gugulethu",
    province: "Western Cape",
    postalCode: "7750",
    meterNumber: "CT-0452",
    projectId: "PROJ005",
    projectName: "Gugulethu Ext. 1",
    status: "pending",
    submittedAt: "2024-11-15 09:30",
    authenticatedBy: null,
    authenticatedAt: "",
    idFront: false,
    idBack: false,
    selfie: false,
    notes: "",
  },
  {
    id: "HH013",
    refNo: "REF-2024-00013",
    fullName: "David Ncube",
    idNumber: "9002235067024",
    dob: "1990-02-23",
    gender: "Male",
    cellphone: "0679012345",
    altPhone: "0712340123",
    address: "7 Oxford Street",
    suburb: "Gugulethu",
    area: "Gugulethu",
    province: "Western Cape",
    postalCode: "7750",
    meterNumber: "CT-0453",
    projectId: "PROJ005",
    projectName: "Gugulethu Ext. 1",
    status: "authenticated",
    submittedAt: "2024-11-14 15:45",
    authenticatedBy: "James Coordinator",
    authenticatedAt: "2024-11-14 16:30",
    idFront: true,
    idBack: true,
    selfie: true,
    notes: "",
  },
  {
    id: "HH014",
    refNo: "REF-2024-00014",
    fullName: "Solange Mwase",
    idNumber: "8711055098076",
    dob: "1987-11-05",
    gender: "Female",
    cellphone: "0823459012",
    altPhone: "",
    address: "11 Palomino Close",
    suburb: "Mitchells Plain",
    area: "Mitchells Plain East",
    province: "Western Cape",
    postalCode: "7785",
    meterNumber: "CT-0454",
    projectId: "PROJ004",
    projectName: "Mitchells Plain East",
    status: "flagged",
    submittedAt: "2024-11-14 11:20",
    authenticatedBy: null,
    authenticatedAt: "",
    idFront: true,
    idBack: true,
    selfie: false,
    notes: "Meter number verification required",
  },
  {
    id: "HH015",
    refNo: "REF-2024-00015",
    fullName: "Victor Masondo",
    idNumber: "8505125089045",
    dob: "1985-05-12",
    gender: "Male",
    cellphone: "0690123456",
    altPhone: "0834569012",
    address: "9 Extension Road",
    suburb: "Gugulethu",
    area: "Gugulethu",
    province: "Western Cape",
    postalCode: "7750",
    meterNumber: "CT-0455",
    projectId: "PROJ005",
    projectName: "Gugulethu Ext. 1",
    status: "pending",
    submittedAt: "2024-11-15 13:00",
    authenticatedBy: null,
    authenticatedAt: "",
    idFront: false,
    idBack: false,
    selfie: false,
    notes: "",
  },
]

const MOCK_PROJECTS: Project[] = [
  {
    id: "PROJ001",
    name: "Khayelitsha Phase 3",
    year: "2024",
    area: "Khayelitsha",
    target: 1000,
    registered: 814,
    installed: 680,
    status: "active",
    assignedAdmin: "admin_001",
    createdAt: "2024-01-10",
  },
  {
    id: "PROJ002",
    name: "Khayelitsha Phase 2",
    year: "2023",
    area: "Khayelitsha",
    target: 1240,
    registered: 1240,
    installed: 1240,
    status: "complete",
    assignedAdmin: null,
    createdAt: "2023-01-05",
  },
  {
    id: "PROJ003",
    name: "Delft South Rollout",
    year: "2023",
    area: "Delft",
    target: 1000,
    registered: 892,
    installed: 850,
    status: "active",
    assignedAdmin: "admin_002",
    createdAt: "2023-03-12",
  },
  {
    id: "PROJ004",
    name: "Mitchells Plain East",
    year: "2022",
    area: "Mitchells Plain",
    target: 1100,
    registered: 1100,
    installed: 1100,
    status: "complete",
    assignedAdmin: null,
    createdAt: "2022-02-01",
  },
  {
    id: "PROJ005",
    name: "Gugulethu Ext. 1",
    year: "2022",
    area: "Gugulethu",
    target: 800,
    registered: 800,
    installed: 800,
    status: "complete",
    assignedAdmin: null,
    createdAt: "2022-01-15",
  },
]

const INITIAL_AUDIT_LOG: AuditEntry[] = [
  {
    id: "AUDIT_001",
    action: "user_login",
    performedBy: "James Coordinator",
    description: "User logged in as Project Coordinator",
    timestamp: "2024-11-15 09:30:00",
    type: "Login",
  },
  {
    id: "AUDIT_002",
    action: "households_authenticated",
    performedBy: "James Coordinator",
    description: "Authenticated household HH006 (Naledi Kwame)",
    timestamp: "2024-11-15 08:30:00",
    type: "Assignment",
  },
  {
    id: "AUDIT_003",
    action: "registration_added",
    performedBy: "System",
    description: "New registration submitted by Naledi Kwame",
    timestamp: "2024-11-15 07:45:00",
    type: "Registration",
  },
  {
    id: "AUDIT_004",
    action: "households_flagged",
    performedBy: "James Coordinator",
    description: "Flagged household HH014 (Solange Mwase) for meter verification",
    timestamp: "2024-11-14 11:45:00",
    type: "Assignment",
  },
  {
    id: "AUDIT_005",
    action: "user_login",
    performedBy: "Thandi Jones",
    description: "User logged in as Project Coordinator",
    timestamp: "2024-11-15 09:00:00",
    type: "Login",
  },
  {
    id: "AUDIT_006",
    action: "households_authenticated",
    performedBy: "Thandi Jones",
    description: "Authenticated household HH010 (Joyce Petse)",
    timestamp: "2024-11-14 10:20:00",
    type: "Assignment",
  },
  {
    id: "AUDIT_007",
    action: "registration_added",
    performedBy: "System",
    description: "New registration submitted by Bongani Mokoena",
    timestamp: "2024-11-14 10:22:00",
    type: "Registration",
  },
  {
    id: "AUDIT_008",
    action: "households_authenticated",
    performedBy: "Thandi Jones",
    description: "Authenticated household HH008 (Thandi Mthembu)",
    timestamp: "2024-11-15 09:45:00",
    type: "Assignment",
  },
  {
    id: "AUDIT_009",
    action: "registration_added",
    performedBy: "System",
    description: "New registration submitted by Nomsa Dlamini",
    timestamp: "2024-11-12 11:30:00",
    type: "Registration",
  },
  {
    id: "AUDIT_010",
    action: "registration_added",
    performedBy: "System",
    description: "New registration submitted by Sipho Nkosi",
    timestamp: "2024-11-10 09:14:00",
    type: "Registration",
  },
  {
    id: "AUDIT_011",
    action: "user_login",
    performedBy: "Manager Dlamini",
    description: "User logged in as Root Administrator",
    timestamp: "2024-11-15 08:00:00",
    type: "Login",
  },
  {
    id: "AUDIT_012",
    action: "admin_approved",
    performedBy: "Manager Dlamini",
    description: "Approved coordinator registration for Sarah Mokoena",
    timestamp: "2024-11-15 07:30:00",
    type: "Assignment",
  },
  {
    id: "AUDIT_013",
    action: "project_assigned",
    performedBy: "Manager Dlamini",
    description: "Assigned project Khayelitsha Phase 3 to James Coordinator",
    timestamp: "2024-11-01 10:00:00",
    type: "Assignment",
  },
  {
    id: "AUDIT_014",
    action: "households_flagged",
    performedBy: "James Coordinator",
    description: "Flagged household HH003 (Lungelo Zulu) for ID mismatch review",
    timestamp: "2024-11-13 14:30:00",
    type: "Assignment",
  },
  {
    id: "AUDIT_015",
    action: "households_authenticated",
    performedBy: "James Coordinator",
    description: "Authenticated household HH013 (David Ncube)",
    timestamp: "2024-11-14 16:30:00",
    type: "Assignment",
  },
]

const initialState: AppState = {
  auth: {
    isAuthenticated: false,
    user: null,
  },
  households: MOCK_HOUSEHOLDS,
  users: MOCK_USERS,
  projects: MOCK_PROJECTS,
  auditLog: INITIAL_AUDIT_LOG,
  toasts: [],
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          user: {
            id: action.payload.user.id,
            name: action.payload.user.name,
            email: action.payload.user.email,
            role: action.payload.user.role,
          },
        },
      }
    case "LOGOUT":
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          user: null,
        },
      }
    case "ADD_HOUSEHOLD":
      return {
        ...state,
        households: [...state.households, action.payload],
      }
    case "UPDATE_HOUSEHOLD":
      return {
        ...state,
        households: state.households.map((h) =>
          h.id === action.payload.id ? { ...h, ...action.payload } : h
        ),
      }
    case "ADD_PROJECT":
      return {
        ...state,
        projects: [...state.projects, action.payload],
      }
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id ? { ...project, ...action.payload } : project
        ),
      }
    case "ADD_USER":
      return {
        ...state,
        users: [...state.users, action.payload],
      }
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.payload.id ? { ...user, ...action.payload } : user
        ),
      }
    case "ADD_AUDIT_ENTRY":
      return {
        ...state,
        auditLog: [action.payload, ...state.auditLog],
      }
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      }
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      }
    case "IMPORT_HOUSEHOLDS":
      return {
        ...state,
        households: [...state.households, ...action.payload],
      }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  login: (email: string, password: string, role: string) => { success: boolean; error?: string }
  logout: () => void
  addHousehold: (household: Household) => void
  updateHousehold: (id: string, updates: Partial<Household>) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  addUser: (user: User) => void
  updateUser: (id: string, updates: Partial<User>) => void
  addAuditEntry: (entry: Omit<AuditEntry, "id">) => void
  showToast: (message: string, type: "success" | "error" | "warning" | "info") => void
  importHouseholds: (households: Household[]) => void
  generateHousehodId: () => string
  generateProjectId: () => string
  generateAdminId: () => string
  generateRefNo: () => string
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const login = useCallback(
    (email: string, password: string, role: string) => {
      const user = state.users.find(
        (u) => u.email === email && u.password === password && u.role === (role === "admin" ? "admin" : "root")
      )

      if (!user) {
        return { success: false, error: "Invalid email or password" }
      }

      if (user.role === "admin" && user.status !== "active") {
        const errorMessage =
          user.status === "pending"
            ? "Coordinator account is pending approval."
            : user.status === "rejected"
            ? "Coordinator account has been rejected."
            : user.status === "suspended"
            ? "Coordinator account is suspended."
            : "Coordinator account is not active."

        return { success: false, error: errorMessage }
      }

      dispatch({ type: "LOGIN", payload: { user } })
      
      // Add audit log
      dispatch({
        type: "ADD_AUDIT_ENTRY",
        payload: {
          id: `AUDIT_${Date.now()}`,
          action: "user_login",
          performedBy: user.name,
          description: `User logged in as ${role === "admin" ? "Project Coordinator" : "Root Administrator"}`,
          timestamp: new Date().toLocaleString("en-ZA"),
          type: "Login",
        },
      })

      return { success: true }
    },
    [state.users]
  )

  const logout = useCallback(() => {
    const currentUser = state.auth.user
    if (currentUser) {
      dispatch({
        type: "ADD_AUDIT_ENTRY",
        payload: {
          id: `AUDIT_${Date.now()}`,
          action: "user_logout",
          performedBy: currentUser.name,
          description: "User logged out",
          timestamp: new Date().toLocaleString("en-ZA"),
          type: "Login",
        },
      })
    }
    dispatch({ type: "LOGOUT" })
  }, [state.auth.user])

  const addHousehold = useCallback((household: Household) => {
    dispatch({ type: "ADD_HOUSEHOLD", payload: household })
  }, [])

  const updateHousehold = useCallback((id: string, updates: Partial<Household>) => {
    dispatch({ type: "UPDATE_HOUSEHOLD", payload: { id, ...updates } })
  }, [])

  const addProject = useCallback((project: Project) => {
    dispatch({ type: "ADD_PROJECT", payload: project })
  }, [])

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    dispatch({ type: "UPDATE_PROJECT", payload: { id, ...updates } })
  }, [])

  const addUser = useCallback((user: User) => {
    dispatch({ type: "ADD_USER", payload: user })
  }, [])

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    dispatch({ type: "UPDATE_USER", payload: { id, ...updates } })
  }, [])

  const addAuditEntry = useCallback((entry: Omit<AuditEntry, "id">) => {
    dispatch({
      type: "ADD_AUDIT_ENTRY",
      payload: {
        ...entry,
        id: `AUDIT_${Date.now()}`,
      },
    })
  }, [])

  const showToast = useCallback((message: string, type: "success" | "error" | "warning" | "info") => {
    const id = `TOAST_${Date.now()}`
    dispatch({
      type: "ADD_TOAST",
      payload: { id, message, type },
    })

    setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", payload: id })
    }, 3000)
  }, [])

  const importHouseholds = useCallback((households: Household[]) => {
    dispatch({ type: "IMPORT_HOUSEHOLDS", payload: households })
  }, [])

  const generateHousehodId = useCallback(() => {
    const max = Math.max(...state.households.map((h) => parseInt(h.id.replace("HH", ""), 10)))
    return `HH${String(max + 1).padStart(3, "0")}`
  }, [state.households])

  const generateRefNo = useCallback(() => {
    const year = new Date().getFullYear()
    const yearRefNos = state.households
      .map((h) => h.refNo)
      .filter((ref) => ref.includes(year.toString()))
      .map((ref) => parseInt(ref.split("-").pop() || "0", 10))
    const nextSeq = Math.max(...yearRefNos, 0) + 1
    return `REF-${year}-${String(nextSeq).padStart(5, "0")}`
  }, [state.households])

  const generateProjectId = useCallback(() => {
    const max = Math.max(
      ...state.projects.map((project) => parseInt(project.id.replace("PROJ", ""), 10)),
      0
    )
    return `PROJ${String(max + 1).padStart(3, "0")}`
  }, [state.projects])

  const generateAdminId = useCallback(() => {
    const max = Math.max(
      ...state.users
        .filter((user) => user.id.startsWith("admin_"))
        .map((user) => parseInt(user.id.replace("admin_", ""), 10)),
      0
    )
    return `admin_${String(max + 1).padStart(3, "0")}`
  }, [state.users])

  const value: AppContextValue = {
    state,
    login,
    logout,
    addHousehold,
    updateHousehold,
    addProject,
    updateProject,
    addUser,
    updateUser,
    addAuditEntry,
    showToast,
    importHouseholds,
    generateHousehodId,
    generateProjectId,
    generateAdminId,
    generateRefNo,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider")
  }
  return context
}
