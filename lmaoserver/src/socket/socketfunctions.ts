import { Message } from "discord.js";
import { Socket } from "socket.io";
import { parseMessage, parseNewMessage } from "../lmaobot/typeparserfunctions";

export function handleMessageUpdate(oldMsg:Message,newMsg:Message,socket:Socket,startDate:number){
    const {createdAt} = oldMsg;
    const time = createdAt.valueOf();
    if(time>startDate){

        const messageUpdateData={
            old:parseMessage(oldMsg),
            new:parseNewMessage(newMsg)
        }
        socket.emit("messageUpdate",JSON.stringify(messageUpdateData))
    }
}