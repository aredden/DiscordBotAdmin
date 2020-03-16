import { Message, MessageAttachment, MessageEmbed,
         TextChannel, Guild, Channel,
         ChannelLogsQueryOptions, User,
         GuildMember, MessageReaction,
         GuildManager, PartialChannel,
         PartialMessage, GuildEmoji } from "discord.js";
import { Socket } from "socket.io";
import { parseMessage, parseNewMessage, parseMessages,
         parseTextChannel, convertDiscEmojiToTypeEmoji,
        parseMessageReaction } from "../discordbot/typeparserfunctions";
import { TypeMessageData, TypeMessage,
         EmojiMap, TypeEmoji } from "../types/discord-bot-admin-types";
import  getLogger  from "../logger";
import { updateChannelNotifications, getFocusKey,
         getGuildData, updateEmojiMap } from "../index";
import bot from '../index';
const logger = getLogger("socketfunctions")

let clientGuilds: GuildManager;

export function buildSocketFunctions() {
    clientGuilds = bot.client.guilds;
}

export async function handleMessage(msg: Message|PartialMessage,socket: Socket){
    const message = msg.partial ? await msg.fetch() : msg as Message;
    const parsed = await parseMessage(message);
    socket.emit('discordmessage', JSON.stringify(parsed))
}

export async function handleMessageUpdate(oldMsg: Message | PartialMessage, newMsg: Message | PartialMessage, socket: Socket, _startDate?: number) {
    const newmessage = newMsg.partial ? await newMsg.fetch() : newMsg as Message;
    const oldmessage = oldMsg.partial ? await oldMsg.fetch() : oldMsg as Message;
    const messageUpdateData = {
        old: await parseMessage(oldmessage),
        new: await parseNewMessage(newmessage)
    }
    socket.emit("messageUpdate", JSON.stringify(messageUpdateData))
}

export function handleNotificationsUpdate(key: string) {
    updateChannelNotifications(key, undefined, true);
}

export async function handleMessagesRequest(guildID: string, channelID: string, lastMessage: string, sock: Socket) {
    let queryOpts: ChannelLogsQueryOptions = {
        before: lastMessage ? lastMessage : undefined,
        limit: 30
    };

    ((clientGuilds.cache.get(guildID) as Guild)
        .channels.cache.get(channelID) as TextChannel)
        .messages.fetch(queryOpts)
        .then(async (messages) => {
            return await parseMessages(messages)
        }, (_fail) => {
            logger.error(`Failed to update messages: ${_fail}`)
        })
        .then((parsedMessages: TypeMessage[]) => {
            sock.emit("batchMessages", JSON.stringify(parsedMessages))
        })
}

let lastFoundTyping = new Map <string, Date> ()

export function handleTypingStart(channel: Channel, user: User, socket: Socket) {

    if (channel.type === "text") {
        let txtChannel = channel as TextChannel
        if (getFocusKey() === txtChannel.guild.name + txtChannel.name) {
            socket.emit("typingStart",
                JSON.stringify({
                    user: user.username,
                    id: user.id,
                    discriminator: user.discriminator
                })
            );
            lastFoundTyping[user.id] = Date.now();
            waitUntilStop(user, channel, socket);
        }
    }
}

const sendTypingStop = (user: User, socket: Socket) => {
    socket.emit("typingStop",
        JSON.stringify({
            user: user.username,
            id: user.id,
            discriminator: user.discriminator
        })
    )
}

const waitUntilStop = (user: User, channel: Channel, socket: Socket) => {
    setTimeout(() => {
        if (Date.now() - lastFoundTyping[user.id] >= 8000) {
            sendTypingStop(user,socket);
        } else {
            waitUntilStop(user, channel, socket);
        }
    }, 400)
}


export async function handleChannelUpdate (channel: Channel | PartialChannel, sock: Socket){

    const channelFetched = (channel as PartialChannel).partial ? await channel.fetch() : channel;

    if (channelFetched.type === 'text' && !channelFetched.deleted) {
        let txtChannel = channelFetched as TextChannel
        let parsedTextChannel = await parseTextChannel(txtChannel);
        sock.emit("channelUpdate", JSON.stringify({
            channel: parsedTextChannel,
            guild: txtChannel.guild.name,
            id: txtChannel.id
        }))
    }
}

