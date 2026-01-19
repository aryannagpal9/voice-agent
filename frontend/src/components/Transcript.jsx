const Transcript = ({ items }) => {
  return (
    <div className="transcript">
      <h3>Conversation</h3>

      {items.map((m, i) => (
        <div key={i} className={`msg ${m.role}`}>
          <strong>{m.role || m.type}</strong>
          <p>{m.content?.join(" ") || m.output}</p>
        </div>
      ))}
    </div>
  );
};

export default Transcript;
