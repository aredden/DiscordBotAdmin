import { Message, TextChannel, Channel, User, Emoji,
         GuildMember, MessageReaction, Presence, PartialMessage, GuildEmoji } from 'discord.js';
import socketio, { Socket } from 'socket.io';
import { DiscordBot } from '../discordbot/bot'
import 'discord.js';
import http from 'http';
import { parseGuildMember } from '../discordbot/typeparserfunctions';
import getLogger from '../logger';
import { TypeMessageData } from '../types/discord-bot-admin-types'
import { handleMessageUpdate, handleSendMessage,
        handleNotificationsUpdate, handleMessagesRequest, handleChannelUpdate,
        handleMemberUpdate, handleEmojiCreate, handleEmojiUpdate,
        handleChannelDelete, handleMessageEditRequest, handleMessageReactionAdd,
        handleMessageReactionRemove, handleTypingStart, handleMessage } from './socketfunctions';
import { setNewChannelFocus } from '../index';
import chalk from 'chalk';
const logger = getLogger('DiscordBotSocket');

export default function lmaoSocket(bot: DiscordBot, server: http.Server) {
    const startDate = Date.now()
    let io: socketio.Server;
    let interval: NodeJS.Timeout;
    io = socketio(server).json;

    bot.client.once('ready', () => {
        logger.info('Bot ready')
        io.on('connection', (socket: Socket) => {

            const messageListener = (msg: Message | PartialMessage) => {
                handleMessage(msg, socket)
            }

            const errorListener = (err: Error) => socket.emit('error', JSON.stringify(err));

            const messageUpdateListener = (oldMsg: Message, newMsg: Message) => {
                handleMessageUpdate(oldMsg, newMsg, socket, startDate)
            }

            const presenceUpdateListener = async (_oldPresence: Presence, newPresence: Presence) => {
                let pres = await parseGuildMember(newPresence.member);
                socket.emit("presenceUpdate", JSON.stringify(pres))
            }

            const typingStartListener = (channel: Channel, user: User) => {
                handleTypingStart(channel, user, socket)
            }

            const emojiCreateListener = (emoji: GuildEmoji) => {
                handleEmojiCreate(emoji, socket)
            }

            const emojiUpdateListener = (oldEmoji: GuildEmoji, newEmoji: GuildEmoji) => {
                handleEmojiUpdate(oldEmoji, newEmoji, socket)
            }

            const channelUpdateListener = (_oldChannel: Channel, newChannel: Channel) => {
                handleChannelUpdate(newChannel, socket)
            }

            const channelCreateListener = (channel: Channel) => {
                handleChannelUpdate(channel, socket)
            }

            const channelDeleteListener = (channel: Channel) => {
                handleChannelDelete(channel, socket)
            }

            const guildMemberChangeListener = (member: GuildMember) => {
                handleMemberUpdate(member, socket)
            }

            const guildMemberUpdateListener = (_oldMember: GuildMember, newMember: GuildMember) => {
                handleMemberUpdate(newMember, socket)
            }

            const messageReactionAddListener = (reaction: MessageReaction, user: User) => {
                handleMessageReactionAdd(reaction, socket)
            }

            const messageReactionRemoveListener = (reaction: MessageReaction, user: User) => {
                handleMessageReactionRemove(reaction, socket)
            }

            logger.info(`Client connected [id=${socket.id}]`);

            if (interval) {
                clearInterval(interval);
            }

            bot.client.on('message', messageListener)

            bot.client.on('error', errorListener)
            bot.client.on("messageUpdate", messageUpdateListener)
            bot.client.on("presenceUpdate", presenceUpdateListener)
            bot.client.on("typingStart", typingStartListener)
            bot.client.on("emojiCreate", emojiCreateListener)
            bot.client.on("emojiUpdate", emojiUpdateListener)
            bot.client.on("channelCreate", channelCreateListener)
            bot.client.on("channelUpdate", channelUpdateListener)
            bot.client.on("channelDelete", channelDeleteListener)
            bot.client.on("guildMemberAdd", guildMemberChangeListener)
            bot.client.on("guildMemberUpdate", guildMemberUpdateListener)
            bot.client.on("messageReactionAdd", messageReactionAddListener)
            bot.client.on("messageReactionRemove", messageReactionRemoveListener)

            socket.on('sendMessage', (messageData: TypeMessageData) => {
                handleSendMessage(messageData)
            })

            socket.on('notificationsUpdate', (key: string) => {
                logger.info(`Setting new channel focus to: ${chalk.yellow(key)}`)
                handleNotificationsUpdate(key)
            })

            socket.on('messageEditRequest', (jsonParams: string) => {
                handleMessageEditRequest(jsonParams, socket, startDate)
            })

            socket.on('channelFocus', (key: string) => {
                logger.info(`Setting new channel focus to: ${chalk.yellow(key)}`)
                setNewChannelFocus(key)
            })

            socket.on('requestMessages', (jsonReqParams: string) => {
                let {
                    guildID,
                    channelID,
                    lastMessage
                } = JSON.parse(jsonReqParams);
                handleMessagesRequest(guildID, channelID, lastMessage, socket)
            })

            socket.on('disconnect', () => {
                bot.client.removeListener('message', messageListener)
                bot.client.removeListener('error', errorListener)
                bot.client.removeListener("messageUpdate", messageUpdateListener)
                bot.client.removeListener("presenceUpdate", presenceUpdateListener)
                bot.client.removeListener("typingStart", typingStartListener)
                bot.client.removeListener("emojiCreate", emojiCreateListener)
                bot.client.removeListener("emojiUpdate", emojiUpdateListener)
                bot.client.removeListener("channelCreate", channelCreateListener)
                bot.client.removeListener("channelUpdate", channelUpdateListener)
                bot.client.removeListener("channelDelete", channelDeleteListener)
                bot.client.removeListener("guildMemberAdd", guildMemberChangeListener)
                bot.client.removeListener("guildMemberUpdate", guildMemberUpdateListener)
                bot.client.removeListener("messageReactionAdd", messageReactionAddListener)
                bot.client.removeListener("messageReactionRemove", messageReactionRemoveListener)
                logger.info('Client disconnected');
            });

        });
    })
}
