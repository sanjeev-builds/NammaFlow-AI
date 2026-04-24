"use client"

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { TrafficZone } from "@/lib/traffic-data"

interface LeafletMapInnerProps {
  zones: TrafficZone[]
}

const BANGALORE_CENTER: [number, number] = [12.9716, 77.5946]

const getColor = (congestion: string): string => {
  switch (congestion) {
    case "High":
      return "#ef4444"
    case "Medium":
      return "#eab308"
    case "Low":
      return "#22c55e"
    default:
      return "#6b7280"
  }
}

export function LeafletMapInner({ zones }: LeafletMapInnerProps) {
  return (
    <MapContainer
      center={BANGALORE_CENTER}
      zoom={11}
      className="h-full w-full rounded-lg"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {zones.map((zone) => (
        <CircleMarker
          key={zone.id}
          center={[zone.lat, zone.lng]}
          radius={zone.congestion === "High" ? 20 : zone.congestion === "Medium" ? 15 : 10}
          pathOptions={{
            color: getColor(zone.congestion),
            fillColor: getColor(zone.congestion),
            fillOpacity: 0.6,
            weight: 2
          }}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-semibold text-foreground">{zone.zone}</h3>
              <p className="text-sm text-muted-foreground">{zone.description}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Speed:</span>
                  <span className="ml-1 font-medium">{zone.speed} km/h</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Vehicles:</span>
                  <span className="ml-1 font-medium">{zone.vehicles}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Status:</span>
                  <span
                    className="ml-1 font-medium"
                    style={{ color: getColor(zone.congestion) }}
                  >
                    {zone.congestion} Congestion
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
