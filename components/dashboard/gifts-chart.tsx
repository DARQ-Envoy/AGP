"use client"

import { useState } from "react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import { cn } from "@/lib/utils"

const monthlyData = [
  { period: "Jan", amount: 18500, donors: 142 },
  { period: "Feb", amount: 22000, donors: 168 },
  { period: "Mar", amount: 19800, donors: 155 },
  { period: "Apr", amount: 28500, donors: 210 },
  { period: "May", amount: 24200, donors: 185 },
  { period: "Jun", amount: 31000, donors: 238 },
  { period: "Jul", amount: 26800, donors: 198 },
  { period: "Aug", amount: 29500, donors: 220 },
  { period: "Sep", amount: 33200, donors: 248 },
  { period: "Oct", amount: 38000, donors: 285 },
  { period: "Nov", amount: 42500, donors: 315 },
  { period: "Dec", amount: 52000, donors: 402 },
]

const weeklyData = [
  { period: "Week 1", amount: 12500, donors: 95 },
  { period: "Week 2", amount: 14200, donors: 108 },
  { period: "Week 3", amount: 11800, donors: 88 },
  { period: "Week 4", amount: 13500, donors: 102 },
]

const quarterlyData = [
  { period: "Q1", amount: 60300, donors: 465 },
  { period: "Q2", amount: 83700, donors: 633 },
  { period: "Q3", amount: 89500, donors: 666 },
  { period: "Q4", amount: 132500, donors: 1002 },
]

type TimeRange = "monthly" | "weekly" | "quarterly"

interface GiftsChartProps {
  isEmpty?: boolean
}

export function GiftsChart({ isEmpty }: GiftsChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly")

  const data =
    timeRange === "monthly"
      ? monthlyData
      : timeRange === "weekly"
        ? weeklyData
        : quarterlyData

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Gifts Over Time</h3>
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {(["monthly", "weekly", "quarterly"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                timeRange === range
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-card-foreground"
              )}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium text-popover-foreground">
                        {data.period}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Amount: <span className="font-medium text-popover-foreground">{formatCurrency(data.amount)}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Donors: <span className="font-medium text-popover-foreground">{data.donors}</span>
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="amount"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
