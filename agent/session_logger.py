from agent.supabase_client import supabase

def save_session(data: dict):
    return supabase.table("sessions").insert(data).execute()
