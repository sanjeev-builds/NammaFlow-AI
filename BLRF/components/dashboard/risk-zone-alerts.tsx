"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Clock, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { TrafficAlert } from "@/lib/traffic-data"

interface RiskZoneAlertsProps {
  alerts: TrafficAlert[]
}

export function RiskZoneAlerts({ alerts: externalAlerts }: RiskZoneAlertsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const alerts = externalAlerts.filter(a => !dismissedIds.has(a.id))

  const dismissAlert = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id))
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 60) return "Just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(date)
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      case "warning":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <CheckCircle2 className="h-4 w-4" />
    }
  }

  return (
    <Card className="glass" id="alerts">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-traffic-high" />
            Risk Alerts
          </CardTitle>
          {alerts.length > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex h-6 items-center rounded-full bg-traffic-high/20 px-2.5 text-xs font-semibold text-traffic-high"
            >
              {alerts.length} Active
            </motion.span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="popLayout">
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-6 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-traffic-low/20">
                <CheckCircle2 className="h-6 w-6 text-traffic-low" />
              </div>
              <p className="mt-3 font-medium text-foreground">All Clear</p>
              <p className="text-sm text-muted-foreground">No active risk alerts</p>
            </motion.div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50, scale: 0.9 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className={`group relative overflow-hidden rounded-xl border p-3 transition-all hover:shadow-md ${
                    alert.severity === "critical"
                      ? "border-destructive/40 bg-destructive/5 hover:border-destructive/60"
                      : "border-traffic-medium/40 bg-traffic-medium/5 hover:border-traffic-medium/60"
                  }`}
                >
                  {/* Severity Indicator Bar */}
                  <div 
                    className={`absolute left-0 top-0 h-full w-1 ${
                      alert.severity === "critical" ? "bg-destructive" : "bg-traffic-medium"
                    }`}
                  />
                  
                  <div className="flex items-start gap-3 pl-2">
                    <motion.div
                      animate={alert.severity === "critical" ? {
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        alert.severity === "critical"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-traffic-medium/20 text-traffic-medium"
                      }`}
                    >
                      {getAlertIcon(alert.severity)}
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground text-sm">{alert.zone}</h4>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                            alert.severity === "critical"
                              ? "bg-destructive/20 text-destructive"
                              : "bg-traffic-medium/20 text-traffic-medium"
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {alert.message}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground/70">
                        <Clock className="h-2.5 w-2.5" />
                        {formatTime(alert.timestamp)}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
