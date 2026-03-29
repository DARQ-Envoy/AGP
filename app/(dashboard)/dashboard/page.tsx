"use client"

import { useState } from "react"
import { TopBar } from "@/components/dashboard/top-bar"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { GiftsChart } from "@/components/dashboard/gifts-chart"
import { BreakdownPanels } from "@/components/dashboard/breakdown-panels"
import { EmptyStateBanner } from "@/components/dashboard/empty-state-banner"

// Toggle this to see empty state vs populated state
const HAS_DATA = true

const kpiData = [
  {
    label: "Total Raised",
    value: "$248,500",
    trend: { value: 12, isPositive: true },
  },
  {
    label: "Average Gift",
    value: "$124.25",
    trend: { value: 3, isPositive: true },
  },
  {
    label: "Donor Count",
    value: "2,001",
    trend: { value: 5, isPositive: true },
  },
  {
    label: "Retention Rate",
    value: "68.4%",
    trend: { value: 2, isPositive: false },
  },
]

export default function DashboardPage() {
  const [hasData] = useState(HAS_DATA)

  return (
    <div className="min-h-screen">
      <TopBar
        title="Dashboard"
        lastUpload={hasData ? "March 28, 2026" : undefined}
      />

      <div className="p-6 md:p-8 space-y-6">
        {!hasData && <EmptyStateBanner />}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              trend={kpi.trend}
              isEmpty={!hasData}
            />
          ))}
        </div>

        {/* Gifts Over Time Chart */}
        <GiftsChart isEmpty={!hasData} />

        {/* Breakdown Panels */}
        <BreakdownPanels isEmpty={!hasData} />
      </div>
    </div>
  )
}
