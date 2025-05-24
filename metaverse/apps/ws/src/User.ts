import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { OutgoingMessage } from "./types";
import { dbClient } from "@repo/db/client";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

function getRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export class User {
  private ws: WebSocket;
  public id: string; // socket/session ID
  public userId?: string; // JWT user ID
  private spaceId?: string;
  private x: number;
  private y: number;
  private spaceWidth: number = 0;
  private spaceHeight: number = 0;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.id = getRandomString(10);
    this.x = 0;
    this.y = 0;
    this.initHandlers();
  }

  initHandlers() {
    this.ws.on("message", async (data) => {
      const parseData = JSON.parse(data.toString());
      switch (parseData.type) {
        case "join": {
          const { spaceId, token } = parseData.payload;
          // Verify JWT and extract userId
          let payload;
          try {
            payload = jwt.verify(token, JWT_PASSWORD) as { id: string };
          } catch {
            this.ws.close();
            return;
          }
          this.userId = payload.id;

          // Check space existence
          const space = await dbClient.space.findFirst({
            where: { id: spaceId },
          });
          if (!space) {
            this.ws.close();
            return;
          }

          if (RoomManager.getInstance().isUserInRoom(spaceId, this.userId)) {
            this.send({
              type: "error",
              payload: { message: "Already connected in this room." },
            });
            this.ws.close();
            return;
          }

          // Assign to room
          this.spaceId = spaceId;
          RoomManager.getInstance().addUser(spaceId, this);
          this.spaceWidth = space.width;
          this.spaceHeight = space.height!;

          // Random spawn within space
          this.x = Math.floor(Math.random() * space.width);
          this.y = Math.floor(Math.random() * space.height!);

          // Build list of existing users in room
          const existing = RoomManager.getInstance()
            .rooms.get(spaceId)!
            .filter((u) => u.id !== this.id)
            .map((u) => ({ id: u.id, x: u.x, y: u.y }));

          // Send back space-joined with your session ID and existing users' positions
          this.send({
            type: "space-joined",
            payload: {
              userId: this.id,
              spawn: { x: this.x, y: this.y },
              users: existing,
            },
          });

          // Notify others
          RoomManager.getInstance().broadcast(
            {
              type: "user-joined",
              payload: { userId: this.id, x: this.x, y: this.y },
            },
            this,
            spaceId
          );
          break;
        }
        case "move": {
          const { x: movX, y: movY } = parseData.payload;

          // Check movement distance
          const xDisplacement = Math.abs(this.x - movX);
          const yDisplacement = Math.abs(this.y - movY);

          // Check boundary
          const inBounds =
            movX >= 0 &&
            movY >= 0 &&
            movX < this.spaceWidth &&
            movY < this.spaceHeight;

          if (
            inBounds &&
            ((xDisplacement === 1 && yDisplacement === 0) ||
              (xDisplacement === 0 && yDisplacement === 1))
          ) {
            this.x = movX;
            this.y = movY;
            RoomManager.getInstance().broadcast(
              {
                type: "user-moved",
                payload: { id: this.id, x: this.x, y: this.y },
              },
              this,
              this.spaceId!
            );
          } else {
            this.send({
              type: "movement-rejected",
              payload: { x: this.x, y: this.y },
            });
          }
          break;
        }
      }
    });

    this.ws.on("close", () => this.destroy());
  }

  destroy() {
    if (!this.spaceId) return;
    RoomManager.getInstance().broadcast(
      { type: "user-left", payload: { userId: this.id } },
      this,
      this.spaceId
    );
    RoomManager.getInstance().removeUser(this, this.spaceId);
  }

  send(payload: OutgoingMessage) {
    this.ws.send(JSON.stringify(payload));
  }
}
