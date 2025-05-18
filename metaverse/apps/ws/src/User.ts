import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { OutgoingMessage } from "./types";
import { dbClient } from "@repo/db/client";
import jwt, { JwtPayload } from "jsonwebtoken";
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
  public id: string;
  public userId?: string;
  private spaceId?: string;
  private x: number;
  private y: number;
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
      console.log("message", parseData,data );
      switch (parseData.type) {
        case "join":
          console.log("join");
          const spaceId = parseData.payload.spaceId;
          const token = parseData.payload.token;
          console.log(token, "token ana");
          const user = (jwt.verify(token, JWT_PASSWORD) as {role:string, id:string});
          console.log(user.id, spaceId, "user sapce")
          if (!user.id) {
            this.ws.close();
            return;
          }
          console.log("joisdn 1");

          this.userId = user.id;
          const space = await dbClient.space.findFirst({
            where: {
              id: spaceId,
            },
          });
          if (!space) {
            this.ws.close();
            return;
          }
          console.log("joisdn ");

          this.spaceId = spaceId;
          RoomManager.getInstance().addUser(spaceId, this);
          this.x = Math.floor(Math.random() * space?.width);
          this.y = Math.floor(Math.random() * space?.height!);
          this.send({
            type: "space-joined",
            payload: {
              spawn: {
                x: this.x,
                y: this.y,
              },
              users: RoomManager.getInstance()
                .rooms.get(spaceId)?.filter((user) => user.id !== this.id)
                ?.map((user) => ({ id: user.id })),
            },
          });
          RoomManager.getInstance().broadcast(
            {
              type: "user-joined",
              payload: {
                userId: this.userId,
                x: this.x,
                y: this.y,
              },
            },
            this,
            spaceId
          );
          console.log("joisdn 6");


          break;
        case "move":
          const movX = parseData.payload.x;
          const movY = parseData.payload.y;
          const xDisplacement = Math.abs(this.x - movX);
          const yDisplacement = Math.abs(this.y - movY);

          if (
            (xDisplacement == 1 && yDisplacement == 0) ||
            (xDisplacement == 0 && yDisplacement == 1)
          ) {
            this.x = movX;
            this.y = movY;
            RoomManager.getInstance().broadcast(
              {
                type: "user-moved",
                payload: {
                  id: this.id,
                  x: this.x,
                  y: this.y,
                },
              },
              this,
              this.spaceId!
            );
            return;
          }
          this.send({
            type: "movement-rejected",
            payload: {
              x: this.x,
              y: this.y,
            },
          });
      }
    });
  }

  destroy() {
    RoomManager.getInstance().broadcast({
        type: "user-left",
        payload: {
           userId:this.userId
        },
        }, this, this.spaceId!);
    RoomManager.getInstance().removeUser(this, this.spaceId!);
  }
  send(payload: OutgoingMessage) {
    this.ws.send(JSON.stringify(payload));
  }
}
