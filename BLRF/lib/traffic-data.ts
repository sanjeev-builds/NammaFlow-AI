export type CongestionLevel = "Low" | "Medium" | "High" | "Critical"

export interface PredictionTimeline {
  now: CongestionLevel
  plus15: CongestionLevel
  plus30: CongestionLevel
}

export interface CongestionFactor {
  factor: string
  impact: number
  icon: "event" | "rain" | "peak" | "accident" | "construction"
}

export interface TrafficZone {
  id: string
  zone: string
  congestion: CongestionLevel
  speed: number
  vehicles: number
  risk: boolean
  lat: number
  lng: number
  description?: string
  prediction: PredictionTimeline
  factors: CongestionFactor[]
}

export interface TrafficAlert {
  id: string
  zone: string
  message: string
  severity: "warning" | "critical"
  timestamp: Date
}

export interface OptimizationSuggestion {
  id: string
  type: "route" | "signal" | "advisory"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  zone: string
  action?: string
}

export interface SimulationEvent {
  type: "rain" | "event" | "accident"
  active: boolean
  affectedZones: string[]
}

export const initialTrafficData: TrafficZone[] = [
  {
    id: "1",
    zone: "Whitefield",
    congestion: "High",
    speed: 18,
    vehicles: 85,
    risk: true,
    lat: 12.9698,
    lng: 77.7500,
    description: "IT Hub - Peak hour congestion",
    prediction: { now: "High", plus15: "High", plus30: "Critical" },
    factors: [
      { factor: "Peak hour traffic", impact: 35, icon: "peak" },
      { factor: "IT park exits", impact: 25, icon: "event" },
      { factor: "Construction nearby", impact: 15, icon: "construction" }
    ]
  },
  {
    id: "2",
    zone: "Hebbal",
    congestion: "Medium",
    speed: 32,
    vehicles: 62,
    risk: false,
    lat: 13.0358,
    lng: 77.5970,
    description: "Flyover junction - Moderate traffic",
    prediction: { now: "Medium", plus15: "Medium", plus30: "High" },
    factors: [
      { factor: "Airport traffic", impact: 20, icon: "event" },
      { factor: "Flyover merging", impact: 15, icon: "construction" }
    ]
  },
  {
    id: "3",
    zone: "Silk Board",
    congestion: "High",
    speed: 12,
    vehicles: 95,
    risk: true,
    lat: 12.9172,
    lng: 77.6227,
    description: "Major junction - Heavy congestion",
    prediction: { now: "High", plus15: "Critical", plus30: "Critical" },
    factors: [
      { factor: "Junction bottleneck", impact: 40, icon: "construction" },
      { factor: "Peak hour", impact: 30, icon: "peak" },
      { factor: "Metro construction", impact: 20, icon: "construction" }
    ]
  },
  {
    id: "4",
    zone: "Electronic City",
    congestion: "Medium",
    speed: 28,
    vehicles: 58,
    risk: false,
    lat: 12.8399,
    lng: 77.6770,
    description: "Tech park area - Moderate flow",
    prediction: { now: "Medium", plus15: "High", plus30: "High" },
    factors: [
      { factor: "Office exodus", impact: 25, icon: "peak" },
      { factor: "Toll plaza queue", impact: 15, icon: "construction" }
    ]
  },
  {
    id: "5",
    zone: "Koramangala",
    congestion: "Low",
    speed: 42,
    vehicles: 35,
    risk: false,
    lat: 12.9352,
    lng: 77.6245,
    description: "Residential - Smooth traffic",
    prediction: { now: "Low", plus15: "Low", plus30: "Medium" },
    factors: [
      { factor: "Residential area", impact: 10, icon: "event" }
    ]
  },
  {
    id: "6",
    zone: "Indiranagar",
    congestion: "Medium",
    speed: 25,
    vehicles: 68,
    risk: false,
    lat: 12.9784,
    lng: 77.6408,
    description: "Commercial area - Busy",
    prediction: { now: "Medium", plus15: "High", plus30: "High" },
    factors: [
      { factor: "Restaurant zone", impact: 20, icon: "event" },
      { factor: "Evening crowd", impact: 25, icon: "peak" }
    ]
  },
  {
    id: "7",
    zone: "MG Road",
    congestion: "Low",
    speed: 38,
    vehicles: 42,
    risk: false,
    lat: 12.9756,
    lng: 77.6063,
    description: "Metro corridor - Good flow",
    prediction: { now: "Low", plus15: "Medium", plus30: "Medium" },
    factors: [
      { factor: "Metro available", impact: -15, icon: "event" }
    ]
  },
  {
    id: "8",
    zone: "Marathahalli",
    congestion: "High",
    speed: 15,
    vehicles: 88,
    risk: true,
    lat: 12.9591,
    lng: 77.6974,
    description: "ORR junction - Severe congestion",
    prediction: { now: "High", plus15: "High", plus30: "Critical" },
    factors: [
      { factor: "ORR bottleneck", impact: 35, icon: "construction" },
      { factor: "Peak hour", impact: 25, icon: "peak" },
      { factor: "Signal timing", impact: 15, icon: "construction" }
    ]
  }
]

