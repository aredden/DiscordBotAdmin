import { TypeMessage, TypeEmoji, EmojiMap, TypeGuild } from "./lmaotypes";


export type TypeMessageClass = {
    message:TypeMessage,
    emojis:Map<string,TypeEmoji>,
}

export type TypeMessageList = {
    messages: Array < TypeMessage >,
    guildName: string,
    channelName: string,
    emojis: Map < string,TypeEmoji >,
    guildID:string,
    channelID:string,
    sendFunction:(guild:string,channel:string,content:string)=>void
}

export type TypeInputBox = {
    sendFunction:(guild:string,channel:string,content:string)=>void,
    channelID:string,
    guildID:string
    emojis:EmojiMap
}

export type AppType = {
    isReady:boolean,
    error:string,
    guildList:Map<string,TypeGuild>,
    channelName:string,
    guildName:string,
    endpoint:string,
    emojis:Map<string,TypeEmoji>,
    messageNotifications:Map<string,number>
}