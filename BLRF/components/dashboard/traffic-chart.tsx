"use client"

import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { TrafficZone } from "@/lib/traffic-data"

interface TrafficChartProps {
  zones: TrafficZone[]
}

export function TrafficChart({ zones }: TrafficChartProps) {
  // Fetch hourly data from SQLite Database via FastAPI
  const [hourlyData, setHourlyData] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const fetchHistory = async () => {
      try {
        const response = await fetch("http://localhost:8000/traffic/history")
        if (response.ok) {
          setHourlyData(await response.json())
        }
      } catch (error) {
        console.error("Failed to fetch traffic history:", error)
      }
    }

    fetchHistory()
    // Refresh chart periodically
    const interval = setInterval(fetchHistory, 60000)
    return () => clearInterval(interval)
  }, [])

  // Zone speed comparison
  const zoneSpeedData = useMemo(() => {
    return zones.map(zone => ({
      zone: zone.zone.slice(0, 8),
      speed: zone.speed,
      fill: zone.congestion === "Critical"
        ? "#dc2626"
        : zone.congestion === "High"
          ? "#ef4444"
          : zone.congestion === "Medium"
            ? "#f59e0b"
            : "#10b981"
    }))
  }, [zones])

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Traffic Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Speed over time chart */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Speed Trend (Today)</p>
          <div className="h-[120px] w-full min-w-0">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value} km/h`, 'Speed']}
                  />
                  <Area
                    type="monotone"
                    dataKey="speed"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#speedGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Zone Speed Bars */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Current Zone Speeds</p>
          <div className="space-y-2">
            {zoneSpeedData.slice(0, 5).map((zone, index) => (
              <motion.div
                key={zone.zone}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2"
              >
                <span className="w-16 text-xs text-muted-foreground truncate">{zone.zone}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(zone.speed / 60) * 100}%` }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: zone.fill }}
                  />
                </div>
                <span className="w-12 text-xs font-medium text-foreground text-right">
                  {zone.speed} km/h
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
