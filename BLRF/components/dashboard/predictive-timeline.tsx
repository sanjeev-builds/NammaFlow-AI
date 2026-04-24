"use client"

import { motion } from "framer-motion"
import { Clock, TrendingUp, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TrafficZone, CongestionLevel } from "@/lib/traffic-data"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Area,
  ComposedChart
} from "recharts"

interface PredictiveTimelineProps {
  zones: TrafficZone[]
  selectedZone?: TrafficZone | null
}

const congestionToValue = (level: CongestionLevel): number => {
  switch (level) {
    case "Low": return 1
    case "Medium": return 2
    case "High": return 3
    case "Critical": return 4
  }
}

const getCongestionColor = (level: CongestionLevel): string => {
  switch (level) {
    case "Low": return "text-traffic-low"
    case "Medium": return "text-traffic-medium"
    case "High": return "text-traffic-high"
    case "Critical": return "text-destructive"
  }
}

const getCongestionBg = (level: CongestionLevel): string => {
  switch (level) {
    case "Low": return "bg-traffic-low"
    case "Medium": return "bg-traffic-medium"
    case "High": return "bg-traffic-high"
    case "Critical": return "bg-destructive"
  }
}

export function PredictiveTimeline({ zones, selectedZone }: PredictiveTimelineProps) {
  const displayZones = selectedZone ? [selectedZone] : zones.filter(z => z.risk || z.congestion === "High" || z.congestion === "Critical").slice(0, 3)

  const chartData = displayZones.map(zone => ({
    zone: zone.zone,
    now: congestionToValue(zone.prediction.now),
    plus15: congestionToValue(zone.prediction.plus15),
    plus30: congestionToValue(zone.prediction.plus30),
    prediction: zone.prediction
  }))

  const timelineChartData = [
    { time: "Now", ...Object.fromEntries(displayZones.map(z => [z.zone, congestionToValue(z.prediction.now)])) },
    { time: "+15 min", ...Object.fromEntries(displayZones.map(z => [z.zone, congestionToValue(z.prediction.plus15)])) },
    { time: "+30 min", ...Object.fromEntries(displayZones.map(z => [z.zone, congestionToValue(z.prediction.plus30)])) },
  ]

  const colors = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Predictive Timeline
          {selectedZone && (
            <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
              {selectedZone.zone}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart */}
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timelineChartData}>
              <defs>
                {displayZones.map((zone, i) => (
                  <linearGradient key={zone.id} id={`gradient-${zone.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 4]}
                ticks={[1, 2, 3, 4]}
                tickFormatter={(v) => ["", "Low", "Med", "High", "Crit"][v]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [["", "Low", "Medium", "High", "Critical"][value], "Level"]}
              />
              {displayZones.map((zone, i) => (
                <Area
                  key={`area-${zone.id}`}
                  type="monotone"
                  dataKey={zone.zone}
                  stroke={colors[i % colors.length]}
                  fill={`url(#gradient-${zone.id})`}
                  strokeWidth={2}
                />
              ))}
              {displayZones.map((zone, i) => (
                <Line
                  key={`line-${zone.id}`}
                  type="monotone"
                  dataKey={zone.zone}
                  stroke={colors[i % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[i % colors.length], strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Zone Timeline Cards */}
        <div className="space-y-3">
          {displayZones.map((zone, index) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-border/50 bg-secondary/30 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-foreground">{zone.zone}</span>
                {(zone.prediction.plus30 === "Critical" || zone.prediction.plus30 === "High") && (
                  <AlertTriangle className="h-4 w-4 text-traffic-high" />
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Timeline Steps */}
                {[
                  { label: "Now", value: zone.prediction.now },
                  { label: "+15m", value: zone.prediction.plus15 },
                  { label: "+30m", value: zone.prediction.plus30 }
                ].map((step, i) => (
                  <div key={step.label} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${getCongestionBg(step.value)}`}
                      >
                        <Clock className="h-3.5 w-3.5 text-white" />
                      </motion.div>
                      <span className="mt-1 text-[10px] text-muted-foreground">{step.label}</span>
                      <span className={`text-[10px] font-medium ${getCongestionColor(step.value)}`}>
                        {step.value}
                      </span>
                    </div>
                    {i < 2 && (
                      <div className="mx-1 h-0.5 flex-1 rounded-full bg-border" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
