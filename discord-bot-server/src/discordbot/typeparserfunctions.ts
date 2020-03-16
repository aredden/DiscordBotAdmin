import { Message, Collection, Guild,
        Emoji, GuildChannel, TextChannel,
        GuildMember, User, Role,
        MessageMentions,
        MessageAttachment,
        MessageEmbed,
        MessageReaction,
        GuildManager,
        Presence,
        EmbedField,
        PartialMessage } from 'discord.js';
// import getLogger from '../logger';
import { TypeGuild, TypeMessage,
         TypeGuildMember, TypeRole,
         TypeTextChannel, TypePresence,
         TypeMessageNoEdits,
         TypeMessageReaction,
         TypeEmoji} from '../types/discord-bot-admin-types';
import { isNull } from 'util';


// const logger = getLogger('BotParsingFunctions')

export async function parseGuilds(guilds:GuildManager):Promise<Map<string,TypeGuild>> {

    let guildList = new Map<string,TypeGuild>()
    let guildsArray = Array.from(guilds.cache.values())
    let guildsParsedArray:TypeGuild[] = new Array<TypeGuild>();
    for(let guild of guildsArray){
        const guildParsed = await parseGuild(guild);
        guildsParsedArray.push(guildParsed)
    }
    await Promise.all(guildsParsedArray);

    guildsParsedArray.forEach(guild=>{
        guildList[guild.name] = guild;
    })
    return guildList;
}

async function parseGuild(guild:Guild):Promise<TypeGuild>{


    let newEmojis = parseEmojis(guild.emojis.cache);

    let newGuild:TypeGuild = {
        name: guild.name,
        channels: await parseChannels(guild.channels.cache),
        users: await parseGuildMembers(guild.members.cache),
        emojis: newEmojis,
        roles: parseRoles(guild.roles.cache),
        id: guild.id,
        owner: await parseGuildMember(guild.owner),
        ownerID: guild.ownerID,
        createdAt: guild.createdAt,
        iconURL: guild.iconURL(),
        icon: guild.icon,
        available: guild.available,
        memberCount: guild.memberCount,
        me: await parseGuildMember(guild.me),
        joinedAt: guild.joinedAt
    };

    return newGuild;
}

async function parseChannels(channels:Collection<string,GuildChannel>):Promise<Map<string,TypeTextChannel>>{
    let channelList:Map<string,TypeTextChannel> = new Map<string,TypeTextChannel>();
    let arrayChannels = channels.array();

    let newArray = arrayChannels.map(async (channel) => {
        if(channel.type==='text'){
            const parsedchannel = await parseTextChannel(channel as TextChannel);
            return(parsedchannel)
        }
    });
    const textChannels = await Promise.all(newArray)
    textChannels.forEach(channel=>{
        if(channel){
            channelList[channel.name]= channel;
        }
    })

    return channelList;
}

export async function parseTextChannel(channel:TextChannel):Promise<TypeTextChannel>{
    let channelMessages = await parseMessages(channel.messages.cache)

    return {
            name:channel.name,
            type:channel.type,
            messages:channelMessages,
            guild:channel.guild.name,
            id:channel.id,
            nsfw:channel.nsfw
    }
}


export function parseEmojis(emojis:Collection<string,Emoji>){
    let emojilist=new Map<string,TypeEmoji>();
    emojis.forEach((emoji) => {
        emojilist[emoji.name] = convertDiscEmojiToTypeEmoji(emoji)
    });
    return emojilist;
}

export async function parseMessages(messages: Collection<string,Message>):Promise<TypeMessage[]>{
    let messageMap=new Array<TypeMessage>();
    let msgList = messages.array()
    for(let msg of msgList){
        messageMap.push(await parseMessage(msg))
    }
    await Promise.all(messageMap);
    messageMap = messageMap.sort((a,b)=>a.createdAt.getTime()-b.createdAt.getTime())
    if(messageMap.length>35){
        const length = messageMap.length;
        messageMap = messageMap.filter((_message,idx)=>{
            return idx+35>=length
        })
    }
    return messageMap;
}

export function convertDiscEmojiToTypeEmoji(emoji: Emoji): TypeEmoji{
    return {
        id:emoji.id,
        name:emoji.name,
        identifier:emoji.identifier,
        url:emoji.url,
        animated:emoji.animated
    }
}

