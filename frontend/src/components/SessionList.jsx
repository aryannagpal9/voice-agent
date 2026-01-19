const SessionList = ({ sessions, onSelect }) => {
  if (!Array.isArray(sessions)) {
    return <div className="session-list">Loading sessions...</div>;
  }

  return (
    <div className="session-list">
      <h3>Sessions</h3>

      {sessions.map((s) => (
        <div
          key={s.id}
          className="session-item"
          onClick={() => onSelect(s)}
        >
          <div className="session-room">{s.room_id}</div>
          <div className="session-time">
            {new Date(s.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionList;
