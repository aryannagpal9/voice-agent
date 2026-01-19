import { useNavigate } from "react-router-dom"
import dashboardImg from "/src/assets/observability.png" // your screenshot

const Landing = () => {
  const navigate = useNavigate()

  return (
    <main className="hero">

      {/* HERO */}
      <section className="hero-top">
        <h1>Your AI Voice Agent for Smarter Scheduling</h1>
        <p>Your voice-powered assistant for booking, managing, and understanding appointments.</p>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Try: Book me for tomorrow at 4"
            disabled
          />
          <button onClick={() => navigate("/console")}>
            Talk to the Agent
          </button>
        </div>
      </section>

      {/* OBSERVABILITY */}
      <section className="observability">
        <div className="obs-text">
          <h2>Agent Observability</h2>
          <p>
            Every conversation. Every decision. Every millisecond.
          </p>

         <div className="obs-features">
              <div className="obs-item">
                <span className="obs-icon">⚡</span>
                <div>
                  <h4>Latency & Cost Tracking</h4>
                  <p>Per-session performance and spend visibility</p>
                </div>
              </div>

              <div className="obs-item">
                <span className="obs-icon">🧭</span>
                <div>
                  <h4>Intent Analysis</h4>
                  <p>See where conversations succeed or collapse</p>
                </div>
              </div>

              <div className="obs-item">
                <span className="obs-icon">🛠️</span>
                <div>
                  <h4>Tool Usage Monitoring</h4>
                  <p>Track real actions, not just words</p>
                </div>
              </div>

              <div className="obs-item">
                <span className="obs-icon">🎥</span>
                <div>
                  <h4>Conversation Replays</h4>
                  <p>Review every decision, every response</p>
                </div>
              </div>
            </div>

          <p className="obs-tagline">
            You don’t guess what your agent is doing.  
            You watch it.
          </p>
        </div>

        <div className="obs-image">
          <img src={dashboardImg} alt="Agent Observability Dashboard" />
          <div className="glow" />
        </div>
      </section>

    </main>
  )
}

export default Landing
