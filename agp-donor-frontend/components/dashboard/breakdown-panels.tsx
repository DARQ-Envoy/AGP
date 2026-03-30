"use client"

import { useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import { cn } from "@/lib/utils"

const segmentData = [
  { name: "Major Gifts", value: 45, amount: 111825 },
  { name: "Mid-Level", value: 30, amount: 74550 },
  { name: "Lapsed", value: 15, amount: 37275 },
  { name: "New Donors", value: 10, amount: 24850 },
]

const campaignData = [
  { name: "Year End Appeal", amount: 82000 },
  { name: "Spring Campaign", amount: 61000 },
  { name: "Giving Tuesday", amount: 44000 },
  { name: "Monthly Giving", amount: 35500 },
  { name: "Emergency Fund", amount: 26000 },
]

const channelData = [
  { name: "Email", amount: 98000 },
  { name: "Direct Mail", amount: 72500 },
  { name: "Web", amount: 48000 },
  { name: "Phone", amount: 30000 },
]

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

type BreakdownType = "segment" | "campaign" | "channel" | "region"

interface BreakdownItem {
  label: string
  total: number
  count: number
  average: number
}

interface BreakdownPanelsProps {
  isEmpty?: boolean
  breakdown?: {
    bySegment: BreakdownItem[]
    byCampaign: BreakdownItem[]
    byChannel: BreakdownItem[]
    byRegion: BreakdownItem[]
  }
}

export function BreakdownPanels({ isEmpty, breakdown }: BreakdownPanelsProps) {
  const [leftPanel, setLeftPanel] = useState<BreakdownType>("segment")
  const [rightPanel, setRightPanel] = useState<BreakdownType>("campaign")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const TabSelector = ({
    value,
    onChange,
    exclude,
  }: {
    value: BreakdownType
    onChange: (v: BreakdownType) => void
    exclude?: BreakdownType
  }) => (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      {(["segment", "campaign", "channel", "region"] as const)
        .filter((t) => t !== exclude)
        .map((type) => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize",
              value === type
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground hover:text-card-foreground"
            )}
          >
            {type}
          </button>
        ))}
    </div>
  )

  const getActiveSegmentData = () => {
    if (breakdown?.bySegment && breakdown.bySegment.length > 0) {
      const totalAmount = breakdown.bySegment.reduce((sum, item) => sum + item.total, 0)
      return breakdown.bySegment.map((item) => ({
        name: item.label,
        value: totalAmount > 0 ? Math.round((item.total / totalAmount) * 100) : 0,
        amount: item.total,
      }))
    }
    return segmentData
  }

  const getActiveBarData = (type: "campaign" | "channel" | "region") => {
    if (breakdown) {
      const source =
        type === "campaign"
          ? breakdown.byCampaign
          : type === "channel"
            ? breakdown.byChannel
            : breakdown.byRegion
      if (source && source.length > 0) {
        return source.map((item) => ({ name: item.label, amount: item.total }))
      }
    }
    return type === "campaign" ? campaignData : channelData
  }

  const renderSegmentChart = () => {
    const activeData = getActiveSegmentData()
    return (
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={activeData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {activeData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {activeData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-card-foreground">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderHorizontalBarChart = (data: { name: string; amount: number }[]) => (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          width={100}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload
              return (
                <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                  <p className="text-sm font-medium text-popover-foreground">
                    {data.name}: {formatCurrency(data.amount)}
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderPanelContent = (type: BreakdownType) => {
    if (isEmpty) {
      return (
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      )
    }

    switch (type) {
      case "segment":
        return renderSegmentChart()
      case "campaign":
        return renderHorizontalBarChart(getActiveBarData("campaign"))
      case "channel":
        return renderHorizontalBarChart(getActiveBarData("channel"))
      case "region":
        return renderHorizontalBarChart(getActiveBarData("region"))
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">
            Breakdown by {leftPanel.charAt(0).toUpperCase() + leftPanel.slice(1)}
          </h3>
          <TabSelector value={leftPanel} onChange={setLeftPanel} exclude={rightPanel} />
        </div>
        {renderPanelContent(leftPanel)}
      </div>

      {/* Right Panel */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">
            Breakdown by {rightPanel.charAt(0).toUpperCase() + rightPanel.slice(1)}
          </h3>
          <TabSelector value={rightPanel} onChange={setRightPanel} exclude={leftPanel} />
        </div>
        {renderPanelContent(rightPanel)}
      </div>
    </div>
  )
}
