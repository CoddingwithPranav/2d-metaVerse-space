// services/websocket.ts
import type { IncomingMessage } from "@/types";

type MessageHandler = (msg: IncomingMessage) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessage: MessageHandler;

  constructor(url: string, onMessage: MessageHandler) {
    this.url = url;
    this.onMessage = onMessage;
  }

  connect(token: string, spaceId: string) {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.send({ type: "join", payload: { token, spaceId } });
    };

    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as IncomingMessage;
        this.onMessage(msg);
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
    };
  }

  send(payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  move(x: number, y: number) {
    this.send({ type: "move", payload: { x, y } });
  }

  sendAction(action: string, emoji?: string) {
    this.send({ type: "user-action", payload: { action, userId: "", emoji } });
  }

  sendMessage(message: string) {
    this.send({ type: "send-message", payload: { message } });
  }

  close() {
    this.ws?.close();
  }
}
