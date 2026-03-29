import Link from "next/link"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyStateBanner() {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">No data yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload your donor CSV to get started with insights.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/upload">Upload Data</Link>
        </Button>
      </div>
    </div>
  )
}