export const bangaloreZones = [
  "Whitefield",
  "Hebbal",
  "Silk Board",
  "Electronic City",
  "Koramangala",
  "Indiranagar",
  "MG Road",
  "Marathahalli",
  "JP Nagar",
  "Jayanagar",
  "BTM Layout",
  "HSR Layout"
]

export const generateRandomCongestion = (): CongestionLevel => {
  const random = Math.random()
  if (random < 0.25) return "Low"
  if (random < 0.55) return "Medium"
  if (random < 0.85) return "High"
  return "Critical"
}

export const generateRandomSpeed = (congestion: CongestionLevel): number => {
  switch (congestion) {
    case "Low":
      return Math.floor(Math.random() * 20) + 35
    case "Medium":
      return Math.floor(Math.random() * 15) + 20
    case "High":
      return Math.floor(Math.random() * 10) + 10
    case "Critical":
      return Math.floor(Math.random() * 5) + 5
  }
}

export const generateRandomVehicles = (congestion: CongestionLevel): number => {
  switch (congestion) {
    case "Low":
      return Math.floor(Math.random() * 30) + 20
    case "Medium":
      return Math.floor(Math.random() * 25) + 50
    case "High":
      return Math.floor(Math.random() * 20) + 80
    case "Critical":
      return Math.floor(Math.random() * 10) + 95
  }
}

export const generatePredictionTimeline = (currentCongestion: CongestionLevel): PredictionTimeline => {
  const levels: CongestionLevel[] = ["Low", "Medium", "High", "Critical"]
  const currentIndex = levels.indexOf(currentCongestion)
  
  const getNext = (index: number): CongestionLevel => {
    const change = Math.random() > 0.6 ? 1 : Math.random() > 0.3 ? 0 : -1
    const newIndex = Math.max(0, Math.min(3, index + change))
    return levels[newIndex]
  }
  
  const plus15Index = levels.indexOf(getNext(currentIndex))
  
  return {
    now: currentCongestion,
    plus15: getNext(currentIndex),
    plus30: getNext(plus15Index)
  }
}

export const generateFactors = (congestion: CongestionLevel, hasRain: boolean, hasEvent: boolean): CongestionFactor[] => {
  const factors: CongestionFactor[] = []
  
  if (congestion === "High" || congestion === "Critical") {
    factors.push({ factor: "Peak hour traffic", impact: Math.floor(Math.random() * 15) + 25, icon: "peak" })
  }
  
  if (hasRain) {
    factors.push({ factor: "Rain conditions", impact: Math.floor(Math.random() * 10) + 15, icon: "rain" })
  }
  
  if (hasEvent) {
    factors.push({ factor: "Event nearby", impact: Math.floor(Math.random() * 15) + 20, icon: "event" })
  }
  
  if (Math.random() > 0.7) {
    factors.push({ factor: "Road construction", impact: Math.floor(Math.random() * 10) + 10, icon: "construction" })
  }
  
  if (Math.random() > 0.9) {
    factors.push({ factor: "Accident reported", impact: Math.floor(Math.random() * 20) + 30, icon: "accident" })
  }
  
  return factors.length > 0 ? factors : [{ factor: "Normal traffic flow", impact: 5, icon: "peak" }]
}