export async function parseNewMessage(msg: Message | PartialMessage): Promise<TypeMessage> {

    const message = msg.partial ? await msg.fetch() : msg as Message;
    const txtchannel = message.channel as TextChannel;

    let edits = await Promise.all(message.edits.map( async (_message:Message)=> await parseMessageNoEdits(_message)))
    let member = await parseGuildMember(message.member)
    return({
        member,
        author:parseUser(message.author),
        channel:txtchannel.name,
        content:message.content,
        mentions: await parseMentions(message.mentions),
        guild:txtchannel.guild.name,
        id:message.id,
        createdAt:message.createdAt,
        attachments:parseMessageAttachments(message.attachments),
        embeds:parseEmbeds(message.embeds),
        type:message.type,
        reference:message.reference,
        nonce:message.nonce,
        deleted:message.deleted,
        newEmojis:undefined,
        editedAt:message.editedAt,
        edits,
        editable:message.editable,
        reactions: await parseMessageReactions(message.reactions.cache)
    })
}

export async function parseMessage(message:Message):Promise<TypeMessage>{
    const txtchannel = message.channel as TextChannel;
    let edits = Promise.all(message.edits.map( async (_message:Message)=> await parseMessageNoEdits(_message)))
    let member = await parseGuildMember(message.member)
    return({
        member,
        author: parseUser(message.author),
        channel:txtchannel.name,
        content:message.content,
        mentions: await parseMentions(message.mentions),
        guild:txtchannel.guild.name,
        id:message.id,
        createdAt:message.createdAt,
        attachments:parseMessageAttachments(message.attachments),
        embeds:parseEmbeds(message.embeds),
        type:message.type,
        reference:message.reference,
        nonce:message.nonce,
        deleted:message.deleted,
        newEmojis:undefined,
        editedAt:message.editedAt,
        edits: await edits,
        editable:message.editable,
        reactions: await parseMessageReactions(message.reactions.cache)
    })
}

export async function parseMessageNoEdits(message:Message|PartialMessage):Promise<TypeMessageNoEdits>{
    const txtchannel = message.channel as TextChannel;

    return({
        member: message.member&& await parseGuildMember(message.member),
        author: parseUser(message.author),
        channel: txtchannel.name,
        content: message.content,
        mentions: await parseMentions(message.mentions),
        guild: txtchannel.guild.name,
        id: message.id,
        createdAt: message.createdAt,
        attachments: parseMessageAttachments(message.attachments),
        embeds: parseEmbeds(message.embeds),
        type: message.type,
        reference: message.reference,
        nonce: message.nonce,
        newEmojis: undefined,
        editedAt: message.editedAt,
        reactions: await parseMessageReactions(message.reactions.cache)
    })
}

export async function parseMentions(mentions:MessageMentions):Promise<TypeGuildMember[]>{
    let members = await parseGuildMembers(mentions.members);
    return(Object.values(members))
}
/**
 * Parses a collection of GuildMembers into data that can be sent to end user.
 * @param members Collection<string,GuildMember>
 * @returns Map<string,TypeGuildMember>
 */
export async function parseGuildMembers(members:Collection<string,GuildMember>):Promise<Map<string,TypeGuildMember>>{
    let memberMap:Map<string,TypeGuildMember> = new Map<string,TypeGuildMember>();
    let memberArray = new Array<TypeGuildMember>();
    Array.from(members).forEach(async ([_key,member])=>{
        const parsedMember = await parseGuildMember(member);
        memberArray.push(parsedMember);
    })
    await Promise.all(memberArray)
    memberArray.forEach(tgMember=>{
        memberMap[tgMember.user.name] = tgMember
    })
    return memberMap;
}

export async function parseGuildMember(member:GuildMember):Promise<TypeGuildMember>{

    return({
        nickname:!isNull(member.nickname)?member.nickname:"",
        id:member.id,
        user:parseUser(member.user),
        roles:member.roles?parseRoles(member.roles.cache):undefined,
        displayName:member.displayName,
        displayHexColor:member.displayHexColor,
        highestRole:member.roles ? parseGuildRole(member.roles.highest):undefined,
        guildName:member.guild.name,
        presence:member.presence?parsePresence(member.presence):offlinePresence()
    });
}

const offlinePresence:()=>TypePresence = ( )  => {
    return {
        game:undefined,
        clientStatus:undefined,
        status:"offline"
    }
}

export function parsePresence(presence:Presence):TypePresence{
    let {clientStatus, status, activities } = presence;

    let parsedActivities = activities.map(activity=>{
        return({
            applicationID:activity.applicationID,
            state:activity.state,
            timestamps:activity.timestamps,
            assets: activity.assets?{
                largeImage:activity.assets.largeImage,
                largeImageURL:activity.assets.largeImageURL(),
                smallImage:activity.assets.smallImage,
                smallImageURL:activity.assets.smallImageURL(),
                largeText:activity.assets.largeText,
                smallText:activity.assets.smallText
            }:undefined,
            name:activity.name,
            url:activity.url,
            type:activity.type.toString(),
            details:activity.details
        })
    })

    return({
        clientStatus:clientStatus?{
            web:clientStatus.web,
            desktop:clientStatus.desktop,
            mobile:clientStatus.mobile
        }:undefined,
        status,
        game:parsedActivities
    })
}

