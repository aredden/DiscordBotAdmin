import { Message, TextChannel, Channel, User, Emoji } from 'discord.js';
import socketio, { Socket } from 'socket.io';
import { LmaoBot } from '../lmaobot/lmaobot'
import 'discord.js';
import http from 'http';
import { parseNewMessage, parseGuildMember, convertDiscEmojiToTypeEmoji } from '../lmaobot/typeparserfunctions';
import getLogger from '../logger';
import { TypeMessageData, EmojiMap, TypeEmoji } from '../types/lmaotypes'
import { handleMessageUpdate, handleSendMessage,
        handleNotificationsUpdate, handleMessagesRequest,
        handleTypingStart, handleTypingStop } from './socketfunctions';
import { setNewChannelFocus, updateEmojiMap } from '../index';
import chalk from 'chalk';
const logger = getLogger('DiscordBotSocket');

export default function lmaoSocket(bot:LmaoBot,server:http.Server) {
    const startDate = Date.now()
    let io : socketio.Server;
    let interval:NodeJS.Timeout;
    io = socketio(server).json;
    bot.client.once('ready',()=>
        {
        logger.info('Bot ready')
        io.on('connection', (socket:Socket) => {

                logger.info(`Client connected [id=${socket.id}]`);

                if(interval){clearInterval(interval);}

                bot.client.on('message', (msg : Message) =>{
                    if(msg.channel instanceof TextChannel){
                        socket.emit('discordmessage', JSON.stringify(parseNewMessage(msg)));
                    }
                })
                bot.client.on('error', (err : Error) =>
                    socket.emit('error', JSON.stringify(err)))

                bot.client.on("messageUpdate", (oldMsg:Message,newMsg:Message)=>
                    handleMessageUpdate(oldMsg,newMsg,socket,startDate))

                bot.client.on("presenceUpdate", (oldMember,newMember)=>{
                    socket.emit("presenceUpdate", JSON.stringify(parseGuildMember(newMember)))
                })

                bot.client.on("typingStart",(channel:Channel, user:User) => {
                    handleTypingStart(channel,user,socket);
                })

                bot.client.on("typingStop",(channel:Channel, user:User) => {
                    handleTypingStop(channel,user,socket);
                })

                bot.client.on("emojiCreate", (emoji:Emoji)=>{
                    let mojiMap:EmojiMap = new Map<string,TypeEmoji>();
                    mojiMap[emoji.name]=convertDiscEmojiToTypeEmoji(emoji)
                    mojiMap = updateEmojiMap(mojiMap);
                    socket.emit("emojiUpdate",JSON.stringify(mojiMap));
                })

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

                socket.on('disconnect', () => {
                    logger.info('Client disconnected');
                    socket.removeAllListeners();
                });
            });
        }
    )
}
