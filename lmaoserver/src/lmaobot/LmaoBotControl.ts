import { LmaoBot } from "./LmaoBot";
import { parseGuilds, parseEmojis } from "./LmaoBotParsingFunctions";
import { TextChannel } from "discord.js";
import getLogger from '../Logger';

const logger = getLogger("LmaoBotControl");

export default class LmaoBotControl{
    public guilds:object;
    private bot:LmaoBot;

    constructor(bot:LmaoBot){
        this.bot=bot;
        this.bot.client.once("ready",()=>{
            logger.info("LmaoBot Ready");
        })
    }

    sendMessage = (guildID:string, channelID:string, content:string) => {
        const guilds = this.bot.client.guilds;
        const textchannel = guilds.get(guildID).channels.get(channelID) as TextChannel;
        textchannel.send(content)
            .then(
                success=>
                logger.error(`Successfully sent message to ${textchannel.name}`),
                failure=>
                logger.error(`Failed to send message to ${textchannel.name}`)
            );
    }
}