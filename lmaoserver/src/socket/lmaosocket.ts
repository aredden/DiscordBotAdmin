import { Message, TextChannel } from 'discord.js';
import socketio, { Socket } from 'socket.io';
import { LmaoBot } from '../lmaobot/lmaobot'
import 'discord.js';
import http from 'http';
import { parseNewMessage } from '../lmaobot/typeparserfunctions';
import getLogger from '../logger';
import { TypeMessageData } from '../types/lmaotypes'
import { handleMessageUpdate, handleSendMessage, handleNotificationsUpdate, handleMessagesRequest } from './socketfunctions';
import { setNewChannelFocus } from '../index';
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

                socket.on('sendMessage', (messageData:TypeMessageData)=>
                    handleSendMessage(messageData,bot))

                socket.on('notificationsUpdate', (key:string) => {
                    handleNotificationsUpdate(key)
                })

                socket.on('channelFocus', (key:string) => {
                    setNewChannelFocus(key)
                })

                socket.on('messagesRequest', (_data:string)=>{
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





