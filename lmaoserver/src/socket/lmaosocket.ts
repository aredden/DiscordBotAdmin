import { Message } from 'discord.js';
import socketio, { Socket } from 'socket.io';
import { LmaoBot } from '../lmaobot/lmaobot'
import 'discord.js';
import http from 'http';
import { parseNewMessage, parseMessage } from '../lmaobot/typeparserfunctions';
import getLogger from '../logger';
import { TypeMessageData } from '../types/lmaotypes'
import { handleSendMessage } from '../commands/command'
import { handleMessageUpdate } from './socketfunctions';
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

                bot.client.on('message', (msg : Message) =>
                    socket.emit('discordmessage', JSON.stringify(parseNewMessage(msg))));

                bot.client.on('error', (err : Error) =>
                    socket.emit('error', JSON.stringify(err)))

                bot.client.on("messageUpdate", (oldMsg:Message,newMsg:Message)=>
                    handleMessageUpdate(oldMsg,newMsg,socket,startDate))

                socket.on('sendMessage', (messageData:TypeMessageData)=>
                    handleSendMessage(messageData,bot))

                socket.on('disconnect', () => {
                    logger.info('Client disconnected');
                    socket.removeAllListeners();
                });
            });
        }
    )
}





