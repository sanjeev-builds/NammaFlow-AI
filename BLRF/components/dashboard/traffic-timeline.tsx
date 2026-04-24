"use client"
import { useState } from 'react'

interface TrafficTimelineProps {
    onTimeChange: (window: 'current' | 't_plus_15' | 't_plus_30' | 't_plus_60') => void
    arrivalDensity: number
    forecastWindow: string
    warning: string | null
    confidence?: number | null
    recommendation?: string | null
}

export default function TrafficTimeline({ onTimeChange, arrivalDensity, forecastWindow, warning, confidence, recommendation }: TrafficTimelineProps) {
    const WINDOWS = [
        { key: 'current', label: 'Now', minutes: 0 },
        { key: 't_plus_15', label: '+15 min', minutes: 15 },
        { key: 't_plus_30', label: '+30 min', minutes: 30 },
        { key: 't_plus_60', label: '+60 min', minutes: 60 },
    ]
    const [selected, setSelected] = useState('current')

    const triggerScenario = async (label: string) => {
        const body = label === 'Rush Hour' ? { hour: 8 }
            : label === 'Rain' ? { rain: true }
                : { event: { location: 'Silk Board', intensity: 0.9 } }
        await fetch('http://localhost:8000/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
    }

    return (
        <div className="absolute bottom-6 right-6 z-[1000] max-h-[calc(100vh-48px)] overflow-y-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 min-w-[300px] shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] font-bold tracking-[0.15em] text-gray-300 uppercase">
                    Premium Traffic Forecast
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shadow-[0_0_8px_#34d399]"></span>
                    Live Sync
                </span>
            </div>

            {/* Timeline buttons */}
            <div className="flex gap-2 mb-5">
                {WINDOWS.map(w => (
                    <button key={w.key} onClick={() => { setSelected(w.key); onTimeChange(w.key as any) }}
                        className={`flex-1 py-3 rounded-xl border-none cursor-pointer text-[12px] font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${selected === w.key
                                ? 'bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}>
                        {w.label}
                    </button>
                ))}
            </div>

            {/* Density bar */}
            <div className="mb-4">
                <div className="flex justify-between mb-1.5">
                    <span className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase">Route Congestion At Arrival</span>
                    <span className={`text-[12px] font-extrabold ${arrivalDensity >= 0.6 ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                            : arrivalDensity >= 0.3 ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        }`}>
                        {Math.round(arrivalDensity * 100)}%
                    </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full rounded-full transition-all duration-700 ease-in-out ${arrivalDensity >= 0.6 ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
                            : arrivalDensity >= 0.3 ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'
                                : 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                        }`} style={{ width: `${arrivalDensity * 100}%` }} />
                </div>
            </div>

            {/* Warning badge */}
            {warning && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold mb-3 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                    ⚠ WARNING: {warning}
                </div>
            )}

            {/* Confidence Block */}
            {confidence !== undefined && confidence !== null && (
                <div className="mt-3 p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
                    <div className="flex justify-between mb-2">
                        <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                            AI Route Confidence
                        </span>
                        <span className={`text-[13px] font-extrabold ${confidence >= 70 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                : confidence >= 40 ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                    : 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                            }`}>
                            {confidence}%
                        </span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-medium leading-relaxed">{recommendation}</div>
                </div>
            )}

            {/* Scenario triggers */}
            <div className="flex gap-2 mt-5">
                {[['🏢', 'Rush Hour'], ['🌧️', 'Rain'], ['🎤', 'Event']].map(([icon, label]) => (
                    <button key={label}
                        onClick={() => triggerScenario(label)}
                        className="flex-1 py-2.5 rounded-xl border border-white/10 bg-black/20 text-gray-400 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-white/10 hover:text-white transition-all transform hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        <span className="mr-1">{icon}</span> {label}
                    </button>
                ))}
            </div>
        </div>
    )
}