export async function handleChannelDelete(channel: Channel | PartialChannel, sock: Socket) {

    const channelFetched = await channel.fetch()

    if (channelFetched.type === 'text') {
        let txtChannel = channelFetched as TextChannel
        sock.emit("channelDelete", JSON.stringify({
            guild: txtChannel.guild.name,
            id: txtChannel.id
        }))
    }
}

export async function handleMemberUpdate(member: GuildMember, sock: Socket) {
    let name = member.guild.name;
    if(name){
        await getGuildData().then(
            guildParsed=>{
                let newUsers = guildParsed[name].users;
                sock.emit('memberUpdate', JSON.stringify({
                    guild: name,
                    members: newUsers
                }))
            }
        )
    } else {
        logger.error(`{handleMemberUpdate(member,sock)} @member guild name is undefined. ${member.toString()}`)
    }
}

export function handleEmojiUpdate(newEmoji: GuildEmoji, oldEmoji: GuildEmoji, sock: Socket) {
    let mojiMap: EmojiMap = new Map <string, TypeEmoji> ();
    let toRemove: EmojiMap = new Map <string, TypeEmoji> ();
    if(newEmoji.deleted){
        toRemove[oldEmoji.name] = convertDiscEmojiToTypeEmoji(oldEmoji);
        mojiMap = updateEmojiMap(mojiMap, toRemove);
    } else {
        toRemove[oldEmoji.name] = convertDiscEmojiToTypeEmoji(oldEmoji);
        mojiMap[newEmoji.name] = convertDiscEmojiToTypeEmoji(newEmoji);
        mojiMap = updateEmojiMap(mojiMap, toRemove);
    }
    sock.emit("emojiUpdate", JSON.stringify(mojiMap));
}

export function handleEmojiCreate(emoji: GuildEmoji, sock: Socket) {
    let mojiMap: EmojiMap = new Map <string, TypeEmoji> ();
    mojiMap[emoji.name] = convertDiscEmojiToTypeEmoji(emoji)
    mojiMap = updateEmojiMap(mojiMap);
    sock.emit("emojiUpdate", JSON.stringify(mojiMap));
}

export const handleMessageReactionAdd = async (react: MessageReaction, sock: Socket) => {
    let reaction = react.partial ? await react.fetch() : react as MessageReaction;
    let tReaction = await parseMessageReaction(reaction)
    sock.emit('msgReactionAdd', JSON.stringify(tReaction))
}

export const handleMessageReactionRemove = async (react: MessageReaction, sock: Socket) => {
    let reaction = react.partial ? await react.fetch() : react as MessageReaction;
    let tReaction = await parseMessageReaction(reaction)
    sock.emit('msgReactionRemove', JSON.stringify(tReaction))
}

///////////////////////////////
//      Socket listeners     //
///////////////////////////////


export const handleSendMessage = (
    messageData: TypeMessageData,
    _attatchments ? : MessageAttachment[],
    _embeds ? : MessageEmbed[])  => {
    let {
        guild,
        channel,
        content
    } = messageData

    const targetGuild = clientGuilds.cache.get(messageData.guild)
    if (!guild) {
        logger.error(`guild w/ id: ${guild} does not exist!`)
        return;
    }
    const targetChannel = targetGuild.channels.cache.get(channel) as TextChannel;
    if (!channel) {
        logger.error(`guild w/ id: ${channel} does not exist!`)
        return;
    }
    logger.info(`Sending message to ${targetChannel.name} in ${targetChannel.guild.name} content:\n${messageData.content}`)
    targetChannel.send(content)
        .then(
            _success => {
                logger.info(`Successfully sent message to ${targetChannel.name}!`)
            },
            _fail => {
                logger.error(`Failed to send message to ${targetChannel.name}!`)
            }
        );
}

export const handleMessageEditRequest = (jsonParams: string, sock: Socket, startDate: number) => {
    let {
        guildID,
        channelID,
        messageID,
        content
    } = JSON.parse(jsonParams);
    let guild: Guild = clientGuilds.cache.get(guildID)
    let targetChannel: TextChannel = guild.channels.cache.get(channelID) as TextChannel
    let targetMessage = targetChannel.messages.cache.get(messageID) as Message
    targetMessage.edit(content)
        .then(
            _success => {
                logger.info(`Succeeded in editting message from channel ${targetChannel.name}`)
                let newMessage = targetChannel.messages.cache.get(messageID)
                handleMessageUpdate(targetMessage, newMessage, sock, startDate)
            },
            _fail =>
            logger.error(`Failed to send message to ${targetChannel.name}.. \n Error: ${_fail.toString()}`)
        )
}
