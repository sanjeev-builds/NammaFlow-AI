"use client"

import { motion } from "framer-motion"
import { Brain, Calendar, CloudRain, Clock, AlertTriangle, Construction } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TrafficZone, CongestionFactor } from "@/lib/traffic-data"

interface AIExplainabilityProps {
  zone: TrafficZone | null
}

const factorIcons = {
  event: Calendar,
  rain: CloudRain,
  peak: Clock,
  accident: AlertTriangle,
  construction: Construction
}

const factorColors = {
  event: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  rain: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  peak: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  accident: "text-red-400 bg-red-400/10 border-red-400/30",
  construction: "text-orange-400 bg-orange-400/10 border-orange-400/30"
}

export function AIExplainability({ zone }: AIExplainabilityProps) {
  if (!zone) {
    return (
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            AI Prediction Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Brain className="mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Select a zone on the map</p>
            <p className="text-sm text-muted-foreground/70">to see why AI made this prediction</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalImpact = zone.factors.reduce((sum, f) => sum + Math.abs(f.impact), 0)

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          Why {zone.congestion} Congestion?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zone Header */}
        <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
          <div>
            <p className="font-semibold text-foreground">{zone.zone}</p>
            <p className="text-xs text-muted-foreground">{zone.description}</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${
            zone.congestion === "Critical" 
              ? "bg-destructive/20 text-destructive" 
              : zone.congestion === "High"
                ? "bg-traffic-high/20 text-traffic-high"
                : zone.congestion === "Medium"
                  ? "bg-traffic-medium/20 text-traffic-medium"
                  : "bg-traffic-low/20 text-traffic-low"
          }`}>
            {zone.congestion}
          </div>
        </div>

        {/* Factors */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Contributing Factors
          </p>
          
          {zone.factors.map((factor, index) => {
            const Icon = factorIcons[factor.icon]
            const colorClass = factorColors[factor.icon]
            const percentage = Math.round((Math.abs(factor.impact) / totalImpact) * 100)
            
            return (
              <motion.div
                key={`${factor.factor}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-foreground">{factor.factor}</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    factor.impact > 0 
                      ? "bg-traffic-high/20 text-traffic-high" 
                      : "bg-traffic-low/20 text-traffic-low"
                  }`}>
                    {factor.impact > 0 ? "+" : ""}{factor.impact}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className={`h-full rounded-full ${
                      factor.impact > 25 
                        ? "bg-traffic-high" 
                        : factor.impact > 15 
                          ? "bg-traffic-medium" 
                          : "bg-traffic-low"
                    }`}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">AI Analysis: </span>
            Based on {zone.factors.length} factors, congestion level is predicted to 
            {zone.prediction.plus30 === "Critical" || zone.prediction.plus30 === "High"
              ? " increase in the next 30 minutes. Consider alternate routes."
              : " remain stable or decrease. Normal traffic expected."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
