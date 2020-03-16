import { Message, Channel, User, GuildMember,
         MessageReaction, Presence, PartialMessage,
         GuildEmoji, PartialGuildMember,
         PartialChannel, PartialUser, Guild,
         TextChannel } from 'discord.js';
import socketio, { Socket } from 'socket.io';
import { DiscordBot } from '../discordbot/bot';
import 'discord.js';
import http from 'http';
import { parseGuildMember,
         parseNewMessage } from '../discordbot/typeparserfunctions';
import getLogger from '../logger';
import { TypeMessageData, UpdateGuildArguments, UpdateGuildResult,
         UpdateChannelArguments, UpdateChannelResult,
         MemberUpdateArguments, UpdateMemberResult } from '../types/discord-bot-admin-types';
import { handleMessageUpdate, handleSendMessage,
        handleNotificationsUpdate, handleMessagesRequest,
        handleChannelUpdate, handleMemberUpdate,
        handleEmojiCreate, handleEmojiUpdate,
        handleChannelDelete, handleMessageEditRequest,
        handleMessageReactionAdd, handleMessageReactionRemove,
        handleTypingStart, handleMessage } from './socketfunctions';
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

            /**
             *  @on 'updateGuild'
             *  Can only take one UpdateGuildArgument at a time otherwise will not complete
             *  all update requests.
             *  @param updateArguments:UpdateGuildArguments
             */
            socket.on('updateGuild', async (updateArguments:UpdateGuildArguments)=>{
                let { guildID, options} = updateArguments;
                let targetGuild = bot.client.guilds.resolve(guildID)
                let { setAFKChannel, setAFKTimeout, setName, setOwner, setRegion,
                        setSystemChannel, setVerificationLevel } = options;
                let result:UpdateGuildResult;
                switch(true){
                    case (setAFKChannel !== undefined):
                        const {channelID} = setAFKChannel;
                        await targetGuild.setAFKChannel(channelID,setAFKChannel.reason).then(
                            _success => result = {setAFKChannel:true},
                            _fail=> result = {setAFKChannel:false}
                        )
                        break;
                    case (setAFKTimeout !== undefined):
                        let {time} = setAFKTimeout;
                        await targetGuild.setAFKTimeout(time,setAFKChannel.reason).then(
                            _success => result = {setAFKTimeout:true},
                            _fail => result = {setAFKTimeout:false})
                        break;
                    case (setName !== undefined):
                        let {name} = setName;
                        await targetGuild.setName(name,setName.reason).then(
                            _success=> result = {setName:true},
                            _fail => result = {setName:false})
                        break;
                    case (setOwner !== undefined):
                        await targetGuild.setOwner(setOwner.memberID, setOwner.reason).then(
                            _success => result = {setOwner:true},
                            _fail => result = {setOwner:false})
                        break;
                    case (setRegion !== undefined):
                        let {region} = setRegion;
                        await targetGuild.setRegion(region, setRegion.reason).then(
                            _success=> result = {setRegion:true},
                            _fail=> result = {setRegion:false})
                        break;
                    case (setSystemChannel !== undefined):
                        await targetGuild.setSystemChannel(setSystemChannel.channelID, setSystemChannel.reason).then(
                            _success => result = {setOwner:true},
                            _fail => result = {setOwner:false})
                        break;
                    case (setVerificationLevel !== undefined):
                        await targetGuild.setVerificationLevel(setVerificationLevel.level, setOwner.reason).then(
                            _success => result = {setOwner:true},
                            _fail => result = {setOwner:false})
                        break;
                    default:
                        break;
                }
                socket.emit('updateGuildResult', JSON.stringify(result))
            })


            socket.on('updateChannel', async (updateArguments:UpdateChannelArguments) => {
                let { channelID, options } = updateArguments;
                let { setNSFW, setName, setParent, setPosition, setRateLimitPerUser } = options;
                let channel = await bot.client.channels.fetch(channelID, true)
                let result: UpdateChannelResult;
                if(channel.type === "text"){
                    let txtChannel = channel as TextChannel;
                    switch(true){
                        case (setNSFW !== undefined):
                            await txtChannel.setNSFW(setNSFW.value).then(
                                _success => result = {setNSFW:true},
                                _fail=> result = {setNSFW:false}
                            )
                            break;
                        case (setName !== undefined):
                            await txtChannel.setName(setName.name,setName.reason).then(
                                _success => result = {setName:true},
                                _fail => result = {setName:false}
                            )
                            break;
                        case (setParent !== undefined):
                            await txtChannel.setParent(setParent.channel,setParent.options).then(
                                _success => result = {setParent:true},
                                _fail => result = {setParent:false}
                            )
                            break
                        case (setPosition !== undefined):
                            await txtChannel.setPosition(setPosition.position,setPosition.options).then(
                                _success => result = {setPosition:true},
                                _fail => result = {setPosition:false}
                            )
                            break;
                        case (setRateLimitPerUser !== undefined):
                            await txtChannel.setRateLimitPerUser(setRateLimitPerUser.limit,setRateLimitPerUser.reason).then(
                                _success => result = {setRateLimitPerUser:true},
                                _fail => result = {setRateLimitPerUser:false}
                            )
                            break
                        default:
                            break;
                    }
                    socket.emit('updateChannelResult',JSON.stringify(result));
                }
            })

            socket.on('updateMember', async (updateArguments:MemberUpdateArguments) => {
                let {guildID, memberID, options} = updateArguments;
                let {ban, kick, giveRole, removeRole, nickName} = options
                let guild: Guild = bot.client.guilds.cache.get(guildID);
                let member: GuildMember = guild.members.cache.get(memberID);
                let result: UpdateMemberResult;

                if (!member.manageable){
                    socket.emit("updateMemberResult", JSON.stringify({manageable:false}))
                    return;
                }

                switch(true){
                    case (ban !== undefined):
                        await member.ban(ban).then(
                            _success => result = {banned:true},
                            _fail => result = {banned:false})
                        break;
                    case (kick !== undefined):
                        await member.kick(kick.reason).then(
                            _success => result = {kicked:true},
                            _fail => result = {kicked:false})
                        break;
                    case (giveRole !== undefined):
                        await member.roles.add(giveRole.roleID).then(
                            _success => result = {gaveRole:true},
                            _fail => result = {gaveRole:false})
                        break;
                    case (removeRole !== undefined):
                        await member.roles.remove(removeRole.roleID).then(
                            _success=> result = {removedRole:true},
                            _fail => result = {removedRole:false})
                        break;
                    case (nickName !== undefined):
                        await member.setNickname(nickName).then(
                            _success => result = {nickname:true},
                            _fail => result = {nickname:false})
                        break;
                    default:
                        break;
                }
                socket.emit("updateMemberResult", JSON.stringify(result));
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
