import { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

interface Transcript {
  id: string;
  date: string;
  duration: string;
  topic: string;
  status: "completed" | "in-progress";
  transcript: string[];
  agentName?: string;
  agentAvatar?: string;
}

interface Message {
  role: string;
  content: string;
}

interface ChatInterfaceProps {
  transcriptId: string;
  messages: string[];
  onSendMessage: (message: string) => void;
  newMessage: string;
  onMessageChange: (message: string) => void;
}

interface WebSocketTranscript {
  interaction_type:
    | "ping_pong"
    | "update_only"
    | "response_required"
    | "reminder_required";
  transcript?: {
    role: string;
    content: string;
  }[];
  transcript_with_tool_calls?: any[];
  turntaking?: "agent_turn" | "user_turn";
  timestamp?: number;
}

function ChatInterface({
  messages,
  onSendMessage,
  newMessage,
  onMessageChange,
}: ChatInterfaceProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
    }
  };

  return (
    <div className="mt-4 border-t border-secondary-light/20 pt-4">
      <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.startsWith("AI:") ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.startsWith("AI:") ? "bg-secondary/30" : "bg-primary/20"
              }`}
            >
              <div className="text-sm">{message}</div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="flex-1 bg-secondary/50 border border-secondary-light rounded-lg px-4 py-2 text-sm focus:border-primary outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors text-sm font-medium"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export function TranscriptsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTranscript, setSelectedTranscript] =
    useState<Transcript | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChats, setActiveChats] = useState<{ [key: string]: string[] }>(
    {}
  );
  const [newMessage, setNewMessage] = useState<{ [key: string]: string }>({});
  const [liveTranscripts, setLiveTranscripts] = useState<{
    [key: string]: WebSocketTranscript;
  }>({});
  // NEW: State to hold the live transcription text for the currently active call.
  const [realtimeTranscription, setRealtimeTranscription] = useState<string>(
    "Waiting for live transcription..."
  );
  // Optional: State to hold additional realtime events (for debugging)
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([]);

  // Ref for the call-specific WebSocket connection.
  const wsRef = useRef<WebSocket | null>(null);

  // Function to connect to the per-call WebSocket endpoint (/ws/{call_id})
  const connectToWebSocket = (callId: string) => {
    console.log("Attempting to connect WebSocket for call:", callId);
    const API_KEY = import.meta.env.VITE_RETELL_API_KEY;
    const wsUrl = `wss://2218-172-254-141-133.ngrok-free.app/llm-websocket/${callId}`;
    console.log("Connecting to WebSocket URL:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket successfully connected for call:", callId);
      // The server sends a config message automatically.
    };

    ws.onerror = (error) => {
      console.error("WebSocket error for call:", callId, error);
      setError(`WebSocket connection failed: ${error}`);
    };

    ws.onclose = (event) => {
      console.log(
        "WebSocket connection closed for call:",
        callId,
        "Code:",
        event.code,
        "Reason:",
        event.reason
      );
      wsRef.current = null;
      if (event.code === 403) {
        setError("Authentication failed for live transcription");
      }
    };

    ws.onmessage = (event) => {
      console.log("Received WebSocket message for call:", callId, event.data);
      try {
        const data: WebSocketTranscript = JSON.parse(event.data);
        if (data.interaction_type === "ping_pong") {
          ws.send(
            JSON.stringify({
              response_type: "ping_pong",
              timestamp: Date.now(),
              api_key: API_KEY,
            })
          );
          return;
        }
        // When an update_only event is received, update live transcription.
        if (data.interaction_type === "update_only" && data.transcript) {
          // Create a string from the transcript array.
          const updatedTranscript = data.transcript
            .map(
              (msg) =>
                `${msg.role === "agent" ? "AI" : "You"}: ${msg.content || ""}`
            )
            .join("\n");
          // Update the per-call liveTranscripts (if used elsewhere)
          setLiveTranscripts((prev) => ({
            ...prev,
            [callId]: { ...data, transcript: data.transcript },
          }));
          // Update the dedicated live transcription state.
          setRealtimeTranscription(updatedTranscript);
        }
      } catch (error) {
        console.error(
          "Error processing WebSocket message for call:",
          callId,
          error
        );
      }
    };

    wsRef.current = ws;
    return ws;
  };

  // Fetch call history (transcripts) from your API.
  const fetchEndedCalls = async () => {
    const API_KEY = import.meta.env.VITE_RETELL_API_KEY;
    const endpoint = "https://api.retellai.com/v2/list-calls";
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    try {
      setIsLoading(true);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          end_timestamp: {
            gte: oneHourAgo,
            lte: now,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const rawData = await response.json();
      if (!rawData) {
        console.error("No data received from API");
        setTranscripts([]);
        return;
      }

      const data = Array.isArray(rawData) ? rawData : rawData.calls || [];
      const transformedTranscripts: Transcript[] = [];

      for (const call of data) {
        if (!call || typeof call !== "object") continue;

        try {
          const transcript =
            call.transcript_object?.map(
              (msg: Message) =>
                `${msg.role === "agent" ? "AI" : "You"}: ${msg.content || ""}`
            ) || [];

          transformedTranscripts.push({
            id: call.call_id || `unknown-${Date.now()}`,
            date: call.start_timestamp
              ? new Date(call.start_timestamp).toLocaleString()
              : new Date().toLocaleString(),
            duration: call.duration_ms
              ? formatDuration(call.duration_ms)
              : "0s",
            topic:
              call.call_analysis?.call_summary ||
              call.transcript?.substring(0, 50) ||
              `Call ${call.call_id}`,
            // Mark call as completed if status is "ended", otherwise "in-progress"
            status: call.call_status === "ended" ? "completed" : "in-progress",
            transcript,
            agentName: "AI Assistant",
          });

          // If the call is in progress, immediately connect to its WebSocket.
          if (call.call_status !== "ended" && !wsRef.current) {
            connectToWebSocket(call.call_id);
          }
        } catch (err) {
          console.error("Error processing call:", call, err);
          continue;
        }
      }

      setTranscripts(transformedTranscripts);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch call history:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch transcripts"
      );
      setTranscripts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Periodically fetch call history.
  useEffect(() => {
    fetchEndedCalls();
    const interval = setInterval(fetchEndedCalls, 60000);
    return () => clearInterval(interval);
  }, []);

  // Clean up call-specific WebSocket connection on unmount.
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // ----------------------------
  // Connect to the realtime WebSocket endpoint for broadcast events.
  // This endpoint is /realtime on your server.
  // ----------------------------
  useEffect(() => {
    const realtimeWsUrl =
      import.meta.env.VITE_REALTIME_WS_URL ||
      "wss://2218-172-254-141-133.ngrok-free.app/realtime"; // Replace with your public URL.
    const realtimeWs = new WebSocket(realtimeWsUrl);

    realtimeWs.onopen = () => {
      console.log("Realtime WebSocket connection established.");
    };

    realtimeWs.onmessage = (event) => {
      console.log("Received realtime event:", event.data);
      try {
        const eventData = JSON.parse(event.data);
        // If the event contains a call with a transcript, update the live transcription.
        if (eventData.call && eventData.call.transcript) {
          // If transcript is an array, join it into a string.
          const newTranscript = Array.isArray(eventData.call.transcript)
            ? eventData.call.transcript.join("\n")
            : eventData.call.transcript;
          setRealtimeTranscription(newTranscript);
        }
        // Optionally, store the event for debugging.
        setRealtimeEvents((prev) => [...prev, eventData]);
      } catch (error) {
        console.error("Error parsing realtime event:", error);
      }
    };

    realtimeWs.onerror = (error) => {
      console.error("Realtime WebSocket error:", error);
    };

    realtimeWs.onclose = () => {
      console.log("Realtime WebSocket connection closed.");
    };

    return () => {
      realtimeWs.close();
    };
  }, []);

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const filteredTranscripts = transcripts.filter(
    (transcript) =>
      transcript.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transcript.agentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = (transcriptId: string) => {
    if (!activeChats[transcriptId]) {
      setActiveChats((prev) => ({
        ...prev,
        [transcriptId]: ["AI: How can I help you with this conversation?"],
      }));
      setNewMessage((prev) => ({
        ...prev,
        [transcriptId]: "",
      }));
    }
  };

  const fetchSpendingPlan = async (userId: string) => {
    // const endpoint = "https:yyo//api.retellai.com/v2/spending_plan";
    const endpoint = "https://temp-8zyr.onrender.com/analytics/spending_plan/";

    // const endpoint = "http://localhost:8000/analytics/spending_plan";
    console.log(userId);
    const user_id1 = 1;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        body: JSON.stringify({ args: { user_id: user_id1 } }),
      });

      if (!response.ok) {
        // throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.plan) {
        return `Spending Plan Summary: ${data.plan.spending_plan_summary}\n
        - Housing: $${data.plan.housing_amount}\n
        - Food: $${data.plan.food_amount}\n
        - Shopping: $${data.plan.shopping_amount}\n
        - Entertainment: $${data.plan.entertainment_amount}\n
        - Savings: $${data.plan.saving_amount}`;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      // console.error("Error fetching spending plan:", error);
      // return "AI: Sorry, I couldn't fetch the spending plan.";
      return error;
    }
  };

  const handleSendMessage = async (transcriptId: string, message: string) => {
    setActiveChats((prev) => ({
      ...prev,
      [transcriptId]: [...(prev[transcriptId] || []), `You: ${message}`],
    }));

    setNewMessage((prev) => ({
      ...prev,
      [transcriptId]: "",
    }));

    try {
      setIsLoading(true);

      // Fetch AI-generated spending plan
      const aiResponse = await fetchSpendingPlan(transcriptId);

      setActiveChats((prev) => ({
        ...prev,
        [transcriptId]: [...prev[transcriptId], `AI: ${aiResponse}`],
      }));
    } catch (error) {
      console.error("Failed to get AI response:", error);
      setActiveChats((prev) => ({
        ...prev,
        [transcriptId]: [
          ...prev[transcriptId],
          "AI: Sorry, something went wrong.",
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSendMessage = (transcriptId: string, message: string) => {
  //   setActiveChats(prev => ({
  //     ...prev,
  //     [transcriptId]: [...(prev[transcriptId] || []), `You: ${message}`, "AI: I'll help you with that."]
  //   }));
  //   setNewMessage(prev => ({
  //     ...prev,
  //     [transcriptId]: ""
  //   }));
  // };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Loading transcripts...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Support Transcripts</h2>
        <button
          onClick={fetchEndedCalls}
          className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transcripts..."
          className="w-full bg-secondary/50 border border-secondary-light rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary outline-none"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {filteredTranscripts.map((transcript) => (
          <div
            key={transcript.id}
            className="rounded-xl border border-secondary-light bg-secondary/10 hover:bg-secondary-light/10 transition-all overflow-hidden cursor-pointer"
            onClick={() =>
              setSelectedTranscript(
                selectedTranscript?.id === transcript.id ? null : transcript
              )
            }
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {transcript.agentAvatar ? (
                      <img
                        src={transcript.agentAvatar}
                        alt={transcript.agentName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{transcript.topic}</h3>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                    transcript.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  <ShieldCheckIcon className="w-4 h-4" />
                  {transcript.status}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  {transcript.date}
                </div>
                <div>•</div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {transcript.duration}
                </div>
              </div>

              {transcript.status === "in-progress" &&
                liveTranscripts[transcript.id] && (
                  <div className="px-6 py-3 bg-primary/5 border-t border-primary/20">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Live Transcript
                    </div>
                  </div>
                )}

              {selectedTranscript?.id === transcript.id && (
                <div className="mt-6 space-y-3 bg-secondary/20 rounded-lg p-4">
                  {transcript.transcript.map((message, index) => {
                    const [speaker, text] = message.split(": ");
                    const isAI = speaker === "AI";
                    return (
                      <div
                        key={index}
                        className={`flex gap-3 ${
                          isAI ? "justify-start" : "justify-end"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            isAI ? "bg-secondary/30" : "bg-primary/20"
                          }`}
                        >
                          <div className="text-xs font-medium mb-1 text-gray-400">
                            {isAI ? transcript.agentName : "You"}
                          </div>
                          <div className="text-sm">{text}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!activeChats[transcript.id] ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartChat(transcript.id);
                  }}
                  className="mt-4 w-full px-4 py-2 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Ask a follow-up question
                </button>
              ) : (
                <ChatInterface
                  transcriptId={transcript.id}
                  messages={activeChats[transcript.id]}
                  onSendMessage={(message) =>
                    handleSendMessage(transcript.id, message)
                  }
                  newMessage={newMessage[transcript.id] || ""}
                  onMessageChange={(message) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      [transcript.id]: message,
                    }))
                  }
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
