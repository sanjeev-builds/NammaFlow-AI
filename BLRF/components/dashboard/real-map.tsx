"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap, useMapEvents, Polyline, GeoJSON, Marker } from "react-leaflet"
import L from "leaflet"
import { motion, AnimatePresence } from "framer-motion"
import { ZoomIn, ZoomOut, Navigation, Layers, X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TrafficZone } from "@/lib/traffic-data"
import "leaflet/dist/leaflet.css"
import dynamic from 'next/dynamic'
const TrafficTimeline = dynamic(() => import('./traffic-timeline'), { ssr: false })

// ─── Types ───────────────────────────────────────────────────────────────────
interface RealMapProps {
  zones: TrafficZone[]
  onZoneSelect: (zone: TrafficZone | null) => void
  selectedZone: TrafficZone | null
}

interface SystemState {
  incidents: any[]
  hotspots: any[]
  prediction: string
  liveEvents: any[]
  upcomingEvents: any[]
  trafficGeoJSON: any
  eventIntensity: number
}

interface LayerVisibility {
  incidents: boolean
  heatmap: boolean
  predictions: boolean
  events: boolean
  geojson: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────
const BENGALURU_CENTER: [number, number] = [12.9716, 77.5946]

const ML_PREDICTION_ZONES = [
  { name: "Whitefield", lat: 12.9698, lon: 77.7500 },
  { name: "Hebbal", lat: 13.0358, lon: 77.5970 },
  { name: "Silk Board", lat: 12.9177, lon: 77.6238 },
  { name: "Electronic City", lat: 12.8399, lon: 77.6770 },
  { name: "Koramangala", lat: 12.9352, lon: 77.6245 },
  { name: "MG Road", lat: 12.9756, lon: 77.6065 },
  { name: "Marathahalli", lat: 12.9591, lon: 77.7010 },
  { name: "Indiranagar", lat: 12.9784, lon: 77.6408 },
]

const zoneCoordinates: Record<string, { lat: number; lng: number; label: string }> = {
  "Whitefield": { lat: 12.9698, lng: 77.7500, label: "IT Hub" },
  "Hebbal": { lat: 13.0358, lng: 77.5970, label: "Flyover Junction" },
  "Silk Board": { lat: 12.9177, lng: 77.6238, label: "Peak Bottleneck" },
  "Electronic City": { lat: 12.8399, lng: 77.6770, label: "Tech Park Zone" },
  "Koramangala": { lat: 12.9352, lng: 77.6245, label: "Startup District" },
  "Indiranagar": { lat: 12.9784, lng: 77.6408, label: "Commercial Hub" },
  "MG Road": { lat: 12.9756, lng: 77.6065, label: "CBD Metro" },
  "Marathahalli": { lat: 12.9591, lng: 77.7010, label: "ORR Corridor" }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getPredictionColor(prediction: string): string {
  if (prediction === "HIGH") return "#ef4444"
  if (prediction === "MEDIUM") return "#f59e0b"
  return "#10b981"
}

function getHotspotColor(speed: number): string {
  if (speed < 20) return "#dc2626"
  if (speed < 35) return "#f59e0b"
  return "#10b981"
}

// ─── Sub-Components ──────────────────────────────────────────────────────────
function MapController({ selectedZone }: { selectedZone: TrafficZone | null }) {
  const map = useMap()
  useEffect(() => {
    if (selectedZone) {
      const coords = zoneCoordinates[selectedZone.zone]
      if (coords) map.flyTo([coords.lat, coords.lng], 14, { duration: 1 })
    } else {
      map.flyTo(BENGALURU_CENTER, 11, { duration: 1 })
    }
  }, [selectedZone, map])
  return null
}

function ZoomControls() {
  const map = useMap()
  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
      <Button variant="secondary" size="icon" onClick={() => map.zoomIn()}
        className="h-9 w-9 bg-background/90 shadow-lg backdrop-blur-sm">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="secondary" size="icon" onClick={() => map.zoomOut()}
        className="h-9 w-9 bg-background/90 shadow-lg backdrop-blur-sm">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="secondary" size="icon" onClick={() => map.flyTo(BENGALURU_CENTER, 11)}
        className="h-9 w-9 bg-background/90 shadow-lg backdrop-blur-sm">
        <Navigation className="h-4 w-4" />
      </Button>
    </div>
  )
}

function RouteClickHandler({ onRouteFetched }: { onRouteFetched?: (data: any) => void }) {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null)
  const [destination, setDestination] = useState<[number, number] | null>(null)
  const [route, setRoute] = useState<[number, number][]>([])

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords
          // Bangalore BBox validation
          setCurrentLocation(lat > 12.5 && lat < 13.5 && lng > 77.0 && lng < 78.5
            ? [lat, lng] : [12.9352, 77.6245])
        },
        () => setCurrentLocation([12.9352, 77.6245])
      )
    } else {
      setCurrentLocation([12.9352, 77.6245])
    }
  }, [])

  useMapEvents({
    click(e) {
      if (!currentLocation) return
      const dest: [number, number] = [e.latlng.lat, e.latlng.lng]
      setDestination(dest)
      import("@/lib/ors-service").then(({ fetchRouteData }) => {
        fetchRouteData(currentLocation, dest)
          .then(data => {
            setRoute(data.geometry)
            if (onRouteFetched) onRouteFetched({ ...data, route: data.geometry })
          })
          .catch(err => console.error("Navigation Error:", err))
      })
    }
  })

  return (
    <>
      {currentLocation && (
        <CircleMarker center={currentLocation} radius={12}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2, weight: 1, className: 'gps-ring' }}>
          <Popup>📍 Your Location</Popup>
        </CircleMarker>
      )}
      {currentLocation && (
        <CircleMarker center={currentLocation} radius={6}
          pathOptions={{ color: '#fff', fillColor: '#3b82f6', fillOpacity: 0.9, weight: 3 }}>
        </CircleMarker>
      )}
      {destination && (
        <Marker position={destination} icon={L.divIcon({
          html: `<div class="relative flex items-center justify-center">
                   <div class="absolute w-8 h-8 bg-rose-500/30 rounded-full animate-ping"></div>
                   <div class="relative w-4 h-4 bg-rose-600 rounded-full border-2 border-white shadow-xl"></div>
                 </div>`,
          className: '', iconSize: [32, 32]
        })}>
          <Popup>🎯 Destination</Popup>
        </Marker>
      )}
      {route.length > 0 && (
        <>
          <style>{`
            .animated-route { stroke-dasharray: 10, 15; animation: moveDash 1.5s linear infinite; }
            @keyframes moveDash { to { stroke-dashoffset: -25; } }
            .gps-ring { animation: pulse 2s ease-out infinite; }
            @keyframes pulse { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(3); opacity: 0; } }
          `}</style>
          {/* Route Glow */}
          <Polyline positions={route}
            pathOptions={{ color: "#00FFAA", weight: 10, opacity: 0.15, lineCap: 'round' }} />
          {/* Main Route */}
          <Polyline positions={route}
            pathOptions={{ color: "#00FFAA", weight: 6, opacity: 0.9, className: 'animated-route', lineCap: 'round' }} />
        </>
      )}
    </>
  )
}

