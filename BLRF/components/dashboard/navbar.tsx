"use client"

import { Bell, Moon, Sun, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { TrafficAlert } from "@/lib/traffic-data"

interface NavbarProps {
  alerts: TrafficAlert[]
  onToggleSidebar?: () => void
}

export function Navbar({ alerts, onToggleSidebar }: NavbarProps) {
  const [isDark, setIsDark] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search zones, routes..."
            className="h-9 w-64 rounded-lg border border-input bg-secondary/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="mr-2 hidden items-center gap-2 rounded-full bg-secondary px-3 py-1.5 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-traffic-low opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-traffic-low" />
          </span>
          <span className="text-xs font-medium text-foreground">Live</span>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {alerts.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {alerts.length}
              </span>
            )}
          </Button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-xl"
              >
                <h3 className="mb-3 text-sm font-semibold text-foreground">Alerts</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active alerts</p>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`rounded-lg p-3 ${
                          alert.severity === "critical"
                            ? "bg-destructive/10 border border-destructive/20"
                            : "bg-traffic-medium/10 border border-traffic-medium/20"
                        }`}
                      >
                        <p className="text-sm font-medium text-foreground">{alert.zone}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  )
}
