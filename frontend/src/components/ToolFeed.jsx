const ToolFeed = ({ tools }) => {
  return (
    <div className="tool-feed">
      <h3>Tool Calls</h3>

      {tools.map((t, i) => (
        <div key={i} className="tool-card">
          <div className="tool-title">🛠 {t.name}</div>
          <pre>{JSON.stringify(t.data, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

export default ToolFeed;
