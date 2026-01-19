from agent.supabase_client import supabase

class AppointmentDB:
    def create_appointment(self, data: dict):
        return supabase.table("appointments").insert(data).execute()

    def get_appointment(self, contact: str):
        return supabase.table("appointments").select("*").eq("contact", contact).execute()

    def update_appointment(self, contact: str, updates: dict):
        return supabase.table("appointments").update(updates).eq("contact", contact).execute()

    def delete_appointment(self, contact: str):
        return supabase.table("appointments").delete().eq("contact", contact).execute()