// ─── Navigation Console Sub-Component ────────────────────────────────────────
function NavigationConsole({ data, onCancel }: { data: any, onCancel: () => void }) {
  if (!data) return null;
  const distanceKm = (data.distance / 1000).toFixed(1);
  const baseMins = Math.round(data.duration / 60);
  // Adjusted ETA based on traffic (simulated for now, would use google_traffic_factor)
  const adjustedMins = Math.round(baseMins * (1 + (data.google_traffic_factor - 1) * 0.8));

  return (
    <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
      className="z-[1000] w-[300px] bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Navigation</span>
        </div>
        <button onClick={onCancel} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[9px] text-gray-500 uppercase font-black tracking-tighter">ETA</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{adjustedMins}</span>
            <span className="text-xs font-bold text-gray-400">min</span>
          </div>
        </div>
        <div>
          <p className="text-[9px] text-gray-500 uppercase font-black tracking-tighter">Distance</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{distanceKm}</span>
            <span className="text-xs font-bold text-gray-400">km</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] text-white/40 uppercase font-bold">Route Traffic</span>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`h-1.5 w-6 rounded-full ${i <= 3 ? 'bg-emerald-500' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-white/40 uppercase font-bold">Arrival Density</span>
          <p className="text-xs font-black text-emerald-400">0%</p>
        </div>
      </div>
    </motion.div>
  );
}


