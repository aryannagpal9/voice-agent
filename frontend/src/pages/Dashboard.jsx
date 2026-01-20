import { useEffect, useState } from "react"
import SessionList from "../components/SessionList"
import SessionViewer from "../components/SessionViewer"
import KPIBar from "../components/KPIBar"
import MetricsCharts from "../components/MetricsCharts"

const API = "https://dashboard-kappa-steel-96.vercel.app"

const safeParse = (value, fallback) => {
  if (!value) return fallback
  if (typeof value === "string") {
    try { return JSON.parse(value) } catch { return fallback }
  }
  return value
}

const deriveIntent = transcript => {
  const text = transcript
    .filter(m => m.role === "user")
    .map(m => m.content.join(" ").toLowerCase())
    .join(" ")

  if (text.includes("book")) return "Booking"
  if (text.includes("cancel")) return "Cancellation"
  if (text.includes("modify") || text.includes("reschedule") || text.includes("change"))
    return "Modification"
  if (text.includes("check") || text.includes("retrieve") || text.includes("see"))
    return "Retrieval"

  return "Other"
}

const Dashboard = () => {
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch(`${API}/sessions`)
      .then(res => res.json())
      .then(data => {
        const parsed = data.map(s => {
          const transcript = safeParse(s.transcript, [])
          const tool_calls = safeParse(s.tool_calls, [])

          return {
            ...s,
            transcript,
            tool_calls,
            intent: deriveIntent(transcript),
            avg_latency: s.total_latency_ms || 0,
            cost_usd: Number(s.cost_estimate_usd || 0),
            success: s.success === true
          }
        })

        // Sort newest → oldest
        parsed.sort((a, b) => 
          new Date(b.started_at) - new Date(a.started_at)
        )

        setSessions(parsed)

        // Auto-select latest session
        if (parsed.length > 0) {
          setActiveSession(parsed[0])
        }

        const total = parsed.length
        const successful = parsed.filter(s => s.success).length

        const avgDuration =
          parsed.reduce((a, b) => a + (b.duration_seconds || 0), 0) / total

        const avgLatency =
          parsed.reduce((a, b) => a + (b.avg_latency || 0), 0) / total

        const avgCost =
          parsed.reduce((a, b) => a + (b.cost_usd || 0), 0) / total

        setStats({
          totalSessions: total,
          successRate: Math.round((successful / total) * 100),
          avgDuration: Math.round(avgDuration),
          avgLatency: Math.round(avgLatency),
          avgCost: avgCost.toFixed(4)
        })
      })
      .catch(console.error)
  }, [])

  return (
    <div className="dashboard dark">
      <KPIBar stats={stats} />
      <MetricsCharts sessions={sessions} />

      <div className="dashboard-body">
        <SessionList
          sessions={sessions}
          onSelect={setActiveSession}
          activeSession={activeSession}
        />
        <SessionViewer session={activeSession} />
      </div>
    </div>
  )
}

export default Dashboard
