from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    RunContext,
    cli,
    function_tool,
    inference,
)
from livekit.agents.voice.events import CloseEvent, ErrorEvent
from livekit.plugins import silero
from dotenv import load_dotenv
from datetime import datetime, timezone
import json
import time
import api
from prompts import build_system_prompt
from supabase_client import supabase
from livekit.agents import AgentSession, Agent, RoomInputOptions
import asyncio
import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()
server = AgentServer()

API_KEY = os.getenv("OPENROUTER_API_KEY")

def call_llm(messages):
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "mistralai/mistral-7b-instruct",
            "messages": messages,
            "temperature": 0
        }
    )

    data = response.json()
    print("LLM RAW:", data)

    return data["choices"][0]["message"]["content"]

# ------------------ GLOBAL TRACKERS ------------------

tool_events = []
user_identity = {"phone": None, "name": None}
stt_latencies = []

def ts_to_iso(ts):
    if isinstance(ts, (int, float)):
        return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()
    return ts

async def record_tool(name, payload):
    tool_events.append({
        "name": name,
        "time": datetime.utcnow().isoformat(),
        "data": payload
    })


def generate_session_summary(transcript, tools):
    messages = [
        {
            "role": "system",
            "content": "You are an AI quality evaluator for voice agents. Do not store personal important information like phone number."
        },
        {
            "role": "user",
            "content": f"""
                    Conversation:
                    {json.dumps(transcript, indent=2)}

                    Tool Calls:
                    {json.dumps(tools, indent=2)}

                    Return ONLY valid JSON in this format:

                    {{
                    "summary": "1-2 sentence plain English summary about the conversation.",
                    "success": true or false,
                    "reason": "Why it failed or NA",
                    "user_outcome": "Booked/Cancelled/Retrieved/Modified",
                    "agent_performance": "Good / Average / Poor",
                    "user_frustration": "Low / Medium / High"
                    }}
                    """
        }
    ]

    return call_llm(messages)
# ------------------ FUNCTION TOOLS ------------------

@function_tool
async def identify_user(context: RunContext, phone: str, name: str):
    result = api.identify_user(phone, name)
    user_identity["phone"] = phone
    user_identity["name"] = name
    await record_tool("identify_user", {"phone": phone, "name": name, "result": result})
    return result

@function_tool
async def fetch_slots(context: RunContext):
    result = api.fetch_slots()
    await record_tool("fetch_slots", result)
    return result

@function_tool
async def book_appointment(context: RunContext, user_id: str, date: str, time: str):
    result = api.book_appointment(user_id, date, time)
    await record_tool("book_appointment", {
        "user_id": user_id,
        "date": date,
        "time": time,
        "result": result
    })
    return result

@function_tool
async def retrieve_appointments(context: RunContext, user_id: str):
    result = api.retrieve_appointments(user_id)
    await record_tool("retrieve_appointments", {"user_id": user_id, "result": result})
    return result

@function_tool
async def modify_appointment(context: RunContext, appointment_id: str, new_date: str, new_time: str):
    result = api.modify_appointment(appointment_id, new_date, new_time)
    await record_tool("modify_appointment", {
        "appointment_id": appointment_id,
        "new_date": new_date,
        "new_time": new_time,
        "result": result
    })
    return result

@function_tool
async def cancel_appointment(context: RunContext, appointment_id: str):
    result = api.cancel_appointment(appointment_id)
    await record_tool("cancel_appointment", {"appointment_id": appointment_id, "result": result})
    return result

@function_tool
async def end_conversation(context: RunContext):
    return {"status": "ended"}

# ------------------ SESSION END HANDLER ------------------