export const getOptimizationSuggestions = (zones: TrafficZone[]): OptimizationSuggestion[] => {
  const suggestions: OptimizationSuggestion[] = []
  
  zones.filter(z => z.congestion === "High" || z.congestion === "Critical").forEach((zone, index) => {
    suggestions.push({
      id: `route-${index}`,
      type: "route",
      title: `Smart Rerouting via ${zone.zone === "Whitefield" ? "Old Airport Road" : "Service Road"}`,
      description: `Avoid ${zone.zone}. Take the alternate route to save approximately 15-20 minutes.`,
      impact: "high",
      zone: zone.zone,
      action: "Apply Rerouting"
    })
    
    suggestions.push({
      id: `signal-${index}`,
      type: "signal",
      title: `Extend green phase at ${zone.zone} junction`,
      description: `AI recommends increasing green signal duration by 30 seconds to improve flow.`,
      impact: "medium",
      zone: zone.zone,
      action: "Adjust Signal"
    })
  })
  
  zones.filter(z => z.congestion === "Medium").forEach((zone, index) => {
    suggestions.push({
      id: `advisory-${index}`,
      type: "advisory",
      title: `Traffic advisory for ${zone.zone}`,
      description: `Consider leaving early or using public transport. Metro available nearby.`,
      impact: "low",
      zone: zone.zone,
      action: "View Details"
    })
  })
  
  return suggestions
}

export const getAlerts = (zones: TrafficZone[]): TrafficAlert[] => {
  return zones
    .filter(z => z.risk || z.congestion === "Critical")
    .map((zone, index) => ({
      id: `alert-${index}`,
      zone: zone.zone,
      message: zone.congestion === "Critical" 
        ? `Critical congestion in ${zone.zone} - rerouting initiated`
        : `High congestion expected in ${zone.zone} in next 20 mins`,
      severity: zone.congestion === "Critical" ? "critical" : "warning",
      timestamp: new Date()
    }))
}

