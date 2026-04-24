"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import type { TrafficZone } from "@/lib/traffic-data"

interface TrafficMapProps {
  zones: TrafficZone[]
}

function MapPlaceholder({ zones }: TrafficMapProps) {
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-secondary/50 to-muted/50 rounded-lg overflow-hidden">
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Bangalore city outline representation */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
        {/* Outer Ring Road representation */}
        <ellipse 
          cx="200" cy="200" rx="150" ry="140" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeDasharray="8 4"
          className="text-muted-foreground/30"
        />
        {/* Inner roads */}
        <path 
          d="M50 200 L350 200 M200 50 L200 350 M100 100 L300 300 M300 100 L100 300" 
          stroke="currentColor" 
          strokeWidth="1" 
          className="text-muted-foreground/20"
        />
      </svg>

      {/* Zone markers */}
      {zones.map((zone, index) => {
        const positions: Record<string, { x: number; y: number }> = {
          "Whitefield": { x: 85, y: 35 },
          "Hebbal": { x: 45, y: 15 },
          "Silk Board": { x: 50, y: 60 },
          "Electronic City": { x: 55, y: 85 },
          "Koramangala": { x: 52, y: 55 },
          "Indiranagar": { x: 65, y: 40 },
          "MG Road": { x: 48, y: 42 },
          "Marathahalli": { x: 75, y: 45 }
        }
        
        const pos = positions[zone.zone] || { x: 50, y: 50 }
        const color = zone.congestion === "High" 
          ? "bg-traffic-high" 
          : zone.congestion === "Medium" 
            ? "bg-traffic-medium" 
            : "bg-traffic-low"

        return (
          <motion.div
            key={zone.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="absolute group cursor-pointer"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {/* Pulse effect for high congestion */}
            {zone.congestion === "High" && (
              <span className={`absolute inset-0 rounded-full ${color} animate-ping opacity-50`} 
                style={{ width: '32px', height: '32px', marginLeft: '-8px', marginTop: '-8px' }} 
              />
            )}
            
            {/* Marker */}
            <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${color} shadow-lg`}>
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              <div className="glass rounded-lg px-3 py-2 text-xs whitespace-nowrap">
                <p className="font-semibold text-foreground">{zone.zone}</p>
                <p className="text-muted-foreground">{zone.speed} km/h • {zone.vehicles} vehicles</p>
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass rounded-lg px-3 py-2">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-traffic-low" />
            <span className="text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-traffic-medium" />
            <span className="text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-traffic-high" />
            <span className="text-muted-foreground">High</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function LeafletMap({ zones }: TrafficMapProps) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<TrafficMapProps> | null>(null)

  useEffect(() => {
    import("./leaflet-map").then((mod) => {
      setMapComponent(() => mod.LeafletMapInner)
    })
  }, [])

  if (!MapComponent) {
    return <MapPlaceholder zones={zones} />
  }

  return <MapComponent zones={zones} />
}

export function TrafficMap({ zones }: TrafficMapProps) {
  return (
    <Card className="glass h-[500px]" id="map">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          Bangalore Traffic Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-60px)]">
        <LeafletMap zones={zones} />
      </CardContent>
    </Card>
  )
}
