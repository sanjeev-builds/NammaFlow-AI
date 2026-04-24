"use client"

import dynamic from 'next/dynamic'

const Dashboard = dynamic(
    () => import('@/components/dashboard/dashboard').then((mod) => mod.Dashboard),
    { ssr: false }
)

export default function Home() {
    return (
        <main className="min-h-screen bg-background">
            <Dashboard />
        </main>
    )
}
