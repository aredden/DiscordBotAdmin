import { TypeMessage, TypeEmoji, EmojiMap, TypeGuild, MemberMap, TypeTextChannel } from "./discord-bot-admin-types";


export type SidebarProps = {
    notifications:Map<string,number>,
    ready:boolean,
    guildList:Map<string,TypeGuild>,
    guildName:string,
    guildChannels:Map<string,TypeTextChannel>,
    onSwitchChannel:(e:React.MouseEvent,newChannelName:string)=>any,
    onSwitchGuild:(e:React.MouseEvent,newGuild:string)=>any
}

export type RowProps = {
    message:TypeMessage,
    arrays:Array<JSX.Element>,
    time:string,
    handleMessageEditClick:(e,id)=>any
}

export type MessageGroupProps = {
    messages:TypeMessage[],
    handleMessageEditClick:(e,id)=>any
}

export type MessageGroupsProps = {
    guildName:string,
    emojis:EmojiMap,
    messages:TypeMessage[]
    handleMessageEditClick:(e,id)=>any
}

export type MessageListState = {
    typing:Array<string>,
    messageEditModalMessage:TypeMessage
}

export type MessageProps = {
    message:TypeMessage,
    handleMessageEditClick:(e,id)=>any
}

export type MessageListProps = {
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

export type UserBarProps = {
    members: MemberMap
}

export type InputBoxProps = {
    sendFunction:(guild:string,channel:string,content:string)=>void,
    channelID:string,
    guildID:string,
    socket: SocketIOClient.Socket,
    emojis:EmojiMap
}

export type InputBoxState = {
    content:string, 
    colonMatch:string
}

export type EmojiAutoCompleteProps={
    emojis:TypeEmoji[],
    onChoose:(emojiTag:string)=>any,
    onClickChoose:(e,emojiTag:string)=>any,
    colonMatch:string,
    destroyPopper:()=>any,
}

export type DiscordUIState = {
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

export type CommandsState = {
    mention:string[],
    contains:Map<string,string[]>,
    startsWith:Map<string,string[]>
    origin:string
}
