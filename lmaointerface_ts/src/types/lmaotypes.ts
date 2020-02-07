export type TypeMessage = {
    message:string,
    author:TypeUser,
    content:string, 
    mentions:Map<string,TypeUser>,
    channel:string,
    guild:string,
    createdAt:string, 
    member:TypeGuildMember,
    id:string
}

export type TypeEmoji = {
    id:string,
    name:string,
    identifier:string,
    url:string,
    requiresColons:boolean
}

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
    displayHexColor:string
}

export type TypeUser = {
        name:string,
        id:string,
        tag:string,
        createdAt:string,
        bot:boolean,
        avatarURL:string,
        avatar:string
}

export type TypeRole = {
    name:string,
    color:string,
    id:string,
    permissions:number,
    mentionable:boolean,
    hexColor:string
}

export type TypeGuild = {
    name:string,
    channels:Map<string,TypeTextChannel>,
    emojis:Map<string,TypeEmoji>,
    id:string,
    owner:TypeGuildMember
}