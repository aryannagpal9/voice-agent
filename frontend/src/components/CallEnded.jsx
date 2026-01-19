import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./CallEnded.css";

const CallEnded = () => {
  const { sessionId } = useParams();
  const [summary, setSummary] = useState(null);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSummary = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8001/sessions/${sessionId}`);
        const data = await res.json();

        if (!data?.summary) {
          setTimeout(fetchSummary, 1500);
          return;
        }

        setSummary(data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch failed:", err);
        setTimeout(fetchSummary, 2000);
      }
    };

    fetchSummary();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="call-ended-root">
        <div className="loading-card">
          Generating call summary…
        </div>
      </div>
    );
  }

  return (
    <div className="call-ended-root">
      <div className="summary-card-callend">

        <h2>Call Ended</h2>
        <p className="summary-text">{summary.summary}</p>

        <div className="summary-grid">
          <div>
            <span>Outcome</span>
            <strong>{summary.user_outcome}</strong>
          </div>
          <div>
            <span>Agent Performance</span>
            <strong>{summary.agent_performance}</strong>
          </div>
          <div>
            <span>Success</span>
            <strong>{summary.success ? "Yes" : "No"}</strong>
          </div>
        </div>

        <div className="rating-section">
          <span>Rate this call</span>
          <div className="stars">
            {[1,2,3,4,5].map(n => (
              <span
                key={n}
                className={n <= rating ? "star active" : "star"}
                onClick={() => setRating(n)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="summary-actions">
          <button onClick={() => window.location.href="/dashboard"}>
            Go to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default CallEnded;
