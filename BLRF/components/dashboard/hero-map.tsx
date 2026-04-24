"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Layers, ZoomIn, ZoomOut, Navigation, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TrafficZone } from "@/lib/traffic-data"

interface HeroMapProps {
  zones: TrafficZone[]
  onZoneSelect: (zone: TrafficZone | null) => void
  selectedZone: TrafficZone | null
}

interface TrafficParticle {
  id: number
  x: number
  y: number
  angle: number
  speed: number
}

const zonePositions: Record<string, { x: number; y: number; size: number; label: string; type: string }> = {
  "Whitefield": { x: 82, y: 32, size: 60, label: "IT Hub", type: "tech" },
  "Hebbal": { x: 45, y: 12, size: 50, label: "Flyover Junction", type: "junction" },
  "Silk Board": { x: 50, y: 58, size: 55, label: "Peak Bottleneck", type: "bottleneck" },
  "Electronic City": { x: 52, y: 82, size: 50, label: "Tech Park Zone", type: "tech" },
  "Koramangala": { x: 55, y: 52, size: 45, label: "Startup District", type: "commercial" },
  "Indiranagar": { x: 65, y: 38, size: 45, label: "Commercial Hub", type: "commercial" },
  "MG Road": { x: 48, y: 40, size: 40, label: "CBD Metro", type: "metro" },
  "Marathahalli": { x: 75, y: 42, size: 55, label: "ORR Corridor", type: "corridor" }
}

const roadPaths = [
  "M 10,40 Q 30,38 50,40 T 90,42", // East-West
  "M 45,5 Q 48,30 50,50 T 52,95", // North-South
  "M 20,20 Q 45,35 50,50 T 80,80", // Diagonal 1
  "M 80,15 Q 60,35 50,50 T 25,85", // Diagonal 2
  "M 30,50 Q 50,48 75,50",         // Inner ring
  "M 50,25 Q 65,40 50,55"          // Connection
]

