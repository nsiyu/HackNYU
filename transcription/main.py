import os
import json
from typing import List

import uvicorn
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, Response

app = FastAPI()

# -----------------------------
# Connection Manager for broadcasting realtime events to UI clients.
# -----------------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"WebSocket client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"WebSocket client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        print(f"Broadcasting message to {len(self.active_connections)} clients.")
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# -----------------------------
# Dedicated WebSocket endpoint for LLM integration per call.
# Endpoint: /llm-websocket/{call_id}
# Retell AI will connect here using the call id.
# -----------------------------
@app.websocket("/llm-websocket/{call_id}")
async def websocket_handler(websocket: WebSocket, call_id: str):
    try:
        await websocket.accept()
        llm_client = None

        # Send optional config to Retell server.
        # (If needed, add any additional flag like "transcribe_live": true)
        config = {
            "response_type": "config",
            "config": {
                "auto_reconnect": True,
                "call_details": True,
                "update_only": True,
                "transcript_with_tool_calls": True,
                # "transcribe_live": True,  # Uncomment if required by documentation.
                "api_key": "key_23c538c92399d1873e6822c65945"
            },
            "response_id": 1,
        }
        await websocket.send_json(config)
        response_id = 0

        async def handle_message(request_json):
            nonlocal response_id
            nonlocal llm_client
            interaction_type = request_json.get("interaction_type")
            print(f"Received interaction_type: {interaction_type}")
            # There are 5 types of interaction_type:
            # call_details, ping_pong, update_only, response_required, and reminder_required.
            if interaction_type == "call_details":
                # Process call details (for example, setting up your LLM client)
                number = "+1-" + request_json["call"]["from_number"][2:5] + "-" + \
                         request_json["call"]["from_number"][5:8] + "-" + \
                         request_json["call"]["from_number"][8:]
                # For example, initialize your LLM client using the user's name.
                # (Assuming you have a database `db` and LlmClient class defined.)
                # llm_client = LlmClient(db["users"][number]["name"])
                print(f"Call details received for call {call_id}, from number: {number}")
                # Optionally send a first message to signal readiness.
                # first_event = llm_client.draft_begin_message()
                # await websocket.send_json(first_event.__dict__)
                return

            if interaction_type == "ping_pong":
                await websocket.send_json({
                    "response_type": "ping_pong",
                    "timestamp": request_json["timestamp"],
                })
                return

            # NEW: Check if interaction_type is update_only.
            if interaction_type == "update_only":
                # Here, instead of ignoring update_only events, we broadcast them
                # to our realtime clients so that the UI can display live transcription.
                print(f"Update only event received for call {call_id}. Broadcasting to UI.")
                await manager.broadcast(json.dumps(request_json))
                return

            if interaction_type in ("response_required", "reminder_required"):
                response_id = request_json["response_id"]
                # Process response_required events, generate a response via your LLM, etc.
                # For example:
                # request = ResponseRequiredRequest(
                #     interaction_type=request_json["interaction_type"],
                #     response_id=response_id,
                #     transcript=request_json["transcript"],
                # )
                # async for event in llm_client.draft_response(request):
                #     await websocket.send_json(event.__dict__)
                #     if request.response_id < response_id:
                #         break  # New response needed, abandon this one.
                print(f"Received {interaction_type} event with response_id={response_id}")
                return

        async for data in websocket.iter_json():
            # Create a task for handling each message.
            import asyncio
            asyncio.create_task(handle_message(data))

    except WebSocketDisconnect:
        print(f"LLM WebSocket disconnected for {call_id}")
    except Exception as e:
        print(f"Error in LLM WebSocket: {e} for {call_id}")
        await websocket.close(1011, "Server error")
    finally:
        print(f"LLM WebSocket connection closed for {call_id}")

# -----------------------------
# Realtime WebSocket endpoint for broadcasting events to UI clients.
# Endpoint: /realtime
# -----------------------------
@app.websocket("/realtime")
async def realtime_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # This endpoint is for broadcasting; optionally process incoming messages.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# -----------------------------
# Webhook endpoint for Retell AI events.
# Retell AI will POST events (e.g. call_started, call_ended, etc.) here.
# -----------------------------
@app.post("/webhook")
async def webhook_endpoint(request: Request):
    try:
        post_data = await request.json()
        event = post_data.get("event")
        call = post_data.get("call", {})
        call_id = call.get("call_id", "unknown")
        print(f"Received webhook event: {event} for call {call_id}")

        # Broadcast the webhook event to all realtime clients.
        broadcast_data = json.dumps({
            "event": event,
            "call": call
        })
        await manager.broadcast(broadcast_data)
        # Return a 204 No Content response.
        return Response(status_code=204)
    except Exception as e:
        print(f"Error processing webhook: {e}")
        return JSONResponse(status_code=500, content={"message": "Internal Server Error"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
