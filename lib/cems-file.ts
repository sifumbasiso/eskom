import { jsPDF } from "jspdf/dist/jspdf.es.min.js"
import { Household, Project, User } from "@/lib/app-context"

const BRAND_BLUE = "#1A4FA0"
const BRAND_GREEN = "#00A651"
const BRAND_DARK = "#0D2B5E"

function drawLabelValue(doc: jsPDF, label: string, value: string, x: number, y: number, isBold = false) {
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor("#5A6A8A")
  doc.text(label.toUpperCase(), x, y)
  doc.setFontSize(isBold ? 11 : 10)
  doc.setFont("helvetica", isBold ? "bold" : "normal")
  doc.setTextColor("#1A1A2E")
  doc.text(value || "—", x, y + 4.5)
}

async function fetchImageDataUrl(path: string) {
  try {
    const res = await fetch(path)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch (e) {
    return null
  }
}

export async function generateCEMSFile(household: Household, project: Project, admin: Pick<User, "name">) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageWidth = 210
  const pageHeight = 297
  const margin = 15

  // ===== HEADER SECTION =====
  // Blue background strip
  doc.setFillColor(BRAND_BLUE)
  doc.rect(0, 0, pageWidth, 20, "F")

  // Eskom logo - try to load actual logo
  const logoData = await fetchImageDataUrl("/images/eskom-logo.png")
  if (logoData) {
    doc.addImage(logoData, "PNG", margin, 2, 16, 16)
  }

  // Left side text (white on blue)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor("#FFFFFF")
  doc.text("ESKOM HOLDINGS SOC LTD", margin + 18, 7)
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text("Community Electrification Management System (CEMS)", margin + 18, 11.5)
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.text("Household Registration & Authentication Record", margin + 18, 15)

  // Right side on green background
  doc.setFillColor(BRAND_GREEN)
  doc.rect(pageWidth - 60, 0, 60, 20, "F")

  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor("#FFFFFF")
  doc.text("FORM: ESKOM-CEMS-001", pageWidth - 57, 5)
  doc.text(`Reference No: ${household.refNo}`, pageWidth - 57, 10)
  doc.text(`Project: ${project.name}`, pageWidth - 57, 15)

  // ===== MAIN CONTENT =====
  let y = 28

  // Title and status badge
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(BRAND_DARK)
  doc.text("ESKOM CEMS FILE", margin, y)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor("#5A6A8A")
  doc.text("Household Electrification Registration — Authenticated Record", margin, y + 4.5)

  // Status badge
  doc.setFillColor(BRAND_GREEN)
  doc.roundedRect(pageWidth - margin - 50, y - 3, 48, 7, 2, 2, "F")
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor("#FFFFFF")
  doc.text("✓ AUTHENTICATED", pageWidth - margin - 26, y + 1.5, { align: "center" })

  y += 16

  // ===== SECTION 1: IDENTITY VERIFICATION =====
  doc.setFillColor(BRAND_BLUE)
  doc.rect(0, y - 4, pageWidth, 6, "F")
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor("#FFFFFF")
  doc.text("1. IDENTITY VERIFICATION", margin, y)

  y += 12

  // Three capture boxes
  const boxWidth = 55
  const boxHeight = 20
  const boxStartX = margin
  const boxGapX = 4

  const captureLabels = ["ID DOCUMENT — FRONT", "ID DOCUMENT — BACK", "VERIFICATION SELFIE"]

  captureLabels.forEach((label, index) => {
    const boxX = boxStartX + index * (boxWidth + boxGapX)

    doc.setDrawColor("#D6E0F0")
    doc.setLineWidth(0.5)
    doc.rect(boxX, y, boxWidth, boxHeight)

    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(BRAND_DARK)
    doc.text(label, boxX + 3, y + 5, { maxWidth: boxWidth - 6 })

    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(BRAND_GREEN)
    doc.text("✓ CAPTURED", boxX + 3, y + 15)
  })

  y += boxHeight + 10

  // ===== SECTION 2: PERSONAL DETAILS =====
  doc.setFillColor(BRAND_BLUE)
  doc.rect(0, y - 4, pageWidth, 6, "F")
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor("#FFFFFF")
  doc.text("2. PERSONAL DETAILS", margin, y)

  y += 10

  const col1X = margin
  const col2X = margin + 105

  drawLabelValue(doc, "FULL NAME", household.fullName, col1X, y, true)
  drawLabelValue(doc, "SOUTH AFRICAN ID NUMBER", household.idNumber, col2X, y, true)
  y += 12

  drawLabelValue(doc, "DATE OF BIRTH", household.dob || "—", col1X, y)
  drawLabelValue(doc, "GENDER", household.gender || "—", col2X, y)
  y += 12

  drawLabelValue(doc, "CELLPHONE NUMBER", household.cellphone, col1X, y)
  drawLabelValue(doc, "ALTERNATIVE NUMBER", household.altPhone || "—", col2X, y)

  y += 14

  // ===== SECTION 3: ADDRESS & METER DETAILS =====
  doc.setFillColor(BRAND_BLUE)
  doc.rect(0, y - 4, pageWidth, 6, "F")
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor("#FFFFFF")
  doc.text("3. ADDRESS & METER DETAILS", margin, y)

  y += 10

  drawLabelValue(doc, "STREET ADDRESS", household.address, col1X, y)
  y += 12

  drawLabelValue(doc, "SUBURB", household.suburb, col1X, y)
  drawLabelValue(doc, "AREA / DISTRICT", household.area, col2X, y)
  y += 12

  drawLabelValue(doc, "PROVINCE", household.province || "—", col1X, y)
  drawLabelValue(doc, "POSTAL CODE", household.postalCode || "—", col2X, y)
  y += 12

  drawLabelValue(doc, "ALLOCATED METER NUMBER", household.meterNumber, col1X, y)
  drawLabelValue(doc, "PROJECT NAME", project.name, col2X, y)

  y += 14

  // ===== SECTION 4: VERIFICATION & AUTHENTICATION RECORD =====
  doc.setFillColor(BRAND_BLUE)
  doc.rect(0, y - 4, pageWidth, 6, "F")
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor("#FFFFFF")
  doc.text("4. VERIFICATION & AUTHENTICATION RECORD", margin, y)

  y += 10

  drawLabelValue(doc, "DATE SUBMITTED (BY RESIDENT)", household.submittedAt, col1X, y)
  drawLabelValue(doc, "REFERENCE NUMBER", household.refNo, col2X, y)
  y += 12

  drawLabelValue(doc, "AUTHENTICATED BY (PROJECT COORDINATOR)", admin.name, col1X, y)
  drawLabelValue(doc, "DATE AUTHENTICATED", household.authenticatedAt || "—", col2X, y)

  y += 14

  // ===== SECTION 5: DECLARATION & SIGN-OFF =====
  doc.setFillColor(BRAND_BLUE)
  doc.rect(0, y - 4, pageWidth, 6, "F")
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor("#FFFFFF")
  doc.text("5. DECLARATION & SIGN-OFF", margin, y)

  y += 10

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor("#1A1A2E")
  const declarationText =
    "I, the undersigned resident, confirm that the information captured above was provided by me, is true and correct, and relates to the household and meter referenced in this document. I confirm my identity was verified in person by an authorised Eskom Project Coordinator."
  doc.text(declarationText, margin, y, { maxWidth: pageWidth - margin * 2 })

  y += 26

  // Signature boxes - with rounded corners and proper spacing
  const sigBoxWidth = (pageWidth - margin * 2 - 10) / 2
  const sigBoxHeight = 32
  const boxGap = 10

  // Box 1: GENERAL USER (Resident)
  doc.setDrawColor("#B3D9E8")
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, y, sigBoxWidth, sigBoxHeight, 3, 3)

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(BRAND_BLUE)
  doc.text("GENERAL USER (Resident)", margin + 4, y + 4)

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor("#1A1A2E")
  doc.text(`Name: ${household.fullName}`, margin + 4, y + 9)

  doc.setLineWidth(0.3)
  doc.setDrawColor("#5A6A8A")
  doc.line(margin + 4, y + 14, margin + sigBoxWidth - 4, y + 14)
  doc.setFontSize(7)
  doc.setTextColor("#5A6A8A")
  doc.text("Signature", margin + 4, y + 16)

  doc.line(margin + 4, y + 22, margin + sigBoxWidth - 4, y + 22)
  doc.text("Date", margin + 4, y + 24)

  // Box 2: PROJECT COORDINATOR / MANAGER
  const box2X = margin + sigBoxWidth + boxGap
  doc.setDrawColor("#B3D9E8")
  doc.setLineWidth(0.5)
  doc.roundedRect(box2X, y, sigBoxWidth, sigBoxHeight, 3, 3)

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(BRAND_BLUE)
  doc.text("PROJECT COORDINATOR / MANAGER", box2X + 4, y + 4)

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor("#1A1A2E")
  doc.text(`Name: ${admin.name}`, box2X + 4, y + 9)

  doc.setLineWidth(0.3)
  doc.setDrawColor("#5A6A8A")
  doc.line(box2X + 4, y + 14, box2X + sigBoxWidth - 4, y + 14)
  doc.setFontSize(7)
  doc.setTextColor("#5A6A8A")
  doc.text("Signature", box2X + 4, y + 16)

  doc.line(box2X + 4, y + 22, box2X + sigBoxWidth - 4, y + 22)
  doc.text("Date", box2X + 4, y + 24)

  // ===== FOOTER =====
  const footerY = pageHeight - 14

  doc.setDrawColor(BRAND_BLUE)
  doc.setLineWidth(0.3)
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4)

  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor("#5A6A8A")
  const footerText =
    "This document is system-generated by the Eskom CEMS and is valid only once both signatures above are completed in person."
  doc.text(footerText, margin, footerY, { maxWidth: pageWidth - margin * 2 })

  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(BRAND_DARK)
  doc.text(
    "Eskom Holdings SOC Ltd | Community Electrification Management System | CONFIDENTIAL",
    margin,
    pageHeight - 5
  )

  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor("#5A6A8A")
  doc.text(`Generated: ${new Date().toLocaleString("en-ZA")}`, pageWidth - margin, pageHeight - 5, {
    align: "right",
  })


  return doc
}
