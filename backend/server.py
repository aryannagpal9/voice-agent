from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from livekit import api
from dotenv import load_dotenv
import os, uuid
from livekit.api import LiveKitAPI, ListRoomsRequest

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def generate_room_name():
    name = "room-" + str(uuid.uuid4())[:8]
    api_client = LiveKitAPI()
    rooms = await api_client.room.list_rooms(ListRoomsRequest())
    await api_client.aclose()
    existing = [r.name for r in rooms.rooms]
    while name in existing:
        name = "room-" + str(uuid.uuid4())[:8]
    return name

@app.get("/getToken")
async def get_token(name: str = "guest", room: str | None = None):
    if not room:
        room = await generate_room_name()

    token = api.AccessToken(
        os.getenv("LIVEKIT_API_KEY"),
        os.getenv("LIVEKIT_API_SECRET")
    ).with_identity(name).with_name(name).with_grants(
        api.VideoGrants(room_join=True, room=room)
    )

    return {"token": token.to_jwt()}

