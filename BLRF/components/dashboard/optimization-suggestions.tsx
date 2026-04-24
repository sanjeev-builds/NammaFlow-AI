"use client"

import { motion } from "framer-motion"
import { Route, TrafficCone, Megaphone, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OptimizationSuggestion } from "@/lib/traffic-data"

interface OptimizationSuggestionsProps {
  suggestions: OptimizationSuggestion[]
}

const typeIcons = {
  route: Route,
  signal: TrafficCone,
  advisory: Megaphone
}

const impactColors = {
  high: "bg-traffic-high/10 border-traffic-high/30 text-traffic-high",
  medium: "bg-traffic-medium/10 border-traffic-medium/30 text-traffic-medium",
  low: "bg-traffic-low/10 border-traffic-low/30 text-traffic-low"
}

export function OptimizationSuggestions({ suggestions }: OptimizationSuggestionsProps) {
  return (
    <Card className="glass" id="optimization">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Route className="h-5 w-5 text-primary" />
          AI Optimization Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Route className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No optimization suggestions at this time.</p>
              <p className="text-sm">Traffic is flowing smoothly!</p>
            </div>
          ) : (
            suggestions.map((suggestion, index) => {
              const Icon = typeIcons[suggestion.type]
              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="group relative rounded-xl border border-border bg-card/50 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-card"
                >
                  <div className="flex gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${impactColors[suggestion.impact]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-foreground leading-tight">
                          {suggestion.title}
                        </h4>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium border ${impactColors[suggestion.impact]}`}>
                          {suggestion.impact} impact
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {suggestion.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Zone: {suggestion.zone}</span>
                        <button className="ml-auto flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Apply <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
