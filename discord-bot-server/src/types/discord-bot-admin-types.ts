import { PermissionString } from "discord.js"

export type TypeMessage = {
    author:TypeUser,
    content:string,
    mentions:TypeGuildMember[],
    channel:string,
    guild:string,
    createdAt:Date,
    member:TypeGuildMember,
    id:string,
    embeds:TypeEmbed[],
    attachments:TypeMessageAttachment[],
    newEmojis:TypeEmoji[],
    nonce:string,
    type:string,
    reference:{
        guildID:string,
        channelID:string,
        messageID:string
    },
    deleted:boolean,
    edits:TypeMessageNoEdits[],
    editable:boolean,
    editedAt:Date
    reactions:TypeMessageReaction[]
}

export type TypeMessageReaction = {
    count:number,
    messageID:string,
    emoji:TypeEmoji,
    users:TypeUser[],
    me:boolean,
    channelName:string,
    channelID:string,
    guildName:string,
    guildID:string
}

export type TypeMessageNoEdits = {
    author:TypeUser,
    content:string,
    mentions:TypeGuildMember[],
    channel:string,
    guild:string,
    createdAt:Date,
    member:TypeGuildMember,
    id:string,
    embeds:TypeEmbed[],
    attachments:TypeMessageAttachment[],
    newEmojis:TypeEmoji[],
    nonce:string,
    type:string,
    reference:{
        guildID:string,
        channelID:string,
        messageID:string
    }
    editedAt:Date,
    reactions:TypeMessageReaction[]
}

export type TypeEmoji = {
    id:string,
    name:string,
    identifier:string,
    url:string,
    animated:boolean
}

export type EmojiMap = Map<string,TypeEmoji>

export type TypeTextChannel = {
    name:string,
    type:string,
    messages:TypeMessage[],
    guild:string,
    id:string,
    nsfw:boolean
}

export type TypeGuildMember = {
    nickname:string,
    id:string,
    user:TypeUser,
    roles:Map<string,TypeRole>,
    displayName:string,
    displayHexColor:string,
    highestRole:TypeRole,
    guildName:string,
    presence:TypePresence
}

export type TypePresence ={
    game: {
		applicationID: string,
		assets:{
            largeImage: string
            largeText: string
            smallImage: string
            smallText: string
            smallImageURL: string
            largeImageURL: string
        }
        state: string,
		timestamps: {
			start: Date,
			end: Date
		},
		type: string,
		url: string,
		details: string,
		name: string,
    }[],
    clientStatus: {
        web?: UserStatus,
        mobile?: UserStatus,
        desktop?: UserStatus
    }
    status: UserStatus
}

export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline' | 'invisible';

export type TypeUser = {
    name:string,
    id:string,
    tag:string,
    createdAt:Date,
    bot:boolean,
    avatarURL:string,
    avatar:string
}

export type TypeRole = {
    name:string,
    color:number,
    id:string,
    permissions:PermissionString[],
    position:number,
    mentionable:boolean,
    hexColor:string
}

export type TypeGuild = {
    name:string,
    channels:Map<string,TypeTextChannel>,
    users:Map<string,TypeGuildMember>,
    emojis:Map<string,TypeEmoji>,
    roles:Map<string,TypeRole>,
    id:string,
    owner:TypeGuildMember
    ownerID:string,
    createdAt:Date,
    iconURL:string,
    icon:string,
    available:boolean,
    memberCount:number,
    me:TypeGuildMember,
    joinedAt:Date
}

export type TypeMessageEmbedField = {
    inline:boolean,
    name:string,
    value:string
}

export type TypeEmbed = {
    type:string,
    video:{
        height:number,
        width:number,
        url:string
    },
    color:string,
    createdAt:Date,
    description:string,
    hexColor:string,
    fields:TypeMessageEmbedField[],
    footer:{
        iconURL:string,
        proxyIconURL:string,
        text:string
    },
    image:{
        height:number,
        width:number,
        url:string,
        proxyURL:string
    },
    provider:{
        name:string,
        url:string
    },
    thumbnail:{
        width:number,
        height:number,
        url:string,
        proxyURL:string
    },
    title:string,
    url:string,
    timestamp:string
}

export type TypeMessageAttachment = {
    filename:string,
    filesize:number,
    height:number,
    width:number,
    url:string,
    proxyURL:string,
    id:string
}

export type TypeMessageData = {
    guild:string,
    channel:string,
    content:string
}