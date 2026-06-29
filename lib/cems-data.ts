export type HouseholdStatus = "verified" | "pending" | "flagged"

export interface Household {
  id: string
  ref: string
  fullName: string
  idNumber: string
  cellphone: string
  address: string
  suburb: string
  area: string
  meterNumber: string
  submitted: string
  status: HouseholdStatus
  verifiedBy?: string
  verifiedDate?: string
}

export const households: Household[] = [
  {
    id: "1",
    ref: "REF-2024-00231",
    fullName: "Sipho Nkosi",
    idNumber: "8801015009087",
    cellphone: "+27 82 451 7723",
    address: "12 Mew Way",
    suburb: "Site B",
    area: "Khayelitsha",
    meterNumber: "CT-0398",
    submitted: "2024-06-08 14:32",
    status: "verified",
    verifiedBy: "coordinator_jones",
    verifiedDate: "2024-06-08",
  },
  {
    id: "2",
    ref: "REF-2024-00232",
    fullName: "Nomsa Dlamini",
    idNumber: "9203124800083",
    cellphone: "+27 73 220 1145",
    address: "8 Lansdowne Road",
    suburb: "Section B",
    area: "Khayelitsha",
    meterNumber: "CT-0412",
    submitted: "2024-06-08 13:30",
    status: "pending",
  },
  {
    id: "3",
    ref: "REF-2024-00233",
    fullName: "Thabo Maseko",
    idNumber: "8506071234086",
    cellphone: "+27 81 990 2210",
    address: "45 Symphony Way",
    suburb: "The Hague",
    area: "Delft",
    meterNumber: "CT-0442",
    submitted: "2024-06-08 13:55",
    status: "flagged",
  },
  {
    id: "4",
    ref: "REF-2024-00234",
    fullName: "Zanele Mthembu",
    idNumber: "9011235678082",
    cellphone: "+27 84 117 8865",
    address: "3 Eisleben Road",
    suburb: "Section C",
    area: "Khayelitsha",
    meterNumber: "CT-0455",
    submitted: "2024-06-08 12:10",
    status: "pending",
  },
  {
    id: "5",
    ref: "REF-2024-00235",
    fullName: "Lungile Khumalo",
    idNumber: "8709085432081",
    cellphone: "+27 79 334 6612",
    address: "21 Voortrekker Road",
    suburb: "Rosendal",
    area: "Delft",
    meterNumber: "CT-0461",
    submitted: "2024-06-07 16:45",
    status: "verified",
    verifiedBy: "coordinator_james",
    verifiedDate: "2024-06-07",
  },
  {
    id: "6",
    ref: "REF-2024-00236",
    fullName: "Andile Plaatjies",
    idNumber: "9305126789081",
    cellphone: "+27 82 776 1190",
    address: "78 Spine Road",
    suburb: "Tafelsig",
    area: "Mitchells Plain",
    meterNumber: "CT-0470",
    submitted: "2024-06-07 11:20",
    status: "verified",
    verifiedBy: "coordinator_jones",
    verifiedDate: "2024-06-07",
  },
  {
    id: "7",
    ref: "REF-2024-00237",
    fullName: "Buhle Sithole",
    idNumber: "9508073456080",
    cellphone: "+27 73 882 4471",
    address: "5 NY1",
    suburb: "Gugulethu",
    area: "Gugulethu",
    meterNumber: "CT-0488",
    submitted: "2024-06-07 09:05",
    status: "pending",
  },
  {
    id: "8",
    ref: "REF-2024-00238",
    fullName: "Mandla Ngubane",
    idNumber: "8402015678089",
    cellphone: "+27 81 445 9923",
    address: "33 Govan Mbeki Road",
    suburb: "Section A",
    area: "Khayelitsha",
    meterNumber: "CT-0491",
    submitted: "2024-06-06 15:50",
    status: "flagged",
  },
]

export interface ActivityEntry {
  id: string
  action: string
  actor: string
  description: string
  time: string
  date: string
  type: "Login" | "Registration" | "Edit" | "Delete"
  tone: "create" | "edit" | "delete" | "login"
}

export const activities: ActivityEntry[] = [
  {
    id: "a1",
    action: "profile_authenticated",
    actor: "coordinator_jones",
    description: "Authenticated household: Sipho Nkosi (ID: 8801015009087)",
    time: "14:32",
    date: "08 Jun 2024",
    type: "Registration",
    tone: "create",
  },
  {
    id: "a2",
    action: "user_login",
    actor: "coordinator_james",
    description: "User logged in: coordinator_james@eskom.co.za",
    time: "14:17",
    date: "08 Jun 2024",
    type: "Login",
    tone: "login",
  },
  {
    id: "a3",
    action: "profile_flagged",
    actor: "coordinator_jones",
    description: "Flagged for review: meter number mismatch CT-0442",
    time: "13:55",
    date: "08 Jun 2024",
    type: "Edit",
    tone: "edit",
  },
  {
    id: "a4",
    action: "registration_added",
    actor: "coordinator_jones",
    description: "New household registered: Nomsa Dlamini, Khayelitsha Section B",
    time: "13:30",
    date: "08 Jun 2024",
    type: "Registration",
    tone: "create",
  },
  {
    id: "a5",
    action: "user_logout",
    actor: "coordinator_james",
    description: "User logged out",
    time: "13:12",
    date: "08 Jun 2024",
    type: "Login",
    tone: "login",
  },
  {
    id: "a6",
    action: "profile_deleted",
    actor: "manager_naidoo",
    description: "Removed duplicate registration: REF-2024-00198",
    time: "11:48",
    date: "08 Jun 2024",
    type: "Delete",
    tone: "delete",
  },
]

export interface AreaProgress {
  area: string
  target: number
  registered: number
  installed: number
  status: "On Track" | "Behind" | "Critical"
}

export const areaProgress: AreaProgress[] = [
  { area: "Khayelitsha Section B", target: 300, registered: 268, installed: 240, status: "On Track" },
  { area: "Khayelitsha Section C", target: 280, registered: 221, installed: 180, status: "Behind" },
  { area: "Delft South", target: 240, registered: 198, installed: 165, status: "On Track" },
  { area: "Mitchell's Plain East", target: 180, registered: 127, installed: 95, status: "Critical" },
]

export interface PreviousProject {
  name: string
  areaTag: string
  dates: string
  completed: number
  total: number
}

export const previousProjects: PreviousProject[] = [
  { name: "Khayelitsha Phase 2 — 2023", areaTag: "Khayelitsha", dates: "Jan 2023 – Nov 2023", completed: 1240, total: 1240 },
  { name: "Delft South Rollout — 2023", areaTag: "Delft", dates: "Mar 2023 – Dec 2023", completed: 892, total: 1000 },
  { name: "Mitchells Plain East — 2022", areaTag: "Mitchells Plain", dates: "Feb 2022 – Oct 2022", completed: 1100, total: 1100 },
]

export const AREAS = ["Khayelitsha", "Delft", "Mitchells Plain", "Gugulethu", "Other"]
