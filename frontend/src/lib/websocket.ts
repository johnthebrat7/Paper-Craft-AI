import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { JobStatusWsMessage } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws";

let stompClient: Client | null = null;

export function getStompClient(): Client {
  if (!stompClient) {
    stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
      reconnectDelay: 3000,
      debug: process.env.NODE_ENV === "development" ? (str) => console.log("[STOMP]", str) : undefined,
    });
  }
  return stompClient;
}

export function connectAndSubscribeToJob(
  jobId: string,
  onMessage: (msg: JobStatusWsMessage) => void,
  onConnect?: () => void
): () => void {
  const client = getStompClient();

  let subscription: { unsubscribe: () => void } | null = null;

  client.onConnect = () => {
    onConnect?.();
    subscription = client.subscribe(`/topic/job/${jobId}`, (frame: IMessage) => {
      try {
        const data: JobStatusWsMessage = JSON.parse(frame.body);
        onMessage(data);
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    });
  };

  if (!client.active) {
    client.activate();
  } else if (client.connected) {
    // Already connected, subscribe immediately
    client.onConnect({} as unknown as import("@stomp/stompjs").IFrame);
  }

  // Return cleanup function
  return () => {
    subscription?.unsubscribe();
  };
}

export function disconnectStomp() {
  if (stompClient?.active) {
    stompClient.deactivate();
    stompClient = null;
  }
}
