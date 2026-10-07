"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AppSidebar } from "./app-sidebar"
import { Navbar } from "./navbar"
import { MetricsCards } from "./metrics-cards"
import { HeroMap } from "./hero-map"
import dynamic from "next/dynamic"

// Dynamic import for Leaflet map to avoid SSR issues
const RealMap = dynamic(
  () => import("./real-map").then(mod => ({ default: mod.RealMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-secondary/30">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading NammaFlow AI map...</p>
        </div>
      </div>
    )
  }
)
import { PredictiveTimeline } from "./predictive-timeline"
import { AIExplainability } from "./ai-explainability"
import { OptimizationControl } from "./optimization-control"
import { RiskZoneAlerts } from "./risk-zone-alerts"
import { AIAssistant } from "./ai-assistant"

const TrafficChart = dynamic(
  () => import("./traffic-chart").then(mod => mod.TrafficChart),
  { ssr: false }
)

import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { X, ChevronLeft, MapPin, TrendingUp, Brain, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  initialTrafficData,
  generateRandomCongestion,
  generateRandomSpeed,
  generateRandomVehicles,
  generatePredictionTimeline,
  generateFactors,
  getOptimizationSuggestions,
  getAlerts,
  type TrafficZone,
  type TrafficAlert,
  type OptimizationSuggestion,
  type SimulationEvent
} from "@/lib/traffic-data"

export function Dashboard() {
  const [zones, setZones] = useState<TrafficZone[]>(initialTrafficData)
  const [alerts, setAlerts] = useState<TrafficAlert[]>([])
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedZone, setSelectedZone] = useState<TrafficZone | null>(null)
  const [simulation, setSimulation] = useState<SimulationEvent>({
    type: "rain",
    active: false,
    affectedZones: []
  })
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [mapMode, setMapMode] = useState<"real" | "visual">("real") // "real" for Leaflet, "visual" for custom SVG

  // Client-side only time formatting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    setLastUpdateTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
  }, [])

  const updateTrafficData = useCallback(async () => {
    try {
      let liveHotspots: any[] = [];
      try {
        const res = await fetch("http://localhost:8000/traffic");
        liveHotspots = await res.json();
      } catch (e) {
        // Silent fallback to standard simulation if API is restarting
      }

      setZones((prev) =>
        prev.map((zone) => {
          let newCongestion = generateRandomCongestion()
          let newVehicles = generateRandomVehicles(newCongestion)

          // === AI PIPELINE OVERRIDE ===
          // Hijack the UX strictly using the live python network state
          const apiNode = liveHotspots.find((h: any) => h.location.toLowerCase() === zone.zone.toLowerCase() || zone.zone.toLowerCase().includes(h.location.toLowerCase()));
          if (apiNode) {
            const score = apiNode.congestion_score || 0;
            newCongestion = score >= 8 ? "Critical" : score >= 6 ? "High" : score >= 4 ? "Medium" : "Low";
            newVehicles = Math.floor(score * 12);
          }
          // ==============================

          const newSpeed = generateRandomSpeed(newCongestion)
          const isRisk = (newCongestion === "High" || newCongestion === "Critical") && Math.random() > 0.3
          const prediction = generatePredictionTimeline(newCongestion)
          const factors = generateFactors(newCongestion, simulation.active && simulation.type === "rain", false)

          // Notify if zone becomes critical
          if (zone.congestion !== "Critical" && newCongestion === "Critical") {
            toast.error(`Critical congestion in ${zone.zone}!`, {
              description: "AI is initiating emergency rerouting"
            })
          } else if (!zone.risk && isRisk) {
            toast.warning(`High congestion detected in ${zone.zone}`, {
              description: "AI is calculating alternate routes"
            })
          }

          return {
            ...zone,
            congestion: newCongestion,
            speed: newSpeed,
            vehicles: newVehicles,
            risk: isRisk,
            prediction,
            factors
          }
        })
      )
      setLastUpdateTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    } catch (e) {
      console.warn("Telemetry Fetch Engine Defaulting", e);
    }
  }, [simulation])

  // Update suggestions and alerts when zones change
  useEffect(() => {
    setAlerts(getAlerts(zones))
    setSuggestions(getOptimizationSuggestions(zones))
  }, [zones])

  // Real-time simulation - update every 5 seconds for live feel
  useEffect(() => {
    const interval = setInterval(updateTrafficData, 5000)
    return () => clearInterval(interval)
  }, [updateTrafficData])

  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add("dark")
  }, [])

  // Update selected zone when zones change
  useEffect(() => {
    if (selectedZone) {
      const updated = zones.find(z => z.id === selectedZone.id)
      if (updated) setSelectedZone(updated)
    }
  }, [zones, selectedZone])

  const handleZoneSelect = (zone: TrafficZone | null) => {
    setSelectedZone(zone)
    if (zone) {
      setRightPanelOpen(true)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <AppSidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        <Navbar alerts={alerts} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="relative flex h-[calc(100vh-64px)]">
          {/* Map Area - Full Width Hero */}
          <div className={`flex-1 transition-all duration-300 ${rightPanelOpen ? 'lg:mr-[420px]' : ''}`}>
            <div className="h-full p-4 lg:p-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
                      NammaFlow AI Command Center
                    </h1>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-traffic-low opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-traffic-low" />
                        </span>
                        Live {mounted && lastUpdateTime && `• Updated ${lastUpdateTime}`}
                      </span>
                      {simulation.active && (
                        <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
                          Simulation Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Toggle Panel Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                    className="hidden gap-1.5 lg:flex"
                  >
                    {rightPanelOpen ? (
                      <>
                        <ChevronLeft className="h-4 w-4 rotate-180" />
                        Hide Panel
                      </>
                    ) : (
                      <>
                        <ChevronLeft className="h-4 w-4" />
                        Show Panel
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>

              {/* Metrics Cards */}
              <div className="mb-4">
                <MetricsCards zones={zones} />
              </div>

              {/* Hero Map / Real Map */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative h-[calc(100%-180px)] min-h-[400px] overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm"
              >
                {mapMode === "visual" ? (
                  <HeroMap
                    zones={zones}
                    onZoneSelect={handleZoneSelect}
                    selectedZone={selectedZone}
                  />
                ) : (
                  <RealMap
                    zones={zones}
                    onZoneSelect={handleZoneSelect}
                    selectedZone={selectedZone}
                  />
                )}

                <div className="absolute bottom-4 left-4 z-[2000]">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2 bg-background/90 shadow-lg backdrop-blur-sm font-semibold"
                    onClick={() => setMapMode(mapMode === "real" ? "visual" : "real")}
                  >
                    {mapMode === "real" ? "Switch to Node Map" : "Switch to Real GPS Map"}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Insight Panel */}
          <AnimatePresence mode="wait">
            {rightPanelOpen && (
              <motion.div
                initial={{ x: 420, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 420, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-16 z-30 h-[calc(100vh-64px)] w-full border-l border-border/50 bg-background/95 backdrop-blur-xl lg:w-[420px]"
              >
                <div className="flex h-full flex-col">
                  {/* Panel Header */}
                  <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      {selectedZone ? (
                        <>
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: selectedZone.congestion === "Critical" ? "#dc2626"
                                : selectedZone.congestion === "High" ? "#ef4444"
                                  : selectedZone.congestion === "Medium" ? "#f59e0b"
                                    : "#10b981"
                            }}
                          />
                          <h2 className="font-semibold text-foreground">{selectedZone.zone} Insights</h2>
                        </>
                      ) : (
                        <h2 className="font-semibold text-foreground">Traffic Insights</h2>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRightPanelOpen(false)}
                      className="h-8 w-8 lg:hidden"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Tabbed Content */}
                  <Tabs defaultValue="timeline" className="flex-1 overflow-hidden">
                    <div className="border-b border-border/50 px-4">
                      <TabsList className="h-10 w-full justify-start gap-1 bg-transparent p-0">
                        <TabsTrigger
                          value="timeline"
                          className="gap-1.5 data-[state=active]:bg-secondary"
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                          Timeline
                        </TabsTrigger>
                        <TabsTrigger
                          value="analysis"
                          className="gap-1.5 data-[state=active]:bg-secondary"
                        >
                          <Brain className="h-3.5 w-3.5" />
                          Analysis
                        </TabsTrigger>
                        <TabsTrigger
                          value="controls"
                          className="gap-1.5 data-[state=active]:bg-secondary"
                        >
                          <Settings2 className="h-3.5 w-3.5" />
                          Controls
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="h-[calc(100%-88px)] overflow-y-auto p-4">
                      <TabsContent value="timeline" className="m-0 space-y-4">
                        <PredictiveTimeline zones={zones} selectedZone={selectedZone} />
                        <RiskZoneAlerts alerts={alerts} />
                      </TabsContent>

                      <TabsContent value="analysis" className="m-0 space-y-4">
                        <AIExplainability zone={selectedZone || zones.find(z => z.risk) || zones[0]} />
                        <div className="min-h-[250px]">
                          <TrafficChart zones={zones} />
                        </div>
                      </TabsContent>

                      <TabsContent value="controls" className="m-0 space-y-4">
                        <OptimizationControl suggestions={suggestions} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* AI Assistant Chatbot */}
      <AIAssistant />

      <Toaster position="bottom-left" />
    </div>
  )
}
