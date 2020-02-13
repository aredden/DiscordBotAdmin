import { Message, Collection, Guild,
        Emoji, GuildChannel, TextChannel,
        GuildMember, User, Role,
        MessageMentions,
        MessageAttachment,
        MessageEmbed,
        MessageEmbedField} from 'discord.js';
import getLogger from '../Logger';
import { parseEmojisFromString } from './EmojiParser';
import { updateEmojiMap, getEmojiMap } from '../index';


const logger = getLogger('LmaoBotParsingFunctions')

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
        emojilist[emoji.name] = convertDiscEmojiToTypeEmoji(emoji)
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

export function convertDiscEmojiToTypeEmoji(emoji:Emoji){
    return {
        id:emoji.id,
        name:emoji.name,
        identifier:emoji.identifier,
        url:emoji.url,
        requiresColons:emoji.requiresColons
    }
}

export function parseNewMessage(message:Message){
    const txtchannel = message.channel as TextChannel;
    let _EMOJI_MAP = getEmojiMap();
    // logger.info(chalk.yellow(JSON.stringify(_EMOJI_MAP, null, 4)));
    const newEmojis = parseEmojisFromString(message.content,_EMOJI_MAP);
    if(newEmojis.size>0){
        updateEmojiMap(newEmojis);
    }
    return({
        member:parseGuildMember(message.member),
        author:parseUser(message.author),
        channel:txtchannel.name,
        content:message.content,
        mentions:parseMentions(message.mentions),
        guild:txtchannel.guild.name,
        id:message.id,
        createdAt:message.createdAt,
        attachments:parseMessageAttachments(message.attachments),
        embeds:parseEmbeds(message.embeds),
        type:message.type,
        hit:message.hit,
        nonce:message.nonce,
        newEmojis
    })
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
        createdAt:message.createdAt,
        attachments:parseMessageAttachments(message.attachments),
        embeds:parseEmbeds(message.embeds),
        type:message.type,
        hit:message.hit,
        nonce:message.nonce,
        newEmojis:undefined
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
        hexColor:role.hexColor,
        calculatedPosition:role.calculatedPosition
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

export function parseMessageAttachments(attachments:Collection<string,MessageAttachment>){
    let newMessageAttatchments = []
    attachments.forEach((attachment,key,attmap)=>{
        newMessageAttatchments.push(parseMessageAttachment(attachment))
    })
    return newMessageAttatchments;
}

export function parseMessageAttachment(attachment:MessageAttachment){
    return({
        filename:attachment.filename,
        filesize:attachment.filesize,
        height:attachment.height,
        width:attachment.width,
        url:attachment.url,
        proxyURL:attachment.proxyURL,
        id:attachment.id
    })
}

export function parseEmbeds(embeds:MessageEmbed[]){
    let embedArray = []
    embeds.forEach((embed,idx,embedarray)=>{
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

export function parseEmbedFields(fields:MessageEmbedField[]){
    let embedFields = []
    fields.forEach((field,idx,fieldarr)=>{
        embedFields.push({
            inline:field.inline,
            name:field.name,
            value:field.value
        })
    })
    return embedFields;
}