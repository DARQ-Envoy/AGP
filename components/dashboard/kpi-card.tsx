import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  label: string
  value: string
  trend?: {
    value: number
    isPositive: boolean
  }
  isEmpty?: boolean
}

export function KpiCard({ label, value, trend, isEmpty }: KpiCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
      <p className={cn(
        "text-3xl font-bold tracking-tight",
        isEmpty ? "text-muted-foreground" : "text-card-foreground"
      )}>
        {isEmpty ? "—" : value}
      </p>
      {trend && !isEmpty && (
        <div className={cn(
          "flex items-center gap-1 mt-2 text-sm font-medium",
          trend.isPositive ? "text-success" : "text-destructive"
        )}>
          {trend.isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>{trend.value}% MoM</span>
        </div>
      )}
    </div>
  )
}
