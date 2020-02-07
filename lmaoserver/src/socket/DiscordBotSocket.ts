import {Message, Guild, Collection} from "discord.js";
import socketio, { Socket } from 'socket.io';
import {LmaoBot} from '../lmaobot/LmaoBot'
import 'discord.js';
import http from 'http';
import {parseMessage} from '../lmaobot/LmaoBotParsingFunctions';
import winston from 'winston'

const logger = winston.createLogger({
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'log' }),
	],
	format: winston.format.printf(log => `[DiscordBotSocketIO - ${log.level.toUpperCase()}] - ${log.message}`),
});

export default function DiscordBotSocketIo(bot:LmaoBot,server:http.Server) {
    let isReady:boolean=false;
    let io : socketio.Server;
    let data: Collection<string,Guild>=new Collection<string,Guild>();
    let interval:NodeJS.Timeout;
    io = socketio(server);
    bot.client.once("ready",()=>
        {
        logger.info("Bot ready")
        io.on("connection", (socket:Socket) => {
                logger.info(`Client connected [id=${socket.id}]`);
                if (interval) {
                    clearInterval(interval);
                }
                bot.client.on("message", (msg : Message) => socket.emit("discordmessage", JSON.stringify(
                    parseMessage(msg)
                )));
                bot.client.on("error", (err : Error) => socket.emit("error", JSON.stringify(err)))
                socket.on("sendMessage", (messageData)=>{

                })
                socket.on("disconnect", () => {
                    logger.info("Client disconnected");
                    socket.removeAllListeners();
                });
            });
        }
    )
}