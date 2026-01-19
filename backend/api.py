from datetime import datetime
from supabase_client import supabase

# --- Identify / Create User ---

def identify_user(phone: str, name: str):
    existing = supabase.table("users") \
        .select("*") \
        .eq("id", phone) \
        .execute()

    if not existing.data:
        supabase.table("users").insert({
            "id": phone,
            "name": name,
            "created_at": datetime.utcnow().isoformat()
        }).execute()

    return {
        "status": "identified",
        "user_id": phone,
        "name": name
    }


# --- Slots ---

AVAILABLE_SLOTS = [
    {"date": "2026-01-21", "time": "15:00"},
    {"date": "2026-01-20", "time": "16:00"},
    {"date": "2026-01-20", "time": "11:00"},
    {"date": "2026-01-21", "time": "13:00"},
    {"date": "2026-01-22", "time": "14:00"},
    {"date": "2026-01-22", "time": "16:00"},
    {"date": "2026-01-23", "time": "16:00"},
]

def fetch_slots():
    booked = supabase.table("appointments") \
        .select("date, time") \
        .eq("status", "booked") \
        .execute()

    booked_set = { (b["date"], b["time"]) for b in booked.data }

    empty_slots = [
        slot for slot in AVAILABLE_SLOTS
        if (slot["date"], slot["time"]) not in booked_set
    ]

    return {
        "available_slots": empty_slots,
        "timezone": "Asia/Kolkata"
    }



# --- Book Appointment ---

def book_appointment(user_id: str, date: str, time: str):
    if {"date": date, "time": time} not in AVAILABLE_SLOTS:
        return {
            "status": "invalid_slot",
            "message": "That time is not available.",
            "available_slots": AVAILABLE_SLOTS
        }

    existing = supabase.table("appointments") \
        .select("*") \
        .eq("date", date) \
        .eq("time", time) \
        .eq("status", "booked") \
        .execute()

    if existing.data:
        return {
            "status": "already_booked",
            "message": "That slot is already taken.",
            "available_slots": AVAILABLE_SLOTS
        }

    result = supabase.table("appointments").insert({
        "user_id": user_id,
        "date": date,
        "time": time,
        "status": "booked",
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    return {
        "status": "success",
        "message": "Your appointment is confirmed.",
        "appointment_id": result.data[0]["id"]
    }


# --- Retrieve Appointments ---

def retrieve_appointments(user_id: str):
    result = supabase.table("appointments") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .execute()

    return {
        "appointments": result.data,
        "count": len(result.data)
    }


# --- Modify Appointment ---

def modify_appointment(appointment_id: str, new_date: str, new_time: str):
    if {"date": new_date, "time": new_time} not in AVAILABLE_SLOTS:
        return {
            "status": "invalid_slot",
            "message": "That time is not available.",
            "available_slots": AVAILABLE_SLOTS
        }

    supabase.table("appointments") \
        .update({"date": new_date, "time": new_time}) \
        .eq("id", appointment_id) \
        .execute()

    return {
        "status": "modified",
        "message": "Your appointment has been updated.",
        "appointment_id": appointment_id
    }


# --- Cancel Appointment ---

def cancel_appointment(appointment_id: str):
    supabase.table("appointments") \
        .update({"status": "cancelled"}) \
        .eq("id", appointment_id) \
        .execute()

    return {
        "status": "cancelled",
        "message": "Your appointment is cancelled.",
        "appointment_id": appointment_id
    }


# --- End Conversation ---

def end_conversation(conversation_id: str, text: str):
    supabase.table("summaries").insert({
        "conversation_id": conversation_id,
        "text": text,
        "timestamp": datetime.utcnow().isoformat()
    }).execute()

    return {"status": "ended", "message": "Goodbye."}
