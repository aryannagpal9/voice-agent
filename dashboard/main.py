from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from supabase import create_client
from dotenv import load_dotenv
from fastapi import HTTPException
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://frontend-nine-ochre-93.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/sessions")
def get_sessions():
    return supabase.table("sessions").select("*").order("created_at", desc=True).execute().data


@app.get("/sessions/{session_id}")
def get_session(session_id: str):
    res = (
        supabase
        .table("sessions")
        .select("*")
        .eq("room_id", session_id)
        .execute()
    )

    if not res.data:
        raise HTTPException(status_code=404, detail="Session not found")

    return res.data[0]