/**
 * Parses a Discordjs collection of Roles and returns an Object
 * @param roles Discord.js - Collection<string,Role>
 * @returns
 */
export function parseRoles(roles:Collection<string,Role>):Map<string,TypeRole>{

    let rolesMap:Map<string,TypeRole> = new Map<string,TypeRole>();
    Object.values(roles).forEach((role:Role)=>{
        rolesMap[role.name]=parseGuildRole(role)
    })
    return rolesMap;
}

export function parseGuildRole(role:Role):TypeRole{
    return ({
        name:role.name,
        color:role.color,
        id:role.id,
        position:role.position,
        permissions:role.permissions.toArray(true),
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
        defaultAvatarURL:user.defaultAvatarURL,
        avatarURL:user.avatarURL(),
        avatar:user.avatar
    })
}

export function parseMessageAttachments(attachments:Collection<string,MessageAttachment>){
    let newMessageAttatchments = []
    attachments.forEach((attachment)=>{
        newMessageAttatchments.push(parseMessageAttachment(attachment))
    })
    return newMessageAttatchments;
}

export function parseMessageAttachment(attachment:MessageAttachment){
    return({
        filename:attachment.name,
        filesize:attachment.size,
        height:attachment.height,
        width:attachment.width,
        url:attachment.url,
        proxyURL:attachment.proxyURL,
        id:attachment.id
    })
}

export function parseEmbeds(embeds:MessageEmbed[]){
    let embedArray = []
    embeds.forEach((embed)=>{
        embedArray.push(parseEmbed(embed))
    })
    return embedArray
}

export function parseEmbed(embed:MessageEmbed){
    return({
        type:embed.type,
        video:embed.video?{
            height:embed.video.height,
            width:embed.video.width,
            url:embed.video.url
        }:{},
        color:embed.color,
        createdAt:embed.createdAt,
        description:embed.description,
        hexColor:embed.hexColor,
        fields:embed.fields?parseEmbedFields(embed.fields):[],
        footer:embed.footer?{
            iconURL:embed.footer.iconURL,
            proxyIconURL:embed.footer.proxyIconURL,
            text:embed.footer.text
        }:{},
        image:embed.image?{
            height:embed.image.height,
            width:embed.image.width,
            url:embed.image.url,
            proxyURL:embed.image.proxyURL
        }:{},
        provider:embed.provider?{
            name:embed.provider.name,
            url:embed.provider.url
        }:{},
        thumbnail:embed.thumbnail?{
            width:embed.thumbnail.width,
            height:embed.thumbnail.height,
            url:embed.thumbnail.url,
            proxyURL:embed.thumbnail.proxyURL
        }:{},
        title:embed.title,
        url:embed.url,
        timestamp:embed.timestamp
    })
}

export function parseEmbedFields(fields:EmbedField[]){
    let embedFields = []
    fields.forEach((field)=>{
        embedFields.push({
            inline:field.inline,
            name:field.name,
            value:field.value
        })
    })
    return embedFields;
}

export async function parseMessageReactions(reactions:Collection<string,MessageReaction>)
    :Promise<TypeMessageReaction[]> {
        let reactionArray = Array.from(reactions);
        let reactionAsyncArray:TypeMessageReaction[] = new Array<TypeMessageReaction>();
        for(let x of reactionArray){
            const reactionParsed = await parseMessageReaction(x[1])
            reactionAsyncArray.push(reactionParsed)
        }
        return Promise.all(reactionAsyncArray);
}

export async function parseMessageReaction(reaction:MessageReaction):Promise<TypeMessageReaction>{

    let {emoji, message, users, count, me } = reaction;
    let fetchedUsers = await users.fetch();
    let userArray = fetchedUsers.array().map(user=> parseUser(user));
    await Promise.all(userArray)

    return({
        emoji:{
            id: emoji.id,
            name: emoji.name,
            identifier: emoji.identifier,
            animated: emoji.animated,
            url: emoji.url
        },
        me,
        count,
        guildName:message.guild?message.guild.name:"",
        guildID:message.guild?message.guild.id:"",
        channelName:message.channel.type==='text'?(message.channel as TextChannel).name:undefined,
        channelID:message.channel.type==='text'?(message.channel as TextChannel).id:undefined,
        users:userArray,
        messageID:message.id
    })
}