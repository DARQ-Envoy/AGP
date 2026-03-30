"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TopBar } from "@/components/dashboard/top-bar"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { GiftsChart } from "@/components/dashboard/gifts-chart"
import { BreakdownPanels } from "@/components/dashboard/breakdown-panels"
import { EmptyStateBanner } from "@/components/dashboard/empty-state-banner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { instance } from "@/helpers/axios/axiosInstance"

interface KPIData {
  totalRaised: number
  averageGift: number
  donorCount: number
  retentionRate: number
}

interface GiftMonth {
  month: string
  total: number
}

interface BreakdownItem {
  label: string
  total: number
  count: number
  average: number
}

interface BreakdownData {
  bySegment: BreakdownItem[]
  byCampaign: BreakdownItem[]
  byChannel: BreakdownItem[]
  byRegion: BreakdownItem[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [hasData, setHasData] = useState(false)
  const [kpis, setKpis] = useState<KPIData | null>(null)
  const [giftsData, setGiftsData] = useState<{ period: string; amount: number }[]>([])
  const [breakdown, setBreakdown] = useState<BreakdownData | null>(null)
  const [uploadedAt, setUploadedAt] = useState<string | undefined>()
  const [isClearing, setIsClearing] = useState(false)

  const loadDashboard = async () => {
    setIsLoading(true)

    const [kpisResult, giftsResult, breakdownResult, donorDataResult] = await Promise.allSettled([
      instance.get('/analytics/kpis'),
      instance.get('/analytics/gifts-over-time'),
      instance.get('/analytics/breakdown'),
      instance.get('/donor-data'),
    ])

    if (donorDataResult.status === 'fulfilled') {
      setUploadedAt(donorDataResult.value.data.data?.donor_data_uploaded_at ?? undefined)
    }

    if (
      kpisResult.status === 'fulfilled' &&
      giftsResult.status === 'fulfilled' &&
      breakdownResult.status === 'fulfilled'
    ) {
      const kpiData: KPIData = kpisResult.value.data.data
      setKpis(kpiData)

      const rawGifts: GiftMonth[] = giftsResult.value.data.data
      setGiftsData(rawGifts.map((d) => ({ period: d.month, amount: d.total })))

      setBreakdown(breakdownResult.value.data.data)
      setHasData(true)
    } else {
      setHasData(false)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const handleClearData = async () => {
    setIsClearing(true)
    try {
      await instance.delete('/donor-data')
      router.push('/upload')
    } catch {
      setIsClearing(false)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const kpiCards = kpis
    ? [
        { label: "Total Raised", value: `$${kpis.totalRaised.toLocaleString()}` },
        { label: "Average Gift", value: `$${kpis.averageGift.toLocaleString()}` },
        { label: "Donor Count", value: kpis.donorCount.toLocaleString() },
        { label: "Retention Rate", value: `${kpis.retentionRate.toFixed(1)}%` },
      ]
    : [
        { label: "Total Raised", value: "—" },
        { label: "Average Gift", value: "—" },
        { label: "Donor Count", value: "—" },
        { label: "Retention Rate", value: "—" },
      ]

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <TopBar title="Dashboard" />
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-[380px] rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <TopBar
        title="Dashboard"
        lastUpload={uploadedAt ? formatDate(uploadedAt) : undefined}
      />

      <div className="p-6 md:p-8 space-y-6">
        {!hasData && <EmptyStateBanner />}

        {hasData && uploadedAt && (
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearData}
              disabled={isClearing}
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
            >
              {isClearing ? "Clearing..." : "Clear Data"}
            </Button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              isEmpty={!hasData}
            />
          ))}
        </div>

        {/* Gifts Over Time Chart */}
        <GiftsChart isEmpty={!hasData} data={giftsData} />

        {/* Breakdown Panels */}
        <BreakdownPanels isEmpty={!hasData} breakdown={breakdown ?? undefined} />
      </div>
    </div>
  )
}
