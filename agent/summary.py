import json
from agent.llm import call_llm

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
