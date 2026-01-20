# **Voice Agent System - Technical Documentation**

---

## **1. Overview**
The **Voice Agent** system is a **voice-powered AI assistant** designed for scheduling, managing, and analyzing appointments. It integrates **LiveKit** for real-time voice communication, **Supabase** for data storage, and **OpenAI/LLM models** for natural language processing.

The system consists of:
- **Frontend (React + Vite)** – User interface for interacting with the AI agent.
- **Backend (FastAPI)** – API endpoints for session management and data retrieval.
- **Agent (LiveKit Agents)** – Voice processing and LLM integration.
- **Dashboard (FastAPI)** – Observability and analytics for monitoring agent performance.

---

## **2. Architecture**
The system follows a **microservices architecture** with the following components:

### **2.1 Frontend (React + Vite)**
- **Purpose**: Provides a UI for users to interact with the AI agent.
- **Key Features**:
  - Voice-based interaction via **LiveKit**.
  - Real-time transcript display.
  - Session analytics and observability.
  - Responsive UI with **Tailwind CSS** (via `index.css` and `App.css`).

### **2.2 Backend (FastAPI)**
- **Purpose**: Handles API requests for session management, token generation, and data retrieval.
- **Key Features**:
  - **`server.py`**: Generates **LiveKit access tokens** for room joining.
  - **`dashboard/main.py`**: Provides **session analytics** via Supabase.

### **2.3 Agent (LiveKit Agents)**
- **Purpose**: Processes voice input, interacts with LLM, and manages appointments.
- **Key Features**:
  - **Speech-to-text (STT)** 
  - **LLM integration** (Mistral AI via OpenRouter).
  - **Appointment management** (book, modify, cancel).
  - **Tool-based workflows** (identify user, fetch slots, book appointments etc).
  - **Avatar** setup using **bey**

### **2.4 Database (Supabase)**
- **Purpose**: Stores user data, appointments, and session logs.
- **Key Tables**:
  - `users` – Stores user profiles.
  - `appointments` – Manages booked appointments.
  - `sessions` – Logs conversation history and analytics.

---

## **3. Setup & Installation**

### **3.1 Prerequisites**
- **Node.js** (v18+)
- **Python** (v3.11+)
- **Docker** (for containerized deployment)
- **Supabase** account (for database)
- **LiveKit** account (for voice communication)

### **3.2 Frontend Setup**
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   - The app will be available at `http://localhost:5173`.

### **3.3 Backend Setup**
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the FastAPI server:
   ```bash
   uvicorn server:app --reload
   ```
   - The API will be available at `http://localhost:8000`.

### **3.4 Agent Setup**
1. Navigate to the `agent` directory:
   ```bash
   cd agent
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the agent server:
   ```bash
   python agent.py start
   ```

### **3.5 Supabase Configuration**
1. Create a Supabase project at [supabase.com](https://supabase.com/).
2. Set up the following tables:
   - `users` (`id`, `name`, `created_at`)
   - `appointments` (`contact`, `date`, `time`, `status`)
   - `sessions` (`room_id`, `transcript`, `summary`, `metrics`)
3. Store the **Supabase URL** and **API key** in `.env`:
   ```env
   SUPABASE_URL=https://your-project-url.supabase.co
   SUPABASE_SECRET_KEY=your-secret-key
   ```

### **3.6 LiveKit Configuration**
1. Sign up at [LiveKit](https://livekit.io/).
2. Set up a **LiveKit project** and note the **API key & secret**.
3. Configure `livekit.toml` in the `agent` directory:
   ```toml
   [project]
     subdomain = "your-subdomain"
   [agent]
     id = "your-agent-id"
   ```

---

## **4. API Documentation**

### **4.1 Backend API Endpoints**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/getToken` | `GET` | Generates a LiveKit access token for room joining. |
| `/sessions` | `GET` | Retrieves all sessions from Supabase. |
| `/sessions/{session_id}` | `GET` | Retrieves details of a specific session. |

### **4.2 Agent API (LiveKit Agents)**
The agent uses **LiveKit’s voice processing** and **LLM integration** via:
- **Silero STT** (Speech-to-text).
- **OpenRouter API** (LLM calls).
- **Supabase** (data persistence).

