const KPIBar = ({ stats }) => {
  if (!stats) return null

  return (
    <div className="kpi-bar">
      <div className="kpi kpi-primary">
        Sessions
        <span>{stats.totalSessions}</span>
        <small>Active Conversations</small>
      </div>

      <div className="kpi kpi-success">
        Success Rate
        <span>{stats.successRate}%</span>
        <small>Goal: 85%+</small>
      </div>

      <div className="kpi">
        Avg Duration
        <span>{stats.avgDuration}s</span>
        <small>User Patience Window</small>
      </div>

      <div className="kpi kpi-latency">
        Avg Latency
        <span>{stats.avgLatency}ms</span>
        <small>Perceived Responsiveness</small>
      </div>

      <div className="kpi kpi-cost">
        Avg Cost
        <span>${stats.avgCost}</span>
        <small>Per Session Burn</small>
      </div>
    </div>
  )
}


export default KPIBar
