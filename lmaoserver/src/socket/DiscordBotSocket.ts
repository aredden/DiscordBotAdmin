import { Message, Guild, Collection, TextChannel, MessageAttachment, MessageEmbed } from 'discord.js';
import socketio, { Socket } from 'socket.io';
import { LmaoBot } from '../lmaobot/LmaoBot'
import 'discord.js';
import http from 'http';
import { parseNewMessage } from '../lmaobot/LmaoBotTypeParsingFunctions';
import getLogger from '../Logger';
import { TypeMessageData } from '../types/lmaotypes'
const logger = getLogger('DiscordBotSocketIo');

export default function DiscordBotSocketIo(bot:LmaoBot,server:http.Server) {
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

                bot.client.on('error', (err : Error) => socket.emit('error', JSON.stringify(err)))

                socket.on('sendMessage', (messageData:TypeMessageData)=>handleSendMessage(messageData,bot))

                socket.on('disconnect', () => {
                    logger.info('Client disconnected');
                    socket.removeAllListeners();
                });
            });
        }
    )
}

function handleSendMessage(
    messageData:TypeMessageData,
    bot:LmaoBot,
    attatchments?:MessageAttachment[],
    embeds?:MessageEmbed[]){
    const guild = bot.client.guilds.get(messageData.guild)
    if(!guild){
        logger.error(`guild w/ id: ${messageData.guild} does not exist!`)
        return;
    }
    const channel = guild.channels.get(messageData.channel) as TextChannel;
    if(!channel){
        logger.error(`guild w/ id: ${messageData.channel} does not exist!`)
        return;
    }
    logger.debug(`Sending message to ${channel.name} in ${channel.guild.name}\n-- content:${messageData.content}`)
    channel.send(messageData.content)
        .then(
            success=>{
            logger.info(`Successfully sent message to ${channel.name}!`)},
            fail=>{
            logger.error(`Failed to send message to ${channel.name}!`)
            }
        );
}

