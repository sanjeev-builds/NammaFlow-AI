"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Clock, MapPin, Cloud, CalendarDays, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { bangaloreZones, type CongestionLevel } from "@/lib/traffic-data"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"

interface PredictionResult {
  congestion: CongestionLevel
  confidence: number
  estimatedTime: string
  recommendation: string
}

export function PredictionPanel() {
  const [time, setTime] = useState("")
  const [location, setLocation] = useState("")
  const [weather, setWeather] = useState("")
  const [event, setEvent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)

  const handlePredict = async () => {
    if (!time || !location || !weather || !event) return

    setIsLoading(true)
    setResult(null)

    // Simulate AI prediction
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const congestionLevels: CongestionLevel[] = ["Low", "Medium", "High"]
    const randomCongestion = congestionLevels[Math.floor(Math.random() * 3)]
    const isRainOrEvent = weather === "Rain" || event === "Yes"

    const predictedCongestion: CongestionLevel = isRainOrEvent
      ? Math.random() > 0.3
        ? "High"
        : "Medium"
      : randomCongestion

    const confidence = Math.floor(Math.random() * 15) + 80
    const baseTime = predictedCongestion === "High" ? 45 : predictedCongestion === "Medium" ? 30 : 15

    setResult({
      congestion: predictedCongestion,
      confidence,
      estimatedTime: `${baseTime}-${baseTime + 15} mins`,
      recommendation:
        predictedCongestion === "High"
          ? "Consider using Metro or alternate routes"
          : predictedCongestion === "Medium"
            ? "Moderate delays expected. Leave 10 mins early"
            : "Roads are clear. Good time to travel!"
    })

    setIsLoading(false)
  }

  const getCongestionStyles = (level: CongestionLevel) => {
    switch (level) {
      case "High":
        return "bg-traffic-high/20 border-traffic-high text-traffic-high"
      case "Medium":
        return "bg-traffic-medium/20 border-traffic-medium text-traffic-medium"
      case "Low":
        return "bg-traffic-low/20 border-traffic-low text-traffic-low"
    }
  }

  return (
    <Card className="glass" id="predictions">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          AI Traffic Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Time
            </FieldLabel>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Location
            </FieldLabel>
            <Select onValueChange={setLocation}>
              <SelectTrigger className="bg-secondary/50">
                <SelectValue placeholder="Select zone" />
              </SelectTrigger>
              <SelectContent>
                {bangaloreZones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Cloud className="h-4 w-4" />
              Weather
            </FieldLabel>
            <Select onValueChange={setWeather}>
              <SelectTrigger className="bg-secondary/50">
                <SelectValue placeholder="Select weather" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Clear">Clear</SelectItem>
                <SelectItem value="Rain">Rain</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Special Event
            </FieldLabel>
            <Select onValueChange={setEvent}>
              <SelectTrigger className="bg-secondary/50">
                <SelectValue placeholder="Any event?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>

        <Button
          onClick={handlePredict}
          disabled={!time || !location || !weather || !event || isLoading}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Predict Congestion
            </>
          )}
        </Button>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-xl border-2 p-4 ${getCongestionStyles(result.congestion)}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">Predicted Congestion</p>
                  <p className="text-2xl font-bold">{result.congestion}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium opacity-80">Confidence</p>
                  <p className="text-2xl font-bold">{result.confidence}%</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm opacity-90">
                <p>
                  <span className="font-medium">Est. Travel Time:</span> {result.estimatedTime}
                </p>
                <p>
                  <span className="font-medium">Tip:</span> {result.recommendation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
