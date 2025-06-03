
import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { OutgoingMessage } from "./types";
import { dbClient } from "@repo/db/client";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

function getRandomString(length: number) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

interface SpaceElement {
  x: number;
  y: number;
  mapElement: {
    width: number;
    height: number;
    static: boolean;
  };
}

interface Space {
  id: string;
  width: number;
  height: number;
  elements: SpaceElement[];
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
  private CELL_SIZE = 20; // Grid cell size in pixels, matching client
  private space: any;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.id = getRandomString(10);
    this.x = 0;
    this.y = 0;
    this.initHandlers();
  }

  private isValidSpawn(x: number, y: number, spaceElements: SpaceElement[]): boolean {
    const userLeft = x * this.CELL_SIZE;
    const userRight = (x + 1) * this.CELL_SIZE;
    const userTop = y * this.CELL_SIZE;
    const userBottom = (y + 1) * this.CELL_SIZE;

    return !spaceElements.some((el) => {
      if (!el.mapElement.static) return false;
      const elLeft = el.x;
      const elRight = el.x + el.mapElement.width;
      const elTop = el.y;
      const elBottom = el.y + el.mapElement.height;
      return (
        userLeft < elRight &&
        userRight > elLeft &&
        userTop < elBottom &&
        userBottom > elTop
      );
    });
  }

  initHandlers() {
    this.ws.on("message", async (data) => {
      try {
        const parseData = JSON.parse(data.toString());
        switch (parseData.type) {
          case "join": {
            const { spaceId, token } = parseData.payload;
            let payload;
            try {
              payload = jwt.verify(token, JWT_PASSWORD) as { id: string };
            } catch {
              this.ws.close();
              return;
            }
            this.userId = payload.id;

            this.space = await dbClient.space.findUnique({
              where: { id: spaceId },
              include: {
                elements: {
                  select: {
                    id: true,
                    x: true,
                    y: true,
                    mapElement: {
                      select: {
                        id: true,
                        imageUrl: true,
                        width: true,
                        height: true,
                        static: true,
                      },
                    },
                  },
                },
              },
            });

            if (!this.space) {
              this.send({ type: "error", payload: { message: "Space not found" } });
              this.ws.close();
              return;
            }

            const roomManager = RoomManager.getInstance();
            const room = roomManager.rooms.get(spaceId);
            if (room) {
              const existingUsers = room.filter(u => u.userId === this.userId);
              existingUsers.forEach(existingUser => {
                existingUser.destroy();
              });
            }

            this.spaceId = spaceId;
            roomManager.addUser(spaceId, this);
            this.spaceWidth = this.space.width;
            this.spaceHeight = this.space.height;

            // Improved spawn logic
            const maxAttempts = 100;
            let attempts = 0;
            let validSpawn = false;
            do {
              this.x = Math.floor(Math.random() * (this.spaceWidth / this.CELL_SIZE));
              this.y = Math.floor(Math.random() * (this.spaceHeight / this.CELL_SIZE));
              validSpawn = this.isValidSpawn(this.x, this.y, this.space.elements);
              attempts++;
            } while (!validSpawn && attempts < maxAttempts);

            if (!validSpawn) {
              this.send({ type: "error", payload: { message: "No valid spawn position found" } });
              this.ws.close();
              return;
            }

            const existing = roomManager
              .rooms.get(spaceId)!
              .filter((u) => u.id !== this.id)
              .map((u) => ({ id: u.id, x: u.x, y: u.y }));

            this.send({
              type: "space-joined",
              payload: {
                userId: this.id,
                spawn: { x: this.x, y: this.y },
                users: existing,
              },
            });

            roomManager.broadcast(
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

            const inBounds =
              movX >= 0 &&
              movY >= 0 &&
              movX < this.spaceWidth / this.CELL_SIZE &&
              movY < this.spaceHeight / this.CELL_SIZE;

            const xDisplacement = Math.abs(this.x - movX);
            const yDisplacement = Math.abs(this.y - movY);
            const isValidMove =
              (xDisplacement === 1 && yDisplacement === 0) ||
              (xDisplacement === 0 && yDisplacement === 1);

            let overlaps = false;
            if (inBounds && isValidMove && this.spaceId) {
              const userLeft = movX * this.CELL_SIZE;
              const userRight = (movX + 1) * this.CELL_SIZE;
              const userTop = movY * this.CELL_SIZE;
              const userBottom = (movY + 1) * this.CELL_SIZE;

              overlaps = this.space.elements.some((el) => {
                if (!el.mapElement.static) return false;
                const elLeft = el.x;
                const elRight = el.x + el.mapElement.width;
                const elTop = el.y;
                const elBottom = el.y + el.mapElement.height;
                return (
                  userLeft < elRight &&
                  userRight > elLeft &&
                  userTop < elBottom &&
                  userBottom > elTop
                );
              });
            }

            if (true) {
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
          case "user-action": {
            const { action, userId, emoji } = parseData.payload;
            if (action === "show-emoji" && userId === this.id && this.spaceId && typeof emoji === "string") {
              const message = {
                type: "user-action",
                payload: { action: "show-emoji", userId: this.id, emoji },
              };
              RoomManager.getInstance().broadcast(message, this, this.spaceId);
              this.send(message);
            }
            break;
          }
          case "send-message": {
            const { message } = parseData.payload;
            if (this.spaceId && typeof message === "string" && message.length <= 100) {
              RoomManager.getInstance().broadcast(
                {
                  type: "message-received",
                  payload: { userId: this.id, message },
                },
                this,
                this.spaceId
              );
              // Optionally send confirmation back to the sender
              this.send({
                type: "message-received",
                payload: { userId: this.id, message },
              });
            } else {
              this.send({ type: "error", payload: { message: "Invalid message" } });
            }
            break;
          }
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
        this.send({ type: "error", payload: { message: "Invalid message format" } });
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
    try {
      this.ws.send(JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }
}