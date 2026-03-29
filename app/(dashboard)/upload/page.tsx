"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, AlertCircle, ChevronDown, ChevronUp, X } from "lucide-react"
import { TopBar } from "@/components/dashboard/top-bar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DonorRow {
  donor_id: string
  donor_name: string
  segment: string
  gift_date: string
  gift_amount: number
  campaign: string
  channel: string
  region: string
}

interface BadRow {
  rowNumber: number
  data: Partial<DonorRow>
  reason: string
}

// Mock data for demonstration
const mockValidRows: DonorRow[] = [
  { donor_id: "D001", donor_name: "John Smith", segment: "Major Gifts", gift_date: "2026-01-15", gift_amount: 5000, campaign: "Year End Appeal", channel: "Email", region: "Northeast" },
  { donor_id: "D002", donor_name: "Sarah Johnson", segment: "Mid-Level", gift_date: "2026-01-18", gift_amount: 500, campaign: "Spring Campaign", channel: "Direct Mail", region: "Midwest" },
  { donor_id: "D003", donor_name: "Michael Brown", segment: "New Donors", gift_date: "2026-02-01", gift_amount: 100, campaign: "Giving Tuesday", channel: "Web", region: "West" },
  { donor_id: "D004", donor_name: "Emily Davis", segment: "Major Gifts", gift_date: "2026-02-10", gift_amount: 10000, campaign: "Year End Appeal", channel: "Phone", region: "Southeast" },
  { donor_id: "D005", donor_name: "Robert Wilson", segment: "Lapsed", gift_date: "2026-02-15", gift_amount: 250, campaign: "Spring Campaign", channel: "Email", region: "Northeast" },
  { donor_id: "D006", donor_name: "Jennifer Lee", segment: "Mid-Level", gift_date: "2026-02-20", gift_amount: 750, campaign: "Monthly Giving", channel: "Web", region: "West" },
  { donor_id: "D007", donor_name: "David Martinez", segment: "New Donors", gift_date: "2026-03-01", gift_amount: 50, campaign: "Emergency Fund", channel: "Email", region: "Southwest" },
  { donor_id: "D008", donor_name: "Lisa Anderson", segment: "Major Gifts", gift_date: "2026-03-05", gift_amount: 7500, campaign: "Year End Appeal", channel: "Direct Mail", region: "Midwest" },
  { donor_id: "D009", donor_name: "James Taylor", segment: "Mid-Level", gift_date: "2026-03-10", gift_amount: 400, campaign: "Spring Campaign", channel: "Phone", region: "Northeast" },
  { donor_id: "D010", donor_name: "Amanda White", segment: "New Donors", gift_date: "2026-03-15", gift_amount: 75, campaign: "Giving Tuesday", channel: "Web", region: "Southeast" },
]

const mockBadRows: BadRow[] = [
  { rowNumber: 45, data: { donor_id: "D045", donor_name: "Invalid User", segment: "Major Gifts", gift_date: "2026-01-15", campaign: "Year End", channel: "Email", region: "West" }, reason: "Missing gift_amount" },
  { rowNumber: 112, data: { donor_id: "D112", donor_name: "Test Donor", segment: "Mid-Level", gift_date: "invalid-date", gift_amount: 500, campaign: "Spring", channel: "Web", region: "East" }, reason: "Invalid date format" },
  { rowNumber: 178, data: { donor_id: "D178", donor_name: "Bad Amount", segment: "New Donors", gift_date: "2026-02-20", gift_amount: NaN, campaign: "Emergency", channel: "Phone", region: "South" }, reason: "Non-numeric amount" },
]

type Stage = "upload" | "preview"

