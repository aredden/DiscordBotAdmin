import { Message, Collection, Guild,
        Emoji, GuildChannel, TextChannel,
        GuildMember, User, Role,
        MessageMentions } from "discord.js";
import winston from "winston";

const logger = winston.createLogger({
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'log' }),
	],
	format: winston.format.printf(log => `[LmaoBotParsingFunctions - ${log.level.toUpperCase()}] - ${log.message}`),
});

export function parseGuilds(guilds:Collection<string,Guild>){
    let guildList = new Object()
    guilds.forEach((guild,key,guildmap)=>{
            let newChannels = parseChannels(guild.channels);
            let newEmojis = parseEmojis(guild.emojis);
            let newGuild= new Object({
                name:guild.name,
                channels:newChannels,
                emojis:newEmojis,
                id:guild.id,
                owner:parseGuildMember(guild.owner)
            });
            guildList[guild.name]=newGuild;
    })
    return guildList;
}

function parseChannels(channels:Collection<string,GuildChannel>){
    let channelList = new Object()
    channels.forEach((channel,key,channelmap)=>{
        if(channel.type==='text'){
            let parsedchannel =parseTextChannel(channel as TextChannel);
            channelList[channel.name]=parsedchannel;
        }
    });
    return channelList;
}

export function parseTextChannel(channel:TextChannel){
    return {
        name:channel.name,
        type:channel.type,
        messages:parseMessages(channel.messages),
        guild:channel.guild.name,
        id:channel.id,
        nsfw:channel.nsfw
    }
}

export function parseEmojis(emojis:Collection<string,Emoji>){
    let emojilist=new Object();
    emojis.forEach((emoji,key,emojimap) => {
        emojilist[emoji.name] = parseEmoji(emoji)
    });
    return emojilist;
}

export function parseMessages(messages: Collection<string,Message>){
    let messageMap=new Array();
    messages.forEach((message,key,messagemap)=>{
        messageMap.push(parseMessage(message));
    })
    return messageMap;
}

export function parseEmoji(emoji:Emoji){
    return {
        id:emoji.id,
        name:emoji.name,
        identifier:emoji.identifier,
        url:emoji.url,
        requiresColons:emoji.requiresColons
    }
}

export function parseMessage(message:Message){
    const txtchannel = message.channel as TextChannel;
    return({
        member:parseGuildMember(message.member),
        author:parseUser(message.author),
        channel:txtchannel.name,
        content:message.content,
        mentions:parseMentions(message.mentions),
        guild:txtchannel.guild.name,
        id:message.id,
        createdAt:message.createdAt
    })
}

export function parseMentions(mentions:MessageMentions){
    return({
        users:parseGuildMembers(mentions.members)
    })
}
/**
 * Parses a collection of GuildMembers into data that can be sent to end user.
 * @param members Collection<string,GuildMember>
 * @returns Array<Object>
 */
export function parseGuildMembers(members:Collection<string,GuildMember>):object[]{
    let memberArray:object[] = [];
    members.forEach((member,key,membermap)=>{
        memberArray.push(parseGuildMember(member))
    })
    return memberArray
}

export function parseGuildMember(member:GuildMember){
    return({
        nickname:member.nickname,
        id:member.id,
        user:parseUser(member.user),
        roles:parseRoles(member.roles),
        displayName:member.displayName,
        displayHexColor:member.displayHexColor
    });
}

/**
 * Parses a Discordjs collection of Roles and returns an Object
 * @param roles Discord.js - Collection<string,Role>
 * @returns
 */
export function parseRoles(roles:Collection<string,Role>){
    let rolesMap:object = {}
    roles.forEach((role,key,rolemap)=>{
        roles[role.name]=parseGuildRole(role)
    })
    return rolesMap;
}

export function parseGuildRole(role:Role){
    return ({
        name:role.name,
        color:role.color,
        id:role.id,
        permissions:role.permissions,
        mentionable:role.mentionable,
        hexColor:role.hexColor
    })
}

export function parseUser(user:User){
    return({
        name:user.username,
        id:user.id,
        tag:user.tag,
        createdAt:user.createdAt,
        bot:user.bot,
        avatarURL:user.avatarURL,
        avatar:user.avatar
    })
}