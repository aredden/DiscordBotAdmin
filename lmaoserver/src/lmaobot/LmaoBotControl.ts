import { LmaoBot } from "./LmaoBot";
import { parseGuilds, parseEmojis } from "./LmaoBotParsingFunctions";
import winston = require("winston");
import { TextChannel } from "discord.js";

const logger = winston.createLogger({
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'log' }),
	],
	format: winston.format.printf(log => `[LmaoBotControl - ${log.level.toUpperCase()}] - ${log.message}`),
});

export default class LmaoBotControl{
    public guilds:object;
    private bot:LmaoBot;
    constructor(bot:LmaoBot){
        this.bot=bot;
        this.bot.client.once("ready",()=>{
            logger.info("LmaoBot Ready");
            this.guilds = parseGuilds(bot.client.guilds);
        })
    }

    sendMessage = (guildID:string, channelID:string, content:string) => {
        const textchannel = this.bot.client.guilds.get(guildID).channels.get(channelID) as TextChannel;
        textchannel.send(content)
            .then(
                success=>
                logger.info(`Successfully sent message to ${textchannel.name}`),
                failure=>
                logger.info(`Failed to send message to ${textchannel.name}`)
            );
    }
}