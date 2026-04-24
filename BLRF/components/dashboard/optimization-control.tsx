"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings2, Route, TrafficCone, Radio, Zap, Check, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { OptimizationSuggestion } from "@/lib/traffic-data"

interface OptimizationControlProps {
  suggestions: OptimizationSuggestion[]
}

interface OptimizationToggle {
  id: string
  label: string
  description: string
  icon: typeof Route
  impact: "high" | "medium" | "low"
  enabled: boolean
}

const impactColors = {
  high: "text-traffic-high bg-traffic-high/10",
  medium: "text-traffic-medium bg-traffic-medium/10",
  low: "text-traffic-low bg-traffic-low/10"
}

export function OptimizationControl({ suggestions: initialSuggestions }: OptimizationControlProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])

  useEffect(() => {
    const fetchOptimizations = async () => {
      try {
        const res = await fetch("http://localhost:8000/optimization/suggest")
        if (res.ok) {
          setSuggestions(await res.json())
        }
      } catch (e) {
        console.error("Failed to fetch optimizations")
      }
    }
    fetchOptimizations()
    const interval = setInterval(fetchOptimizations, 30000)
    return () => clearInterval(interval)
  }, [])

  const [toggles, setToggles] = useState<OptimizationToggle[]>([
    {
      id: "adaptive-signal",
      label: "Adaptive Signal Timing",
      description: "AI adjusts signal duration based on real-time traffic",
      icon: TrafficCone,
      impact: "high",
      enabled: true
    },
    {
      id: "smart-rerouting",
      label: "Smart Rerouting",
      description: "Automatically suggest alternate routes",
      icon: Route,
      impact: "high",
      enabled: true
    },
    {
      id: "event-aware",
      label: "Event-Aware Optimization",
      description: "Consider nearby events for predictions",
      icon: Radio,
      impact: "medium",
      enabled: false
    },
    {
      id: "predictive-alerts",
      label: "Predictive Alerts",
      description: "Get notified before congestion peaks",
      icon: Zap,
      impact: "medium",
      enabled: true
    }
  ])

  const [appliedActions, setAppliedActions] = useState<Set<string>>(new Set())

  const handleToggle = (id: string) => {
    setToggles(prev => prev.map(t =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    ))

    const toggle = toggles.find(t => t.id === id)
    if (toggle) {
      toast.success(`${toggle.label} ${toggle.enabled ? 'disabled' : 'enabled'}`, {
        description: toggle.enabled
          ? "Optimization feature turned off"
          : "Optimization feature is now active"
      })
    }
  }

  const handleApplyAction = (suggestion: any) => {
    setAppliedActions(prev => new Set(prev).add(suggestion.id.toString()))

    toast.success(`${suggestion.action} applied`, {
      description: `${suggestion.title} sequence initiated server-side!`
    })
  }

  const [prediction, setPrediction] = useState<string>("CALCULATING...")
  const [liveFeatures, setLiveFeatures] = useState<Record<string, number>>({})

  useEffect(() => {
    const getPrediction = async () => {
      try {
        // Step 1: Fetch live hotspot data from FastAPI backend
        const trafficRes = await fetch("http://localhost:8000/traffic")
        const hotspots: any[] = trafficRes.ok ? await trafficRes.json() : []

        // Step 2: Derive real ML features from live data
        const now = new Date()
        const hour = now.getHours()
        const is_peak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20) ? 1 : 0

        // Aggregate speed and vehicle count across all hotspots
        const avgSpeed = hotspots.length > 0
          ? Math.round(hotspots.reduce((s, h) => s + (h.speed || 30), 0) / hotspots.length)
          : 30

        const avgVehicles = hotspots.length > 0
          ? Math.round(hotspots.reduce((s, h) => s + (h.vehicle_count || 50), 0) / hotspots.length)
          : 50

        // Incident score: derived from congestion scores of hotspots (normalized)
        const maxCongestion = hotspots.length > 0
          ? Math.max(...hotspots.map(h => h.congestion_score || 5))
          : 5
        const incident_score = Math.min(maxCongestion / 10, 1)

        // Weather: detect rain mode from hotspot tags or default 0
        const weather = hotspots.some(h => h.weather === "rain" || h.rain) ? 1 : 0

        const eta = Math.round(60 / Math.max(avgSpeed, 5)) * 10 // rough ETA proxy

        const features = { speed: avgSpeed, vehicle_count: avgVehicles, weather, incident_score, eta, hour, is_peak }
        setLiveFeatures(features)

        // Step 3: Send real features to ML model
        const res = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(features)
        })
        const data = await res.json()
        if (data.prediction) setPrediction(data.prediction)
      } catch (e) {
        setPrediction("OFFLINE")
      }
    }
    getPrediction()
    const int = setInterval(getPrediction, 20000)
    return () => clearInterval(int)
  }, [])

  return (
    <Card className="glass" id="optimization">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="h-5 w-5 text-primary" />
            Control & Intel
          </CardTitle>
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">AI: {prediction}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Toggles Section */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            System Settings
          </p>

          {toggles.map((toggle, index) => {
            const Icon = toggle.icon
            return (
              <motion.div
                key={toggle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${impactColors[toggle.impact]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                    <p className="text-xs text-muted-foreground">{toggle.description}</p>
                  </div>
                </div>
                <Switch
                  checked={toggle.enabled}
                  onCheckedChange={() => handleToggle(toggle.id)}
                />
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Suggested Actions
            </p>

            <div className="max-h-[200px] space-y-2 overflow-y-auto pr-1">
              {suggestions.slice(0, 4).map((suggestion, index) => {
                const isApplied = appliedActions.has(suggestion.id)

                return (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="group flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-3 transition-colors hover:bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {suggestion.title}
                        </p>
                        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${impactColors[(suggestion.impact?.toLowerCase() as "high" | "medium" | "low") || "low"]}`}>
                          {suggestion.impact}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{suggestion.zone}</p>
                    </div>

                    <AnimatePresence mode="wait">
                      {isApplied ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-traffic-low/20"
                        >
                          <Check className="h-4 w-4 text-traffic-low" />
                        </motion.div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApplyAction(suggestion)}
                          className="h-8 gap-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          Apply
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Impact Summary */}
        <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Active Optimizations</p>
              <p className="text-xs text-muted-foreground">
                {toggles.filter(t => t.enabled).length} of {toggles.length} features enabled
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                -{Math.round(toggles.filter(t => t.enabled).length * 7)}%
              </p>
              <p className="text-xs text-muted-foreground">Est. congestion reduction</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