export function HeroMap({ zones, onZoneSelect, selectedZone }: HeroMapProps) {
  const [particles, setParticles] = useState<TrafficParticle[]>([])
  const [hoveredZone, setHoveredZone] = useState<TrafficZone | null>(null)
  const [zoom, setZoom] = useState(1)

  // Generate animated traffic particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles: TrafficParticle[] = []
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          angle: Math.random() * 360,
          speed: 0.3 + Math.random() * 0.5
        })
      }
      setParticles(newParticles)
    }
    generateParticles()
  }, [])

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => {
        let newX = p.x + Math.cos(p.angle * Math.PI / 180) * p.speed
        let newY = p.y + Math.sin(p.angle * Math.PI / 180) * p.speed
        
        // Wrap around
        if (newX > 100) newX = 0
        if (newX < 0) newX = 100
        if (newY > 100) newY = 0
        if (newY < 0) newY = 100
        
        return { ...p, x: newX, y: newY }
      }))
    }, 50)
    
    return () => clearInterval(interval)
  }, [])

  const getCongestionColor = (zone: TrafficZone) => {
    switch (zone.congestion) {
      case "Critical": return "#dc2626"
      case "High": return "#ef4444"
      case "Medium": return "#f59e0b"
      case "Low": return "#10b981"
    }
  }

  const getCongestionGlow = (zone: TrafficZone) => {
    switch (zone.congestion) {
      case "Critical": return "0 0 40px #dc2626, 0 0 80px #dc262660, 0 0 120px #dc262630"
      case "High": return "0 0 30px #ef4444, 0 0 60px #ef444450"
      case "Medium": return "0 0 20px #f59e0b50"
      case "Low": return "0 0 15px #10b98150"
    }
  }

  const getZoneRadius = (zone: TrafficZone, baseSize: number) => {
    // Dynamic radius based on vehicle count
    const vehicleMultiplier = Math.min(zone.vehicles / 800, 1.5)
    return baseSize * (0.8 + vehicleMultiplier * 0.4)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tech": return "💼"
      case "junction": return "🔀"
      case "bottleneck": return "⚠️"
      case "commercial": return "🏢"
      case "metro": return "🚇"
      case "corridor": return "🛣️"
      default: return "📍"
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />

      {/* Road Network */}
      <svg 
        className="absolute inset-0 h-full w-full" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* Roads */}
        {roadPaths.map((path, i) => (
          <g key={i}>
            <path
              d={path}
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="0.8"
              strokeOpacity="0.2"
              strokeDasharray="2 2"
            />
            <path
              d={path}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="0.3"
              strokeOpacity="0.3"
            />
          </g>
        ))}

        {/* Outer Ring Road */}
        <ellipse
          cx="50" cy="50" rx="42" ry="40"
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
          strokeOpacity="0.15"
          strokeDasharray="4 4"
        />

        {/* Traffic Flow Particles */}
        {particles.map(particle => (
          <motion.circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r="0.4"
            fill="hsl(var(--primary))"
            opacity={0.6}
            animate={{
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: particle.id * 0.1
            }}
          />
        ))}
      </svg>

      {/* Zone Markers */}
      <div className="absolute inset-0" style={{ transform: `scale(${zoom})` }}>
        {zones.map((zone) => {
          const pos = zonePositions[zone.zone]
          if (!pos) return null
          
          const isSelected = selectedZone?.id === zone.id
          const isHovered = hoveredZone?.id === zone.id
          
          return (
            <motion.div
              key={zone.id}
              className="absolute cursor-pointer"
              style={{ 
                left: `${pos.x}%`, 
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => onZoneSelect(isSelected ? null : zone)}
              onMouseEnter={() => setHoveredZone(zone)}
              onMouseLeave={() => setHoveredZone(null)}
            >
              {/* Ripple Effect for High/Critical */}
              {(zone.congestion === "High" || zone.congestion === "Critical") && (
                <>
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: pos.size * 1.5,
                      height: pos.size * 1.5,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: getCongestionColor(zone),
                    }}
                    animate={{
                      scale: [1, 1.8, 1],
                      opacity: [0.3, 0, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: pos.size * 1.2,
                      height: pos.size * 1.2,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: getCongestionColor(zone),
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0, 0.2]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.3
                    }}
                  />
                </>
              )}

              {/* Zone Circle */}
              <motion.div
                className="relative flex items-center justify-center rounded-full"
                style={{
                  width: getZoneRadius(zone, pos.size),
                  height: getZoneRadius(zone, pos.size),
                  backgroundColor: `${getCongestionColor(zone)}25`,
                  border: `3px solid ${getCongestionColor(zone)}`,
                  boxShadow: getCongestionGlow(zone)
                }}
                whileHover={{ scale: 1.15 }}
                animate={isSelected ? { scale: 1.1 } : {}}
              >
                {/* Vehicle Count Display */}
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-foreground">{zone.vehicles}</span>
                  <span className="text-[9px] text-muted-foreground">vehicles</span>
                </div>
                
                {/* Speed Badge */}
                <div 
                  className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-background px-1.5 py-0.5 text-[10px] font-bold shadow-lg"
                  style={{ color: getCongestionColor(zone), borderColor: getCongestionColor(zone), borderWidth: 1 }}
                >
                  {zone.speed} km/h
                </div>

                {/* Congestion Badge */}
                <div 
                  className="absolute -left-1 -top-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white shadow-lg"
                  style={{ backgroundColor: getCongestionColor(zone) }}
                >
                  {zone.congestion}
                </div>
              </motion.div>

              {/* Zone Label with Context */}
              <motion.div
                initial={false}
                animate={{ opacity: isHovered || isSelected ? 1 : 0.85 }}
                className="mt-2 whitespace-nowrap text-center"
              >
                <p className="text-xs font-bold text-foreground">{zone.zone}</p>
                <p className="text-[10px] text-muted-foreground">{pos.label}</p>
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredZone && !selectedZone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2"
          >
            <div className="glass rounded-xl px-4 py-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: getCongestionColor(hoveredZone) }}
                />
                <div>
                  <p className="font-semibold text-foreground">{hoveredZone.zone}</p>
                  <p className="text-xs text-muted-foreground">
                    {hoveredZone.speed} km/h • {hoveredZone.vehicles} vehicles • {hoveredZone.congestion}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setZoom(z => Math.min(z + 0.2, 1.5))}
          className="h-9 w-9 bg-background/80 backdrop-blur-sm"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setZoom(z => Math.max(z - 0.2, 0.8))}
          className="h-9 w-9 bg-background/80 backdrop-blur-sm"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setZoom(1)}
          className="h-9 w-9 bg-background/80 backdrop-blur-sm"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Congestion Level</p>
        <div className="flex items-center gap-4 text-xs">
          {[
            { label: "Low", color: "#10b981" },
            { label: "Medium", color: "#f59e0b" },
            { label: "High", color: "#ef4444" },
            { label: "Critical", color: "#dc2626" }
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span 
                className="h-2.5 w-2.5 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Zone Close Button */}
      {selectedZone && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onZoneSelect(null)}
          className="absolute left-4 top-4 gap-1.5 bg-background/80 backdrop-blur-sm"
        >
          <X className="h-3.5 w-3.5" />
          Clear Selection
        </Button>
      )}
    </div>
  )
}
