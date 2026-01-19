import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from "recharts"

const MetricsCharts = ({ sessions }) => {
  if (!sessions?.length) return null

  const latencyData = sessions.map((s, i) => ({
    name: `S${i + 1}`,
    latency: s.avg_latency,
    cost: s.cost_usd
  }))

  const intentMap = {}
  sessions.forEach(s => {
    intentMap[s.intent] = (intentMap[s.intent] || 0) + 1
  })

  const intentColors = {
    Booking: "#225bc5ff",
    Cancellation: "#5373d4ff",
    Retrieval: "#9ebbebff",
    Modification: "#cabaf3ff",
    Other: "#99b8e2ff"
  }

  const intentData = Object.entries(intentMap).map(([k, v]) => ({
    intent: k,
    count: v,
    fill: intentColors[k] || "#64748b"
  }))

  const tooltipStyle = {
    background: "#0f172a",
    border: "1px solid #1e293b",
    color: "#e5e7eb"
  }

  return (
    <div className="charts">

      {/* LATENCY */}
      <div className="chart-card">
        <h3>Latency Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={latencyData}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* COST */}
      <div className="chart-card">
        <h3>Cost Per Session</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={latencyData}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="cost" fill="#8bc6edff" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* INTENT */}
      <div className="chart-card">
        <h3>User Intent Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={intentData}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis dataKey="intent" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count">
              {intentData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}

export default MetricsCharts