export default function UploadPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>("upload")
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showBadRows, setShowBadRows] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  const validRows = mockValidRows
  const badRows = mockBadRows
  const totalRows = validRows.length + badRows.length

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile?.type === "text/csv" || droppedFile?.name.endsWith(".csv")) {
      setFile(droppedFile)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }, [])

  const handleParse = async () => {
    setIsLoading(true)
    // Simulate parsing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setStage("preview")
  }

  const handleDiscard = () => {
    setFile(null)
    setStage("upload")
    setCurrentPage(1)
    setShowBadRows(false)
  }

  const handleCommit = async () => {
    setIsLoading(true)
    // Simulate commit delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/dashboard")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatCurrency = (value: number) => {
    if (isNaN(value)) return "—"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Upload Data" />

      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {stage === "upload" ? (
          <div className="space-y-6">
            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Drag and drop your CSV here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse files
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported format: .csv only
                </p>
              </div>
            </div>

            {/* File selected */}
            {file && (
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleParse} disabled={isLoading}>
                      {isLoading ? "Parsing..." : "Parse file"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary bar */}
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-6 text-sm">
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{totalRows}</span> rows found
                </span>
                <span className="text-muted-foreground">
                  <span className="font-semibold text-success">{validRows.length}</span> valid
                </span>
                <span className="text-muted-foreground">
                  <span className="font-semibold text-destructive">{badRows.length}</span> rows flagged
                </span>
              </div>
            </div>

            {/* Valid rows table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-card-foreground">Valid Rows</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Donor ID</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Donor Name</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Segment</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Gift Date</th>
                      <th className="text-right font-medium text-muted-foreground px-4 py-3">Gift Amount</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Campaign</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Channel</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Region</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validRows
                      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                      .map((row, index) => (
                        <tr
                          key={row.donor_id}
                          className={cn(
                            "border-b border-border last:border-0",
                            index % 2 === 0 ? "bg-card" : "bg-muted/30"
                          )}
                        >
                          <td className="px-4 py-3 text-card-foreground">{row.donor_id}</td>
                          <td className="px-4 py-3 text-card-foreground">{row.donor_name}</td>
                          <td className="px-4 py-3 text-card-foreground">{row.segment}</td>
                          <td className="px-4 py-3 text-card-foreground">{row.gift_date}</td>
                          <td className="px-4 py-3 text-card-foreground text-right">{formatCurrency(row.gift_amount)}</td>
                          <td className="px-4 py-3 text-card-foreground">{row.campaign}</td>
                          <td className="px-4 py-3 text-card-foreground">{row.channel}</td>
                          <td className="px-4 py-3 text-card-foreground">{row.region}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {validRows.length > rowsPerPage && (
                <div className="p-4 border-t border-border flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * rowsPerPage + 1}-
                    {Math.min(currentPage * rowsPerPage, validRows.length)} of {validRows.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(Math.ceil(validRows.length / rowsPerPage), p + 1)
                        )
                      }
                      disabled={currentPage >= Math.ceil(validRows.length / rowsPerPage)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Bad rows panel */}
            {badRows.length > 0 && (
              <div className="bg-destructive/5 rounded-lg border border-destructive/20 overflow-hidden">
                <button
                  onClick={() => setShowBadRows(!showBadRows)}
                  className="w-full p-4 flex items-center justify-between hover:bg-destructive/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <span className="font-semibold text-card-foreground">
                      {badRows.length} Flagged Rows
                    </span>
                  </div>
                  {showBadRows ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {showBadRows && (
                  <div className="border-t border-destructive/20 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-destructive/20 bg-destructive/5">
                          <th className="text-left font-medium text-muted-foreground px-4 py-3">Row</th>
                          <th className="text-left font-medium text-muted-foreground px-4 py-3">Donor ID</th>
                          <th className="text-left font-medium text-muted-foreground px-4 py-3">Donor Name</th>
                          <th className="text-left font-medium text-muted-foreground px-4 py-3">Gift Amount</th>
                          <th className="text-left font-medium text-destructive px-4 py-3">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {badRows.map((row) => (
                          <tr
                            key={row.rowNumber}
                            className="border-b border-destructive/20 last:border-0 bg-destructive/5"
                          >
                            <td className="px-4 py-3 text-card-foreground">{row.rowNumber}</td>
                            <td className="px-4 py-3 text-card-foreground">{row.data.donor_id}</td>
                            <td className="px-4 py-3 text-card-foreground">{row.data.donor_name}</td>
                            <td className="px-4 py-3 text-card-foreground">
                              {row.data.gift_amount !== undefined
                                ? formatCurrency(row.data.gift_amount)
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-destructive font-medium">{row.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={handleDiscard}>
                Discard
              </Button>
              <Button onClick={handleCommit} disabled={isLoading}>
                {isLoading ? "Committing..." : "Commit Data"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
