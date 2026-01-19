const Metrics = ({ metadata }) => {
  const events = metadata?.events || [];

  return (
    <div className="metrics">
      <h3>System Events</h3>
      <div className="metrics-grid">
        {events.slice(-6).map((e, i) => (
          <div key={i} className="metric-card">
            <div>{e.type}</div>
            <small>{new Date(e.created_at * 1000).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Metrics;
