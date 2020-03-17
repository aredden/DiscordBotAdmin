import { Message, Channel, User, GuildMember,
         MessageReaction, Presence, PartialMessage,
         GuildEmoji, PartialGuildMember,
         PartialChannel, PartialUser } from 'discord.js';
import socketio, { Socket } from 'socket.io';
import { DiscordBot } from '../discordbot/bot';
import 'discord.js';
import http from 'http';
import { parseGuildMember,
         parseNewMessage } from '../discordbot/typeparserfunctions';
import getLogger from '../logger';
import { TypeMessageData, UpdateGuildArguments, UpdateChannelArguments,
         UpdateMemberArguments,
         UpdateMessageArguments} from '../types/discord-bot-admin-types';
import { handleMessageUpdate, handleSendMessage,
        handleNotificationsUpdate, handleMessagesRequest,
        handleChannelUpdate, handleMemberUpdate,
        handleEmojiCreate, handleEmojiUpdate,
        handleChannelDelete, handleMessageEditRequest,
        handleMessageReactionAdd, handleMessageReactionRemove,
        handleTypingStart, handleMessage, handleUpdateMemberRequest,
        handleUpdateChannelRequest, handleUpdateGuildRequest,
        handleUpdateMessageRequest } from './socketfunctions';
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

            const messageUpdateListener = async (oldMsg: Message|PartialMessage, newMsg: Message|PartialMessage) => {
                const newMessage = newMsg.partial ? await newMsg.fetch() : newMsg as Message;
                const oldMessage = oldMsg.partial ? await oldMsg.fetch() : oldMsg as Message;
                handleMessageUpdate(oldMessage, newMessage, socket, startDate)
            }

            const presenceUpdateListener = async (_oldPresence: Presence, newPresence: Presence) => {
                if(newPresence.member){
                    let member = newPresence.member.partial ? await newPresence.member.fetch() : newPresence.member as GuildMember
                    let pres = await parseGuildMember(member);
                    socket.emit("presenceUpdate", JSON.stringify(pres))
                }
            }

            const typingStartListener = async (channel: Channel|PartialChannel, user: User|PartialUser) => {
                let chan = await channel.fetch();
                let usr = await user.fetch();
                handleTypingStart(chan, usr, socket)
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

            const channelCreateListener = (channel: Channel|PartialChannel) => {
                handleChannelUpdate(channel, socket)
            }

            const channelDeleteListener = (channel: Channel|PartialChannel) => {
                handleChannelDelete(channel, socket)
            }

            const guildMemberChangeListener = async (member: GuildMember|PartialGuildMember) => {
                let memb = member.partial ? await member.fetch() : member as GuildMember;
                handleMemberUpdate(memb, socket)
            }

            const guildMemberUpdateListener = async (_oldMember: GuildMember|PartialGuildMember, newMember: GuildMember|PartialGuildMember) => {
                let memb = newMember.partial ? await newMember.fetch() : newMember as GuildMember;
                handleMemberUpdate(memb, socket)
            }

            const messageReactionAddListener = (reaction: MessageReaction, _user: User|PartialUser) => {
                handleMessageReactionAdd(reaction, socket)
            }

            const messageReactionRemoveListener = (reaction: MessageReaction, _user: User|PartialUser) => {
                handleMessageReactionRemove(reaction, socket)
            }

            const messageDeleteListener = async (message: Message|PartialMessage) => {
                let msg = message.partial ? await message.fetch() : message as Message;
                let parsedMessage = await parseNewMessage(msg);
                socket.emit('messageDeleted',JSON.stringify(parsedMessage));
            }

            logger.info(`Client connected [id=${socket.id}]`);

            if (interval) {
                clearInterval(interval);
            }

            bot.client.on('message', messageListener)
            bot.client.on('messageDelete', messageDeleteListener)
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

            socket.on('updateGuild', async (updateArguments:string) => {
                handleUpdateGuildRequest(JSON.parse(updateArguments) as UpdateGuildArguments, socket);
            })

            socket.on('updateChannel', (updateArguments:string) => {
                handleUpdateChannelRequest(JSON.parse(updateArguments) as UpdateChannelArguments,socket)
            })

            socket.on('updateMember', (updateArguments:string) => {
                handleUpdateMemberRequest(JSON.parse(updateArguments) as UpdateMemberArguments, socket);
            })

            socket.on('updateMessage', (updateArguments:string) => {
                handleUpdateMessageRequest(JSON.parse(updateArguments) as UpdateMessageArguments, socket)
            })

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
                bot.client.removeListener('messageDelete', messageDeleteListener)
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
