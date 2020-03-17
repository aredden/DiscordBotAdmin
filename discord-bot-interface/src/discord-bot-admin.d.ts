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

export type UpdateMemberArguments = {
    guildID:string,
    memberID:string,
    requestMember?:string,
    options:{
        ban?:{
            days?: number
            reason?: string
        },
        giveRole?:{
            roleID:string
        },
        removeRole?:{
            roleID:string
        },
        nickName?:string,
        kick?:{
            reason?: string
        }
    }
}

export type UpdateMemberResult = {
    banned?:boolean,
    nickname?:boolean,
    gaveRole?:boolean,
    removedRole?:boolean,
    kicked?:boolean,
    manageable?:boolean
}

export type UpdateChannelArguments = {
    channelID:string,
    options:{
        setNSFW?:{
            value:boolean
        }
        setName?:{
            name:string,
            reason:string
        }
        setPosition?:{
            position:number,
            options?:{
                relative?:boolean,
                reason?:string
            }
        },
        setRateLimitPerUser?:{
            limit:number,
            reason?:string
        },
        setParent?:{
            channel:string,
            options?:{
                lockPermissions?:boolean,
                reason?:string,
            }
        }
        delete?:{
            confirm:boolean,
            reason?:string
        }
    }
}

export type UpdateChannelResult = {
    setNSFW?:boolean,
    setName?:boolean,
    setPosition?:boolean,
    setRateLimitPerUser?:boolean,
    setParent?:boolean,
    delete?:boolean
}

export type UpdateGuildArguments = {
    guildID:string,
    options:{
        setAFKChannel?:{
            channelID:string,
            reason?:string
        },
        setAFKTimeout?:{
            time:number,
            reason?:string
        }
        setOwner?:{
            memberID:string,
            reason?:string
        },
        setRegion?:{
            region:string,
            reason?: string
        },
        setSystemChannel?:{
            channelID: string,
            reason?: string
        }
        setVerificationLevel?:{
            level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH',
            reason: string
        },
        setName?:{
            name: string,
            reason?: string
        }
    }
}

export type UpdateGuildResult = {
    setAFKChannel?:boolean,
    setAFKTimeout?:boolean,
    setOwner?:boolean,
    setRegion?:boolean,
    setSystemChannel?:boolean,
    setVerificationLevel?:boolean,
    setName?:boolean
}

export type UpdateMessageArguments = {
    channelID:string,
    messageID:string,
    options:{
        pin?:{
            pin:boolean
        },
        mdelete?:{
            yes:boolean,
            options?:{
                timeout?:number,
                reason?:string,
            }
        },
        react?:{
            emojiID:string,
        }
        suppressEmbeds?:boolean
    }
}

export type UpdateMessageResult = {
    pin?:boolean,
    unpin?:boolean,
    mdelete?:boolean,
    react?:boolean,
    suppressEmbeds?:boolean
}