export type TypeMessage = {
    message:string,
    author:TypeUser,
    content:string, 
    mentions:TypeGuildMember[],
    channel:string,
    guild:string,
    createdAt:Date, 
    member:TypeGuildMember,
    id:string,
    embeds:TypeEmbed[],
    attachments:TypeMessageAttachment[]
    newEmojis:Map<string,TypeEmoji>
    edited:undefined|boolean;
}

export type MemberMap = Map<string,TypeGuildMember>

export type TypeEmoji = {
    id:string,
    name:string,
    identifier:string,
    url:string,
    requiresColons:boolean
}

export type EmojiMap = Map<string,TypeEmoji>
export type ChannelMap = Map<string,TypeTextChannel>
export type NotificationMap = Map<string,number>
export type GuildMap = Map<string,TypeGuild>

export type TypeTextChannel = {
    name:string,
    type:string,
    messages:Array<TypeMessage>,
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
    presence:TypePresence,
    guildName:string
}

export type TypePresence = {
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
		flags: string[],
		type: number,
		url: string,
		details: string,
        name: string,
		streaming: boolean,
    },
    clientStatus: {
        web?:UserStatus,
        mobile?:UserStatus,
        desktop?:UserStatus
    },
    status: UserStatus,
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
    color:string,
    id:string,
    permissions:number,
    position:number,
    mentionable:boolean,
    hexColor:string
}

export type TypeGuild = {
    name:string,
    channels:Map<string,TypeTextChannel>,
    emojis:Map<string,TypeEmoji>,
    users:Map<string,TypeGuildMember>,
    id:string,
    owner:TypeGuildMember
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
    timestamp:string,
    author:TypeUser
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

export type TypeMessageUpdateData = {
    old:TypeMessage,
    new:TypeMessage
}