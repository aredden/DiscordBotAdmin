import { Message, TextChannel, Channel, User, Emoji, GuildMember, Guild, MessageReaction } from 'discord.js';
import socketio, { Socket } from 'socket.io';
import { DiscordBot } from '../discordbot/bot'
import 'discord.js';
import http from 'http';
import { parseNewMessage, parseGuildMember,
         convertDiscEmojiToTypeEmoji } from '../discordbot/typeparserfunctions';
import getLogger from '../logger';
import { TypeMessageData, EmojiMap,
         TypeEmoji, TypeGuild } from '../types/discord-bot-admin-types'
import { handleMessageUpdate, handleSendMessage,
        handleNotificationsUpdate, handleMessagesRequest,
        handleTypingStart, handleTypingStop, handleChannelUpdate } from './socketfunctions';
import { setNewChannelFocus, updateEmojiMap, getGuildData } from '../index';
import chalk from 'chalk';
const logger = getLogger('DiscordBotSocket');

export default function lmaoSocket(bot:DiscordBot,server:http.Server) {
    const startDate = Date.now()
    let io : socketio.Server;
    let interval:NodeJS.Timeout;
    io = socketio(server).json;

    bot.client.once('ready',()=>
        {
        logger.info('Bot ready')
        io.on('connection', (socket:Socket) => {

                const messageListener = (msg : Message) =>{
                    if(msg.channel instanceof TextChannel){
                        socket.emit('discordmessage', JSON.stringify(parseNewMessage(msg)));
                    }
                };
                const errorListener = (err : Error) => socket.emit('error', JSON.stringify(err));
                const messageUpdateListener =  (oldMsg:Message,newMsg:Message)=>
                    handleMessageUpdate(oldMsg,newMsg,socket,startDate)
                const presenceUpdateListener = (_oldMember:GuildMember,newMember:GuildMember)=>{
                    socket.emit("presenceUpdate", JSON.stringify(parseGuildMember(newMember)))}
                const typingStartListener = (channel:Channel, user:User) => {
                    handleTypingStart(channel,user,socket);}
                const typingStopListener = (channel:Channel, user:User) => {
                    handleTypingStop(channel,user,socket);}
                const emojiCreateListener = (emoji:Emoji)=>{
                    let mojiMap:EmojiMap = new Map<string,TypeEmoji>();
                    mojiMap[emoji.name]=convertDiscEmojiToTypeEmoji(emoji)
                    mojiMap = updateEmojiMap(mojiMap);
                    socket.emit("emojiUpdate",JSON.stringify(mojiMap));}
                const emojiUpdateListener = (oldEmoji:Emoji,newEmoji:Emoji)=>{
                    let mojiMap:EmojiMap = new Map<string,TypeEmoji>();
                    let toRemove:EmojiMap = new Map<string,TypeEmoji>();
                    toRemove[oldEmoji.name] = convertDiscEmojiToTypeEmoji(oldEmoji);
                    mojiMap[newEmoji.name] = convertDiscEmojiToTypeEmoji(newEmoji);
                    mojiMap = updateEmojiMap(mojiMap,toRemove);
                    socket.emit("emojiUpdate",JSON.stringify(mojiMap));}
                const emojiDeleteListener = (emoji:Emoji) =>{
                    let mojiMap:EmojiMap = new Map<string,TypeEmoji>();
                    let toRemove:EmojiMap = new Map<string,TypeEmoji>();
                    toRemove[emoji.name] = convertDiscEmojiToTypeEmoji(emoji);
                    mojiMap = updateEmojiMap(mojiMap,toRemove)
                    socket.emit("emojiUpdate",JSON.stringify(mojiMap))}
                const channelUpdateListener = (_oldChannel:Channel, newChannel:Channel)=>{
                    handleChannelUpdate(newChannel,socket);}
                const channelCreateListener = (channel:Channel) => {
                    handleChannelUpdate(channel,socket);}
                const channelDeleteListener = (channel:Channel) => {
                    if(channel.type === 'text'){
                        let txtChannel = channel as TextChannel
                        socket.emit("channelDelete",JSON.stringify({
                            guild:txtChannel.guild.name,
                            id:txtChannel.id
                        }))
                    }
                }
                const guildMemberAddListener = (member:GuildMember)=>{
                    let guildname = member.guild.name
                    let guildData = getGuildData()
                    let members = (guildData[guildname] as TypeGuild).users
                    socket.emit('memberUpdate',JSON.stringify({guild:guildname,members}))
                }
                const guildMemberRemoveListener = (member:GuildMember) => {
                    let guildname = member.guild.name
                    let guildData = getGuildData()
                    let members = (guildData[guildname] as TypeGuild).users
                    socket.emit('memberUpdate',JSON.stringify({guild:guildname,members}))
                }
                const guildMemberUpdateListener = (_oldMember:GuildMember, newMember:GuildMember) => {
                    let guildname = newMember.guild.name
                    let guildData = getGuildData()
                    let members = (guildData[guildname] as TypeGuild).users
                    socket.emit('memberUpdate',JSON.stringify({guild:guildname,members}))
                }
                const messageReactionAddListener = (reaction:MessageReaction,user:User) => {

                }
                const messageReactionRemoveListener = (reaction:MessageReaction,user:User) => {
                }
                logger.info(`Client connected [id=${socket.id}]`);

                if(interval){clearInterval(interval);}

                bot.client.on('message',messageListener)
                bot.client.on('error', errorListener)
                bot.client.on("messageUpdate", messageUpdateListener)
                bot.client.on("presenceUpdate", presenceUpdateListener)
                bot.client.on("typingStart",typingStartListener)
                bot.client.on("typingStop",typingStopListener)
                bot.client.on("emojiCreate", emojiCreateListener)
                bot.client.on("emojiUpdate",emojiUpdateListener)
                bot.client.on("emojiDelete",emojiDeleteListener)
                bot.client.on("channelCreate",channelCreateListener)
                bot.client.on("channelUpdate",channelUpdateListener)
                bot.client.on("channelDelete",channelDeleteListener)
                bot.client.on("guildMemberAdd",guildMemberAddListener)
                bot.client.on("guildMemberRemove",guildMemberRemoveListener)
                bot.client.on("guildMemberUpdate",guildMemberUpdateListener)

                bot.client.on("messageReactionAdd",messageReactionAddListener)
                bot.client.on("messageReactionRemove",messageReactionRemoveListener)

                socket.on('sendMessage', (messageData:TypeMessageData)=>
                    handleSendMessage(messageData,bot))

                socket.on('notificationsUpdate', (key:string) => {
                    logger.info(`Setting new channel focus to: ${chalk.yellow(key)}`)
                    handleNotificationsUpdate(key)
                })

                socket.on('messageEditRequest',(data:string) => {
                    let {guildID,channelID,messageID,content} = JSON.parse(data);
                    let guild:Guild = bot.client.guilds.get(guildID)
                    let targetChannel:TextChannel = guild.channels.get(channelID) as TextChannel
                    let targetMessage = targetChannel.messages.get(messageID) as Message
                    targetMessage.edit(content)
                        .then(
                            _success=>{
                                logger.info(`Succeeded in editting message from channel ${targetChannel.name}`)
                                let newMessage = targetChannel.messages.get(messageID)
                                handleMessageUpdate(targetMessage,newMessage,socket,startDate)
                            },
                            _fail =>
                                logger.error(`Failed to send message to ${targetChannel.name}.. \n Error: ${_fail.toString()}`)
                        )
                })

                socket.on('channelFocus', (key:string) => {
                    logger.info(`Setting new channel focus to: ${chalk.yellow(key)}`)
                    setNewChannelFocus(key)
                })

                socket.on('requestMessages', (_data:string)=>{
                    let data = JSON.parse(_data);
                    handleMessagesRequest(data.guildID,data.channelID,data.lastMessage,socket)
                })

                socket.on("killingSocket", ()=>{
                    logger.info("Killing socket")
                    socket.removeAllListeners();
                })

                socket.on('disconnect', () => {
                    bot.client.removeListener('message',messageListener)
                    bot.client.removeListener('error', errorListener)
                    bot.client.removeListener("messageUpdate", messageUpdateListener)
                    bot.client.removeListener("presenceUpdate", presenceUpdateListener)
                    bot.client.removeListener("typingStart", typingStartListener)
                    bot.client.removeListener("typingStop", typingStopListener)
                    bot.client.removeListener("emojiCreate", emojiCreateListener)
                    bot.client.removeListener("emojiUpdate",emojiUpdateListener)
                    bot.client.removeListener("emojiDelete",emojiDeleteListener)
                    bot.client.removeListener("channelCreate",channelCreateListener)
                    bot.client.removeListener("channelUpdate",channelUpdateListener)
                    bot.client.removeListener("channelDelete",channelDeleteListener)
                    bot.client.removeListener("guildMemberAdd",guildMemberAddListener)
                    bot.client.removeListener("guildMemberRemove",guildMemberRemoveListener)
                    bot.client.removeListener("guildMemberUpdate",guildMemberUpdateListener)
                    logger.info('Client disconnected');
                    socket.removeAllListeners();
                });

            });
        }
    )
}
