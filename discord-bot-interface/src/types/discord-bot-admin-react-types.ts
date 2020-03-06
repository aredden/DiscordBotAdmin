import { TypeMessage, TypeEmoji, EmojiMap, TypeGuild, MemberMap } from "./discord-bot-admin-types";


export type TypeMessageClass = {
    message:TypeMessage
}

export type TypeMessageList = {
    messages: Array < TypeMessage >,
    guildName: string,
    channelName: string,
    emojis: Map < string,TypeEmoji >,
    guildID:string,
    channelID:string,
    socket: SocketIOClient.Socket,
    requestMessages:(e:any,channelID:string,guildID:string,messageID?:string)=>void,
    sendFunction:(guild:string,channel:string,content:string)=>void
}

export type TypeUserBar = {
    members: MemberMap
}

export type TypeInputBox = {
    sendFunction:(guild:string,channel:string,content:string)=>void,
    channelID:string,
    guildID:string,
    socket: SocketIOClient.Socket,
    emojis:EmojiMap
}

export type TypeDiscordUI = {
    isReady:boolean,
    error:string,
    guildList:Map<string,TypeGuild>,
    channelName:string,
    guildName:string,
    endpoint:string,
    emojis:Map<string,TypeEmoji>,
    messageNotifications:Map<string,number>,
    requestedMessages:boolean
}