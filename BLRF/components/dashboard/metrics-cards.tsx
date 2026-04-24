"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Gauge, Car, AlertTriangle, TrendingUp, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { TrafficZone } from "@/lib/traffic-data"

interface MetricsCardsProps {
  zones: TrafficZone[]
}

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const previousValue = useRef(0)

  useEffect(() => {
    const startValue = previousValue.current
    const startTime = Date.now()
    const endTime = startTime + duration

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.round(startValue + (value - startValue) * easeProgress)
      
      setDisplayValue(currentValue)

      if (now < endTime) {
        requestAnimationFrame(animate)
      } else {
        previousValue.current = value
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return <span>{displayValue}</span>
}

export function MetricsCards({ zones }: MetricsCardsProps) {
  const avgSpeed = Math.round(zones.reduce((acc, z) => acc + z.speed, 0) / zones.length)
  const totalVehicles = zones.reduce((acc, z) => acc + z.vehicles, 0)
  const riskZones = zones.filter(z => z.risk).length
  const criticalZones = zones.filter(z => z.congestion === "High" || z.congestion === "Critical").length

  const metrics = [
    {
      title: "Avg. Speed",
      value: avgSpeed,
      unit: "km/h",
      icon: Gauge,
      change: avgSpeed > 25 ? "+2.5%" : "-3.2%",
      positive: avgSpeed > 25,
      color: "from-emerald-500 to-teal-600",
      bgGlow: "bg-emerald-500/20"
    },
    {
      title: "Vehicle Density",
      value: totalVehicles,
      unit: "vehicles",
      icon: Car,
      change: totalVehicles < 500 ? "-5.2%" : "+8.1%",
      positive: totalVehicles < 500,
      color: "from-blue-500 to-indigo-600",
      bgGlow: "bg-blue-500/20"
    },
    {
      title: "Risk Zones",
      value: riskZones,
      unit: "active",
      icon: AlertTriangle,
      change: riskZones === 0 ? "None" : `+${riskZones}`,
      positive: riskZones === 0,
      color: "from-amber-500 to-orange-600",
      bgGlow: "bg-amber-500/20"
    },
    {
      title: "Critical Areas",
      value: criticalZones,
      unit: "zones",
      icon: Zap,
      change: criticalZones <= 2 ? "stable" : "elevated",
      positive: criticalZones <= 2,
      color: "from-red-500 to-rose-600",
      bgGlow: "bg-red-500/20"
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
        >
          <Card className="glass group relative overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
            {/* Background Glow */}
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${metric.bgGlow} blur-2xl opacity-0 transition-opacity group-hover:opacity-100`} />
            
            <CardContent className="relative p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-muted-foreground">{metric.title}</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <motion.span 
                      className="text-2xl font-bold tabular-nums text-foreground lg:text-3xl"
                      key={metric.value}
                    >
                      <AnimatedNumber value={metric.value} />
                    </motion.span>
                    <span className="text-xs text-muted-foreground">{metric.unit}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1">
                    <span
                      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        metric.positive 
                          ? "bg-traffic-low/10 text-traffic-low" 
                          : "bg-traffic-high/10 text-traffic-high"
                      }`}
                    >
                      {metric.change}
                    </span>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${metric.color} shadow-lg`}
                >
                  <metric.icon className="h-5 w-5 text-white" />
                </motion.div>
              </div>
              
              {/* Mini Progress Bar */}
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.min(100, (metric.value / (index === 1 ? 800 : index === 0 ? 60 : 8)) * 100)}%` 
                  }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                  className={`h-full rounded-full bg-gradient-to-r ${metric.color}`}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