#### **Key Functions**
| Function | Purpose |
|----------|---------|
| `call_llm(messages)` | Sends user input to LLM for processing. |
| `identify_user(phone, name)` | Registers a new user in Supabase. |
| `fetch_slots()` | Retrieves available appointment slots. |
| `book_appointment(user_id, date, time)` | Books an appointment. |
.
.
.
---


## **5. Configuration**

### **5.1 Environment Variables**
| Variable | Purpose |
|----------|---------|
| `OPENROUTER_API_KEY` | API key for OpenRouter LLM. |
| `LIVEKIT_URL` | LiveKit URL. |
| `LIVEKIT_API_KEY` | LiveKit API key. |
| `LIVEKIT_API_SECRET` | LiveKit API secret. |
| `SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SECRET_KEY` | Supabase API key. |
| `BEY_API_KEY` | BEY API key. |

### **6.2 `pyproject.toml` (Agent)**
```toml
[project]
name = "voice-agent"
version = "0.1.0"
dependencies = [
    "livekit-agents",
    "livekit-plugins-bey",
    "livekit-plugins-openai",
    "livekit-plugins-silero",
    "livekit-plugins-deepgram",
    "livekit-plugins-cartesia",
    "livekit-plugins-turn-detector",
    "python-dotenv",
    "livekit-api",
    "uvicorn",
    "fastapi",
    "pydantic",
    "requests",
    "supabase"
]
```

### **6.3 `requirements.txt` (Backend & Dashboard)**
```text
python-dotenv
uvicorn
fastapi
livekit-api
livekit
supabase
```

---


## **7. Deployment Instructions**

### **7.1 Docker Deployment**
FastAPI servers and frontend deployed using vercel 
Agent Deployed using Livekit Cloud

------------------------------------------------------
## **8. Edge cases to test**
Voice & STT Edge Cases

    User interrupts the agent mid-sentence
    Validated turn-detector + barge-in handling so the agent stops talking and re-prioritizes user intent instead of rambling like a bad IVR.
    
    Partial or noisy speech input
    Tested STT behavior when the user trails off (“uh… book… tomorrow…”) or speaks in a noisy environment. Agent confirms intent instead of hallucinating bookings.
    
    Rapid back-to-back utterances
    User speaks twice before LLM response returns. Ensured messages are queued correctly and not merged or dropped.

LLM & Reasoning Failures

    Ambiguous date/time inputs
    “Book it next Friday evening” → agent requests clarification instead of guessing and causing calendar damage.
    
    Intent switching mid-conversation
    User starts booking, then says “actually cancel my last appointment.” Agent correctly abandons the booking flow and switches tools.
    
    LLM tool-call failure or timeout
    Simulated OpenRouter latency / failure → agent falls back to a graceful apology + retry instead of hard-crashing the session.

Appointment Logic Edge Cases

    Double-booking race condition
    Two users attempting to book the same slot simultaneously → Supabase constraint + retry logic prevents duplicate bookings.
    
    Modify after cancel
    User tries to modify an appointment that was already canceled → agent detects stale state and explains cleanly.
    
    Invalid slot selection
    User selects a slot that existed earlier in the convo but is no longer available → agent re-fetches slots before booking.

Session & Observability Edge Cases
    
    Session drops mid-call
    Browser refresh or network loss → session marked as incomplete, transcript saved up to last utterance, no orphaned state.
    
    Agent crash during active room
    Dashboard still shows partial metrics (duration, last event, error type) instead of losing observability entirely.
    
    High-latency STT/LLM path
    Artificially delayed responses to validate end-to-end latency metrics and identify bottlenecks in the dashboard.


------------------------------------------------------
## **9. Future Improvements**
- **Multi-language support** (STT & LLM).
- **Advanced analytics** (sentiment analysis, agent performance trends).
- **Tool Usage using MCP servers.**
- **Rearchitecture to reduce latency** for metric loading.
- **MultiAgent Support**
- **Learning Agent Support**

---

## **10. Conclusion**
The **Voice Agent** system provides a **observable, and voice-powered** solution for appointment management. By leveraging **LiveKit, Supabase, and LLM models**, it enables seamless user interactions while maintaining full observability.

---

**Maintainer:** Aryan Nagpal
