import { TypeMessage, TypeEmoji, EmojiMap } from "./lmaotypes";


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
