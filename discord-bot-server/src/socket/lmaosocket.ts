import { Message, TextChannel, Channel, User, Emoji, GuildMember } from 'discord.js';
import socketio, { Socket } from 'socket.io';
import { DiscordBot } from '../discordbot/bot'
import 'discord.js';
import http from 'http';
import { parseNewMessage, parseGuildMember,
         convertDiscEmojiToTypeEmoji } from '../discordbot/typeparserfunctions';
import getLogger from '../logger';
import { TypeMessageData, EmojiMap, TypeEmoji } from '../types/lmaotypes'
import { handleMessageUpdate, handleSendMessage,
        handleNotificationsUpdate, handleMessagesRequest,
        handleTypingStart, handleTypingStop } from './socketfunctions';
import { setNewChannelFocus, updateEmojiMap } from '../index';
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
                const presenceUpdateListener = (oldMember:GuildMember,newMember:GuildMember)=>{
                    socket.emit("presenceUpdate", JSON.stringify(parseGuildMember(newMember)))
                }
                const typingStartListener = (channel:Channel, user:User) => {
                    handleTypingStart(channel,user,socket);
                }
                const typingStopListener = (channel:Channel, user:User) => {
                    handleTypingStop(channel,user,socket);
                }
                const emojiCreateListener = (emoji:Emoji)=>{
                    let mojiMap:EmojiMap = new Map<string,TypeEmoji>();
                    mojiMap[emoji.name]=convertDiscEmojiToTypeEmoji(emoji)
                    mojiMap = updateEmojiMap(mojiMap);
                    socket.emit("emojiUpdate",JSON.stringify(mojiMap));
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

                socket.on('sendMessage', (messageData:TypeMessageData)=>
                    handleSendMessage(messageData,bot))

                socket.on('notificationsUpdate', (key:string) => {
                    logger.info(`Setting new channel focus to: ${chalk.yellow(key)}`)
                    handleNotificationsUpdate(key)
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
                    logger.info('Client disconnected');
                    socket.removeAllListeners();
                });

            });
        }
    )
}