export const chatResponses: Record<string, string> = {
  "whitefield": "📍 WHITEFIELD (IT Hub)\n━━━━━━━━━━━━━━\n🔴 Status: HIGH congestion\n⚡ Speed: 18 km/h (↓62% from normal)\n🚗 Vehicles: 850+ in zone\n\n⏱️ PREDICTION:\n• Now → High\n• +15 min → High  \n• +30 min → CRITICAL\n\n💡 WHY: Peak hour IT exodus + construction at ITPL junction\n\n✅ RECOMMENDED:\n1. Take Old Airport Road via KR Puram\n2. Use Metro from Byappanahalli (fastest)\n3. Delay departure by 45 mins",
  "silk board": "📍 SILK BOARD (Peak Bottleneck)\n━━━━━━━━━━━━━━\n🔴 Status: HIGH → CRITICAL\n⚡ Speed: 12 km/h (slowest in city)\n🚗 Vehicles: 950+ in zone\n\n⚠️ This is Bangalore's WORST junction!\n\n💡 WHY: 5-road merger + metro work + no flyover\n\n✅ ALTERNATIVES:\n1. NICE Road (toll ₹45) - saves 25 mins\n2. Hosur Road via BTM Layout\n3. Avoid 5-8 PM completely",
  "hebbal": "📍 HEBBAL (Flyover Junction)\n━━━━━━━━━━━━━━\n🟡 Status: MEDIUM\n⚡ Speed: 32 km/h\n🚗 Vehicles: 620 in zone\n\n⏱️ PREDICTION:\n• Now → Medium\n• +15 min → Medium\n• +30 min → High (airport rush)\n\n💡 WHY: Airport traffic merging + Manyata exodus\n\n✅ TIP: Travel before 5 PM or after 9 PM",
  "electronic city": "📍 ELECTRONIC CITY (Tech Park)\n━━━━━━━━━━━━━━\n🟡 Status: MEDIUM\n⚡ Speed: 28 km/h\n🚗 Vehicles: 580 in zone\n\n💡 WHY: Toll plaza queue + IT park exits\n\n✅ RECOMMENDED:\n1. Elevated Expressway (worth ₹50 toll)\n2. Leave before 6 PM or after 8:30 PM\n3. Consider carpooling for toll discount",
  "marathahalli": "📍 MARATHAHALLI (ORR Corridor)\n━━━━━━━━━━━━━━\n🔴 Status: HIGH\n⚡ Speed: 15 km/h (↓70% from normal)\n🚗 Vehicles: 880 in zone\n\n⏱️ PREDICTION:\n• Now → High\n• +30 min → CRITICAL\n\n💡 WHY: ORR bottleneck + signal timing issues\n\n✅ ALTERNATIVES:\n1. Inner Ring Road via Domlur\n2. HAL Old Airport Road\n3. Avoid 6-9 PM window",
  "koramangala": "📍 KORAMANGALA (Startup District)\n━━━━━━━━━━━━━━\n🟢 Status: LOW\n⚡ Speed: 42 km/h\n🚗 Vehicles: 350 in zone\n\n✅ Good time to travel!\nExpect medium traffic in 30+ mins as evening crowd builds.",
  "indiranagar": "📍 INDIRANAGAR (Commercial Hub)\n━━━━━━━━━━━━━━\n🟡 Status: MEDIUM\n⚡ Speed: 25 km/h\n🚗 Vehicles: 680 in zone\n\n💡 WHY: Restaurant/pub zone evening rush\n\n✅ TIP: Use 100 Feet Road instead of main road. Metro at Indiranagar station available.",
  "mg road": "📍 MG ROAD (CBD Metro)\n━━━━━━━━━━━━━━\n🟢 Status: LOW\n⚡ Speed: 38 km/h\n🚗 Vehicles: 420 in zone\n\n✅ Smooth traffic! Metro corridor helping.\n\n💡 TIP: Best time to cross MG Road. Use Trinity Circle to avoid Brigade Road congestion.",
  "best route": "🗺️ BEST ROUTE ANALYSIS\n━━━━━━━━━━━━━━\nNorth → South Bangalore:\n\n✅ RECOMMENDED PATH:\nHebbal → Bellary Road → MG Road → Hosur Road\n\n⏱️ ETA: 45 minutes\n💰 No tolls\n\n🚫 AVOID: Silk Board junction at all costs!",
  "rain": "🌧️ RAIN ALERT ACTIVE\n━━━━━━━━━━━━━━\n⚠️ Weather Impact Detected!\n\n📉 Expected speed drops:\n• All zones: -20% to -30%\n• Waterlogging: Silk Board, KR Puram\n\n🚨 HIGH RISK ZONES:\n1. Silk Board - flooding prone\n2. Marathahalli - visibility issues\n3. Whitefield - drainage problems\n\n✅ ADVICE:\n• Increase following distance\n• Use headlights\n• Avoid underpasses",
  "traffic": "🚦 CITYWIDE TRAFFIC SUMMARY\n━━━━━━━━━━━━━━\n\n🔴 CRITICAL: Silk Board\n🔴 HIGH: Whitefield, Marathahalli\n🟡 MEDIUM: Hebbal, Electronic City, Indiranagar\n🟢 LOW: Koramangala, MG Road\n\n💡 AI INSIGHT: Peak congestion window is 5:30-8:30 PM. Plan accordingly!",
  "help": "🤖 I'm your AI Traffic Assistant!\n━━━━━━━━━━━━━━\n\nI can help you with:\n\n📍 Zone status - \"How is Whitefield?\"\n🗺️ Route planning - \"Best route to EC?\"\n🌧️ Weather impact - \"Rain effect?\"\n📊 Predictions - \"Traffic in 30 mins?\"\n💡 Tips - \"When to travel?\"\n\nJust ask naturally!",
  "default": "🤖 I can help with Bangalore traffic!\n\nTry asking:\n• \"How is Whitefield?\"\n• \"Silk Board status\"\n• \"Best route to Electronic City\"\n• \"Rain impact?\"\n• \"Traffic summary\"\n\nI provide real-time predictions with AI-powered insights!"
}
