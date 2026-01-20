from fastapi import FastAPI
from ..agent.supabase_client import supabase
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/sessions")
def get_sessions():
    return supabase.table("sessions").select("*").order("created_at", desc=True).execute().data

@app.get("/sessions/{session_id}")
def get_session(session_id: str):
    return supabase.table("sessions").select("*").eq("room_id", session_id).single().execute().data