async def on_session_end(ctx: JobContext):
    print("SESSION ENDED")

    report = ctx.make_session_report()
    data = report.to_dict()

    events = data.get("events", [])
    room_id = data.get("room") if isinstance(data.get("room"), str) else data.get("room", {}).get("name")

    timestamps = [e["created_at"] for e in events if "created_at" in e]

    if timestamps:
        started_raw = min(timestamps)
        ended_raw = max(timestamps)
        started = ts_to_iso(started_raw)
        ended = ts_to_iso(ended_raw)
        duration = int(ended_raw - started_raw)
    else:
        started = ended = duration = None

    # Transcript
    transcript = []
    for e in events:
        if e["type"] == "conversation_item_added":
            item = e["item"]
            transcript.append({
                "role": item.get("role"),
                "content": item.get("content"),
                "created_at": item.get("created_at"),
                "metrics": item.get("metrics", {})
            })

    # LLM + TTS Latency
    llm_ttft = []
    tts_ttfb = []

    for t in transcript:
        m = t.get("metrics", {})
        if "llm_node_ttft" in m:
            llm_ttft.append(m["llm_node_ttft"])
        if "tts_node_ttfb" in m:
            tts_ttfb.append(m["tts_node_ttfb"])

    llm_latency_ms = int(sum(llm_ttft) / len(llm_ttft) * 1000) if llm_ttft else None
    tts_latency_ms = int(sum(tts_ttfb) / len(tts_ttfb) * 1000) if tts_ttfb else None

    stt_latency_ms = int(sum(stt_latencies) / len(stt_latencies)) if stt_latencies else None

    total_latency_ms = (llm_latency_ms or 0) + (tts_latency_ms or 0) + (stt_latency_ms or 0)

    # TTS characters
    tts_characters = sum(len(" ".join(t["content"])) for t in transcript if t["role"] == "assistant")

    # Token + cost estimate
    estimated_tokens = len(json.dumps(transcript)) // 4
    cost_estimate = round(estimated_tokens * 0.000002, 5)

    # LLM feedback
    raw_feedback = generate_session_summary(transcript, tool_events)

    try:
        feedback = json.loads(raw_feedback)
    except:
        feedback = {
            "summary": raw_feedback,
            "success": None,
            "reason": "Parsing failed",
            "user_outcome": "Unknown",
            "agent_performance": "Unknown",
            "user_frustration": "Unknown"
        }

    # Save to Supabase
    res = supabase.table("sessions").insert({
        "room_id": room_id,
        "participant_id": user_identity["phone"],
        "agent_name": "appointment-agent",
        "started_at": started,
        "ended_at": ended,
        "duration_seconds": duration,
        "transcript": transcript,
        "tool_calls": tool_events,

        "summary": feedback["summary"],
        "success": feedback["success"],
        "failure_reason": feedback["reason"],
        "user_outcome": feedback["user_outcome"],
        "agent_performance": feedback["agent_performance"],
        "user_frustration": feedback["user_frustration"],

        "llm_tokens": estimated_tokens,
        "tts_characters": tts_characters,
        "stt_latency_ms": stt_latency_ms,
        "llm_latency_ms": llm_latency_ms,
        "tts_latency_ms": tts_latency_ms,
        "total_latency_ms": total_latency_ms,
        "cost_estimate_usd": cost_estimate,
        "metadata": data,
    }).execute()

    print("SUPABASE RESPONSE:", res)

# ------------------ AGENT ENTRYPOINT ------------------

from livekit.plugins import bey
import os


@server.rtc_session(on_session_end=on_session_end)
async def entrypoint(ctx: JobContext):
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=inference.STT("deepgram/nova-3"),
        llm=inference.LLM("openai/gpt-4.1-mini"),
        tts=inference.TTS(
            "cartesia/sonic-3",
            voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc"
        ),
        user_away_timeout=10,
        use_tts_aligned_transcript=True,
        preemptive_generation=True,
    )

    # --- AVATAR SESSION ---
    avatar = bey.AvatarSession(
        avatar_id=os.getenv("BEY_AVATAR_ID")
    )
    await avatar.start(session, room=ctx.room, livekit_url="wss://voice-agent-9oszevc3.livekit.cloud", livekit_api_key=os.getenv("LIVEKIT_API_KEY"), livekit_api_secret=os.getenv("LIVEKIT_API_SECRET"))

    # --- STT LATENCY TRACKING ---
    stt_start_time = {}

    @session.on("user_state_changed")
    def on_user_speaking(ev):
        if ev.new_state == "speaking":
            stt_start_time["t"] = time.time()

    @session.on("user_input_transcribed")
    def on_transcription(ev):
        if ev.is_final and "t" in stt_start_time:
            latency = (time.time() - stt_start_time["t"]) * 1000
            stt_latencies.append(latency)

    # --- ERROR HANDLING ---
    @session.on("error")
    def on_error(ev: ErrorEvent):
        print("ERROR:", ev.error)
        if not ev.error.recoverable:
            session.say("I'm having trouble right now. Please try again later.")

    @session.on("close")
    def on_close(_: CloseEvent):
        print("Session closed")

    # --- AGENT ---
    agent = Agent(
        instructions=build_system_prompt(),
        tools=[
            identify_user,
            fetch_slots,
            book_appointment,
            retrieve_appointments,
            modify_appointment,
            cancel_appointment,
            end_conversation
        ],
    )

    # 🚀 PARALLEL START (THIS IS THE FIX)
    await asyncio.gather(
        session.start(
            agent=agent,
            room=ctx.room,
            room_input_options=RoomInputOptions(video_enabled=True),
        )
    )

    # 🔊 SPEAK IMMEDIATELY (DON'T WAIT FOR FACE)
    await session.generate_reply(
        instructions="Hello! I can help you book, reschedule, or check appointments. What would you like to do?"
    )

if __name__ == "__main__":
    cli.run_app(server)