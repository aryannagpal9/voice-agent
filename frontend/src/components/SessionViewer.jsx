const SessionViewer = ({ session }) => {
  if (!session) {
    return <div className="session-viewer">Select a session</div>;
  }

  // Transcript already parsed in Dashboard
  const transcript = session.transcript || [];

  return (
    <div className="session-viewer">

      {/* HEADER */}
      <div className="session-header">
        <h2>Session</h2>
        <div className="meta">
          <span><b>Room:</b> {session.room_id}</span>
          <span><b>Agent:</b> {session.agent_name}</span>
          <span><b>Started:</b> {new Date(session.started_at).toLocaleString()}</span>
        </div>

        {/* METRICS STRIP */}
        <div className="metrics-strip">
          <div className="metric"><small>Duration</small><span>{session.duration_seconds}s</span></div>
          <div className="metric"><small>Total Latency</small><span>{session.total_latency_ms}ms</span></div>
          <div className="metric"><small>LLM</small><span>{session.llm_latency_ms}ms</span></div>
          <div className="metric"><small>STT</small><span>{session.stt_latency_ms}ms</span></div>
          <div className="metric"><small>Cost</small><span>${session.cost_estimate_usd}</span></div>
          <div className="metric"><small>Tokens</small><span>{session.llm_tokens}</span></div>
          <div className={`metric outcome ${session.success ? "success" : "fail"}`}>
            <small>Outcome</small>
            <span>{session.success ? "Success" : "Failed"}</span>
          </div>
        </div>
         <h3 className="summary-title">Session Summary</h3>

          <div className="summary-card">
            <p>{session.summary || "No summary available."}</p>

            <div className="summary-metrics">
              <div><b>User Outcome:</b> {session.user_outcome}</div>
              <div><b>Agent Performance:</b> {session.agent_performance}</div>
              <div><b>User Frustration:</b> {session.user_frustration}</div>
              {!session.success && (
                <div className="failure"><b>Failure Reason:</b> {session.failure_reason}</div>
              )}
            </div>
          </div>
      </div>

      {/* MAIN GRID */}
      <div className="viewer-grid">

        {/* CONVERSATION */}
        <div className="conversation-panel">
          <h3>Conversation</h3>

          {transcript.length === 0 && (
            <p className="empty">No messages found</p>
          )}

          {transcript.map((msg, i) => {
            const role = msg.role || "system";
            const text = msg.content?.join(" ") || "";

            return (
              <div key={i} className={`msg ${role}`}>
                <span className="role">{role}</span>
                <p>{text}</p>
                {msg.created_at && (
                  <small className="timestamp">
                    {new Date(msg.created_at * 1000).toLocaleTimeString()}
                  </small>
                )}
              </div>
            );
          })}
        </div>

        {/* TOOLS + SUMMARY */}
        <div className="tools-panel">
          <h3>Tool Calls</h3>

          {session.tool_calls?.map((tool, i) => (
            <div key={i} className="tool-card">
              <div className="tool-name">🛠 {tool.name}</div>
              <pre>{JSON.stringify(tool.data, null, 2)}</pre>
            </div>
          ))}

         
        </div>

      </div>
    </div>
  );
};

export default SessionViewer;
