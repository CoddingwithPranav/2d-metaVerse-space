import { OutgoingMessage } from "./types";
import type { User } from "./User";


export class RoomManager {
    rooms: Map<string, User[]> = new Map()
    static instance:RoomManager;
    private constructor(){
        this.rooms = new Map()
    }
    static getInstance(){
        if(!this.instance){
            this.instance = new RoomManager()
        }
        return this.instance
    }

    public  addUser(spaceId:string,user:User ) {
        if(!this.rooms.has(spaceId)){
            this.rooms.set(spaceId, [user]);
            return;
        }
        this.rooms.set(spaceId, [...this.rooms.get(spaceId)!, user]);
    }

    public broadcast(message:OutgoingMessage, user:User, roomId:string) {
        if(!this.rooms.has(roomId)) return;
        this.rooms.get(roomId)?.forEach((u) => {
            if(u.id !== user.id){
                u.send(message);
            }
        })
    }
    public isUserInRoom(spaceId: string, userId?: string): boolean {
        if (!userId || !this.rooms.has(spaceId)) return false;
        return this.rooms.get(spaceId)!.some(u => u.userId === userId);
      }
    public removeUser(user:User, spaceId:string) {
        if(!this.rooms.has(spaceId)) return;
        this.rooms.set(spaceId, this.rooms.get(spaceId)?.filter((u) => u.id !== user.id)!);
    }
}