// ─── Main Map Inner ───────────────────────────────────────────────────────────
function MapInner({ zones, onZoneSelect, selectedZone, activeWindow, onRouteFetched, systemState, layerVisibility, navigationData }: RealMapProps & any) {
  const [simulatedHotspots, setSimulatedHotspots] = useState<Record<string, any>>({})

  const geoJSONLayerRef = useRef<any>(null)

  useEffect(() => {
    if (activeWindow === 'current') return
    fetch('http://localhost:8000/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes_ahead: 60, rain: false })
    }).then(r => r.json()).then(d => setSimulatedHotspots(d.predictions || {})).catch(() => { })
  }, [activeWindow])

  const getDensityStyle = (feature: any): L.PathOptions => {
    let density = feature?.properties?.density ?? 0
    if (activeWindow !== 'current' && simulatedHotspots[activeWindow]) {
      const nodeLabel = feature?.properties?.name || ''
      density = simulatedHotspots[activeWindow][nodeLabel] ?? Math.min(1.0, density * 1.2)
    }

    // Focus Mode: Dim roads if navigation is active
    const isNavActive = navigationData?.geometry?.length > 0;
    const baseOpacity = isNavActive ? 0.3 : 1.0;

    // Premium Road-Focus Styling
    if (density < 0.3) return { opacity: 0.15 * baseOpacity, weight: 1.5, color: '#222', fillOpacity: 0 }
    if (density >= 0.7) return { color: '#ef4444', weight: 5, opacity: 0.9 * baseOpacity, fillOpacity: 0, lineCap: 'round', dashArray: undefined }
    if (density >= 0.45) return { color: '#f59e0b', weight: 5, opacity: 0.8 * baseOpacity, fillOpacity: 0, lineCap: 'round' }
    return { color: '#10b981', weight: 4, opacity: 0.7 * baseOpacity, fillOpacity: 0, lineCap: 'round' }
  }
  // ML prediction color
  const predColor = getPredictionColor(systemState.prediction)

  // Incidents
  const createIncidentIcon = (type: string) => {
    const color = type.toLowerCase().includes('accident') ? '#f43f5e' :
      type.toLowerCase().includes('road') ? '#f59e0b' : '#3b82f6'
    return L.divIcon({
      html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;">
                 <div style="position:absolute;width:100%;height:100%;background:${color};opacity:0.2;border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,.2,1) infinite;"></div>
                 <div style="font-size:20px;z-index:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,.5));">${type.toLowerCase().includes('accident') ? '🚨' : '⚠️'}</div>
               </div>
               <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>`,
      className: '', iconSize: [36, 36]
    })
  }

  const createEventIcon = (color: string) => L.divIcon({
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;">
               <div style="position:absolute;width:100%;height:100%;background:${color};opacity:0.3;border-radius:50%;animation:ping 2s cubic-bezier(0,0,.2,1) infinite;"></div>
               <div style="position:relative;width:14px;height:14px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 0 8px ${color};"></div>
             </div>`,
    className: '', iconSize: [32, 32]
  })

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden">
      <MapContainer center={BENGALURU_CENTER} zoom={13} className="h-full w-full"
        scrollWheelZoom={true} zoomControl={false} preferCanvas={true}
        style={{ background: "#0a0a0a" }}>

        <style>{`
          .leaflet-container { background: #0a0a0a !important; }
          @keyframes ping { 75%,100% { transform:scale(2); opacity:0 } }
        `}</style>

        {/* Layer 1: CartoDB Dark Matter — native dark map, no CSS hacks needed */}
        <TileLayer attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={20} zIndex={1}
          subdomains="abcd" />

        {/* Layer 2: Google LIVE Traffic — vivid red/yellow/green on dark background */}
        <TileLayer
          url="https://mt.google.com/vt/lyrs=h,traffic&x={x}&y={y}&z={z}"
          maxZoom={20} zIndex={5}
          opacity={0.9} />

        <MapController selectedZone={selectedZone} />
        <ZoomControls />

        {/* GeoJSON road overlay */}
        {layerVisibility.geojson && systemState.trafficGeoJSON && (
          <GeoJSON key={JSON.stringify(systemState.trafficGeoJSON)}
            data={systemState.trafficGeoJSON} style={getDensityStyle}
            ref={geoJSONLayerRef}
            onEachFeature={(feature, layer: any) => {
              if (layer.setStyle) layer.setStyle({ fillOpacity: 0, fill: false })
            }} />
        )}

        {/* ── LAYER A: ROAD-ALIGNED CITY TRAFFIC ── */}
        {layerVisibility.heatmap && Array.isArray(systemState.hotspots) && systemState.hotspots.map((h: any, i: number) => {
          const lat = h.lat || 12.9716
          const lon = h.lon || 77.5946
          const speed = h.speed || 30
          const color = getHotspotColor(speed)

          // Create a short road segment centered on the hotspot
          // We alternate directions to simulate a city road mesh
          const offset = 0.002
          const isVertical = i % 2 === 0
          const path: [number, number][] = isVertical
            ? [[lat - offset, lon], [lat + offset, lon]]
            : [[lat, lon - offset], [lat, lon + offset]]

          return (
            <Polyline key={`seg-${i}`} positions={path}
              pathOptions={{
                color: color,
                weight: 7,
                opacity: 0.85,
                lineCap: 'round'
              }}>
              <Popup>
                <div className="p-2 min-w-[150px] font-sans">
                  <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Segment</span>
                    <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 m-0">{Math.round(speed)} km/h</h4>
                  <p className="text-[10px] text-gray-500 mt-1 font-semibold">
                    Flow: {speed < 20 ? "Heavy" : speed < 35 ? "Moderate" : "Smooth"}
                  </p>
                  <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (speed / 60) * 100)}%`, background: color }} />
                  </div>
                </div>
              </Popup>
            </Polyline>
          )
        })}

        {/* ── LAYER B: ML PREDICTION ZONES (HEAT ZONES) ── */}
        {layerVisibility.predictions && ML_PREDICTION_ZONES.map((zone, i) => (
          <Circle key={`pred-${i}`} center={[zone.lat, zone.lon]} radius={1800}
            pathOptions={{
              color: predColor,
              fillColor: predColor,
              fillOpacity: 0.1,
              weight: 0,      // Borderless for heat look
            }}>
            <Popup>
              <div className="p-3 min-w-[200px] border-none">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: predColor }} />
                  <strong className="text-[12px] uppercase tracking-widest font-black" style={{ color: predColor }}>
                    AI PREDICTION: {systemState.prediction}
                  </strong>
                </div>
                <h4 className="text-base font-bold text-gray-900 m-0">{zone.name} Region</h4>
                <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                  The Random Forest engine predicts <span className="font-bold" style={{ color: predColor }}>{systemState.prediction.toLowerCase()}</span> congestion in this perimeter based on current telemetry.
                </p>
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Confidence</span>
                  <span className="text-[10px] font-black text-gray-900">98% Verified</span>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* ── LAYER C: INCIDENTS ── */}
        {layerVisibility.incidents && Array.isArray(systemState.incidents) && systemState.incidents.map((inc: any, i: number) => {
          if (!inc.lat || !inc.lon) return null
          const severityVal = inc.type?.toLowerCase().includes('accident') ? 3 : 1
          const disruption = severityVal >= 3 ? "High Impact Accident" : "Moderate Disruption"
          return (
            <Marker key={`inc-${i}`} position={[inc.lat, inc.lon]} icon={createIncidentIcon(inc.type || 'hazard')}>
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${severityVal >= 3 ? 'animate-ping' : ''}`}
                      style={{ backgroundColor: severityVal >= 3 ? '#f43f5e' : '#f59e0b' }} />
                    <strong className="text-[10px] uppercase tracking-widest"
                      style={{ color: severityVal >= 3 ? '#f43f5e' : '#f59e0b' }}>{disruption}</strong>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 m-0 capitalize">{inc.type} Incident</h4>
                  <p className="text-xs text-gray-500 mt-1">Normalized ML Score: {(severityVal / 10).toFixed(2)}</p>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-[9px] text-gray-400 font-mono">
                      {inc.lat.toFixed(4)}, {inc.lon.toFixed(4)}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600">TomTom LIVE</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* ── LAYER D: LIVE EVENTS (red pulsing) ── */}
        {layerVisibility.events && Array.isArray(systemState.liveEvents) && systemState.liveEvents.map((evt: any, i: number) => {
          if (!evt.lat || !evt.lon) return null
          const liveIcon = L.divIcon({
            html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:38px;height:38px;">
                     <div style="position:absolute;width:100%;height:100%;background:#ef4444;opacity:0.25;border-radius:50%;animation:ping 1s cubic-bezier(0,0,.2,1) infinite;"></div>
                     <div style="position:relative;width:18px;height:18px;background:#ef4444;border:2.5px solid white;border-radius:50%;box-shadow:0 0 12px #ef444480;z-index:1;"></div>
                   </div>`,
            className: '', iconSize: [38, 38]
          })
          return (
            <Marker key={`live-${i}`} position={[evt.lat, evt.lon]} icon={liveIcon}>
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-white bg-red-600 rounded-full px-2 py-0.5 uppercase tracking-widest animate-pulse">🔴 LIVE NOW</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 m-0 mt-1">{evt.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{evt.category}</p>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
                    <span className="text-[10px] text-gray-400">Impact:</span>
                    <span className="text-[10px] font-bold text-rose-500">{((evt.impact || 0) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* ── LAYER D2: UPCOMING EVENTS (yellow) ── */}
        {layerVisibility.events && Array.isArray(systemState.upcomingEvents) && systemState.upcomingEvents.map((evt: any, i: number) => {
          if (!evt.lat || !evt.lon) return null
          const upcomingIcon = L.divIcon({
            html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;">
                     <div style="position:absolute;width:100%;height:100%;background:#f59e0b;opacity:0.1;border-radius:50%;animation:ping 3s cubic-bezier(0,0,.2,1) infinite;"></div>
                     <div style="position:relative;width:14px;height:14px;background:#f59e0b;border:2px solid white;border-radius:50%;box-shadow:0 0 10px #f59e0b70;"></div>
                   </div>`,
            className: '', iconSize: [32, 32]
          })
          const minsUntil = evt.starts_in_mins || 0
          const timeLabel = minsUntil < 60 ? `${minsUntil}min` : `${Math.floor(minsUntil / 60)}h`
          return (
            <Marker key={`upcoming-${i}`} position={[evt.lat, evt.lon]} icon={upcomingIcon}>
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-white bg-amber-500 rounded-full px-2 py-0.5 uppercase tracking-widest">🟡 Starts in {timeLabel}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 m-0 mt-1">{evt.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{evt.category}</p>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
                    <span className="text-[10px] text-gray-400">Predicted Impact:</span>
                    <span className="text-[10px] font-bold text-amber-500">{((evt.impact || 0) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        <RouteClickHandler onRouteFetched={onRouteFetched} />
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[1001] shadow-[inset_0_0_160px_rgba(10,10,10,0.85)] rounded-xl" />
    </div>
  )
}

// ─── Root Export ─────────────────────────────────────────────────────────────
export function RealMap({ zones, onZoneSelect, selectedZone }: RealMapProps) {
  const [mounted, setMounted] = useState(false)
  const [activeWindow, setActiveWindow] = useState<'current' | 't_plus_15' | 't_plus_30' | 't_plus_60'>('current')
  const [arrivalDensity, setArrivalDensity] = useState<number>(0)
  const [forecastWindow, setForecastWindow] = useState<string>('current')
  const [warning, setWarning] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [recommendation, setRecommendation] = useState<string | null>(null)

  // ── Unified System State ──────────────────────────────────────────────────
  const [systemState, setSystemState] = useState<SystemState>({
    incidents: [], hotspots: [], prediction: "LOW",
    liveEvents: [], upcomingEvents: [], trafficGeoJSON: null, eventIntensity: 0
  })

  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    incidents: true, heatmap: true, predictions: true, events: true, geojson: true
  })

  // ── Navigation State ──────────────────────────────────────────────────────
  const [navigationData, setNavigationData] = useState<any>(null)
  const [googleTrafficFactor, setGoogleTrafficFactor] = useState<number>(1.0)


  // ── Central Real-Time Polling ─────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [incRes, trafficRes, eventsRes, geoRes] = await Promise.allSettled([
          fetch('/api/incidents').then(r => r.json()),
          fetch('http://localhost:8000/traffic').then(r => r.json()),
          fetch('http://localhost:8000/events/filtered').then(r => r.json()),
          fetch('http://localhost:8000/static/bangalore_traffic.geojson').then(r => r.json()),
        ])

        const hotspots = Array.isArray(trafficRes.status === 'fulfilled' ? trafficRes.value : []) ? (trafficRes.status === 'fulfilled' ? trafficRes.value : []) : []
        const eventsData = eventsRes.status === 'fulfilled' ? eventsRes.value : { live: [], upcoming: [] }
        const liveEvents = Array.isArray(eventsData?.live) ? eventsData.live : []
        const upcomingEvents = Array.isArray(eventsData?.upcoming) ? eventsData.upcoming : []

        // Derive ML features from live hotspots
        const hour = new Date().getHours()
        const avgSpeed = hotspots.length > 0
          ? Math.round(hotspots.reduce((s: number, h: any) => s + (h.speed || 30), 0) / hotspots.length)
          : 30
        const avgVehicles = hotspots.length > 0
          ? Math.round(hotspots.reduce((s: number, h: any) => s + (h.vehicle_count || 50), 0) / hotspots.length)
          : 50
        const maxCongestion = hotspots.length > 0
          ? Math.max(...hotspots.map((h: any) => h.congestion_score || 5)) : 5
        const incident_score = Math.min(maxCongestion / 10, 1)
        const is_peak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20) ? 1 : 0

        // event_intensity: max impact of currently live events
        const event_intensity = liveEvents.length > 0
          ? Math.max(...liveEvents.map((e: any) => e.impact || 0))
          : 0

        // Fetch Google Traffic Factor (TomTom-based, free alternative)
        let google_traffic_factor = 1.0
        try {
          const gtRes = await fetch('/api/google-traffic')
          if (gtRes.ok) {
            const gtData = await gtRes.json()
            google_traffic_factor = gtData?.system_traffic_factor || 1.0
          }
        } catch (_) { }
        setGoogleTrafficFactor(google_traffic_factor)


        // Fetch ML prediction with ALL LIVE features
        let prediction = "LOW"
        try {
          const predRes = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ speed: avgSpeed, vehicle_count: avgVehicles, weather: 0, incident_score, eta: 20, hour, is_peak, event_intensity, google_traffic_factor })
          })
          const predData = await predRes.json()
          prediction = predData.prediction || "LOW"
        } catch (_) { }

        setSystemState({
          incidents: Array.isArray(incRes.status === 'fulfilled' ? incRes.value : []) ? (incRes.status === 'fulfilled' ? incRes.value : []) : [],
          hotspots,
          prediction,
          liveEvents,
          upcomingEvents,
          trafficGeoJSON: geoRes.status === 'fulfilled' ? geoRes.value : null,
          eventIntensity: event_intensity,
        })
        console.log(`✅ System Sync: ${hotspots.length} hotspots, ${liveEvents.length} live events found.`)

        // --- AUTOMATED REROUTING SENTINEL ---
        // If navigation is active, check for route updates every sync
        if (navigationData?.destination) {
          console.log("🔄 Navigation active: Proactively checking for optimal route...")
          import("@/lib/ors-service").then(({ fetchRouteData }) => {
            // Re-fetch route from current location (locked in RouteClickHandler)
            // For simplicity, we trigger the update via state
            const currentLocation = [12.9352, 77.6245] as [number, number] // base fallback
            // In a real device, we'd use the navigator.geolocation.getCurrentPosition again
            fetchRouteData(currentLocation, navigationData.destination)
              .then(data => {
                setNavigationData((prev: any) => ({ ...prev, ...data, google_traffic_factor: google_traffic_factor }))
              })
              .catch(() => { })
          })
        }
      } catch (e) {
        console.error("SystemState sync error:", e)
      }
    }


    setMounted(true)
    fetchAll()
    const interval = setInterval(fetchAll, 20000)
    return () => clearInterval(interval)
  }, [])

  const [legendMinimized, setLegendMinimized] = useState(false)

  const toggleLayer = (key: keyof LayerVisibility) =>
    setLayerVisibility(prev => ({ ...prev, [key]: !prev[key] }))


  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-secondary/50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading NammaFlow AI Digital Twin...</p>
        </div>
      </div>
    )
  }

  const predColor = getPredictionColor(systemState.prediction)

  return (
    <div className="relative h-full w-full overflow-visible rounded-xl">
      <MapInner
        zones={zones}
        onZoneSelect={onZoneSelect}
        selectedZone={selectedZone}
        activeWindow={activeWindow}
        systemState={systemState}
        layerVisibility={layerVisibility}
        navigationData={navigationData}
        onRouteFetched={(data: any) => {
          setNavigationData({ ...data, google_traffic_factor: googleTrafficFactor })
          setArrivalDensity(data.est_arrival_density || 0)
          setForecastWindow(data.forecast_window || 'current')
          setWarning(data.warning || null)
          setConfidence(data.confidence || null)
          setRecommendation(data.recommendation || null)
        }} />

      <AnimatePresence>
        {navigationData && (
          <div className="absolute bottom-10 left-10 z-[1000]">
            <NavigationConsole data={navigationData} onCancel={() => setNavigationData(null)} />
          </div>
        )}
      </AnimatePresence>


      <TrafficTimeline onTimeChange={setActiveWindow} arrivalDensity={arrivalDensity}
        forecastWindow={forecastWindow} warning={warning} confidence={confidence}
        recommendation={recommendation} />

      {/* Clear Zone Button */}
      <AnimatePresence>
        {selectedZone && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} className="absolute left-4 top-28 z-[1000]">
            <Button variant="outline" size="sm" onClick={() => onZoneSelect(null)}
              className="gap-2 bg-rose-500/10 shadow-2xl backdrop-blur-xl border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-xl px-4">
              <X className="h-4 w-4" />
              <span className="font-semibold tracking-wide text-xs">Clear Target</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Destination Search Bar ────────────────────────────────────────── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1100] w-[400px]">
        <div className="relative group">
          <div className="absolute inset-0 bg-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
          <input
            type="text"
            placeholder="Search Bengaluru Destination..."
            className="w-full bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-2xl"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const query = e.currentTarget.value.toLowerCase();
                const matched = Object.entries(zoneCoordinates).find(([k]) => k.toLowerCase().includes(query));
                if (matched) {
                  onZoneSelect({ zone: matched[0], density: 0.5 } as any);
                }
              }
            }}
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <span className="text-[10px] font-bold text-gray-500 bg-white/5 py-1 px-2 rounded-md border border-white/10">ENTER</span>
          </div>
        </div>
      </div>


      {/* ── Legend + Layer Toggles ─────────────────────────────── */}
      <div className={`absolute bottom-40 left-6 z-[1000] rounded-2xl bg-black/40 shadow-2xl backdrop-blur-2xl border border-white/5 transition-all duration-300 ${legendMinimized ? 'w-10 h-10 overflow-hidden' : 'min-w-[200px] px-4 py-4 text-left'}`}>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
          {!legendMinimized && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: predColor }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: predColor }} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: predColor }}>
                ML Analysis
              </span>
            </div>
          )}
          <button onClick={() => setLegendMinimized(!legendMinimized)} className="p-1 hover:bg-white/10 rounded-md">
            <Layers className="h-3.5 w-3.5 text-gray-400" />
          </button>
        </div>

        {!legendMinimized && (
          <>
            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-gray-500">Traffic Level</p>
            <div className="flex items-center gap-3 mb-3">
              {[
                { label: "Low", color: "#10b981" },
                { label: "Med", color: "#f59e0b" },
                { label: "High", color: "#ef4444" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}80` }} />
                  <span className="text-gray-300 text-[10px] font-medium">{item.label}</span>
                </div>

              ))}
            </div>

            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-gray-500">Layers</p>
            <div className="space-y-1.5">
              {(Object.keys(layerVisibility) as (keyof LayerVisibility)[]).map(key => (
                <button key={key} onClick={() => toggleLayer(key)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1 hover:bg-white/5 transition-colors">
                  <span className="text-[11px] text-gray-300 capitalize">{key}</span>
                  {layerVisibility[key]
                    ? <Eye className="h-3 w-3 text-primary" />
                    : <EyeOff className="h-3 w-3 text-gray-600" />}
                </button>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between px-2 mb-1">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[8px] font-bold text-emerald-500/80 uppercase tracking-[0.2em]">Live Syncing</span>
              </div>
              <span className="text-[8px] font-mono text-gray-500">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div className="grid grid-cols-3 gap-1 text-center bg-white/5 rounded-xl py-2 border border-white/5">
              <div>
                <p className="text-[14px] font-bold text-rose-400">{systemState.incidents.length}</p>
                <p className="text-[8px] text-gray-500 uppercase">Incidents</p>
              </div>
              <div>
                <p className="text-[14px] font-bold text-amber-400">{systemState.hotspots.length}</p>
                <p className="text-[8px] text-gray-500 uppercase">Hotspots</p>
              </div>
              <div>
                <p className="text-[14px] font-bold text-blue-400">{(systemState.liveEvents?.length || 0) + (systemState.upcomingEvents?.length || 0)}</p>
                <p className="text-[8px] text-gray-500 uppercase">Events</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Cinematic Edge Vignette */}
      <div className="pointer-events-none absolute inset-0 z-[900] shadow-[inset_0_0_160px_rgba(10,10,10,1)] rounded-xl" />
    </div>
  )
}
