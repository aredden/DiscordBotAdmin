import { LmaoBot } from '../lmaobot/lmaobot';
import { TextChannel, MessageAttachment, MessageEmbed } from 'discord.js';
import getLogger from '../logger';
import { TypeMessageData } from '../types/lmaotypes';

const logger = getLogger('LmaoBotControl');

export default class LmaoBotControl{
    public guilds:object;
    private bot:LmaoBot;

    constructor(bot:LmaoBot){
        this.bot=bot;
        this.bot.client.once('ready',()=>{
            logger.info('LmaoBot Ready');
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


export function handleSendMessage(
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
    logger.info(`Sending message to ${channel.name} in ${channel.guild.name} content:\n${messageData.content}`)
    channel.send(messageData.content)
        .then(
            success=>{
            logger.info(`Successfully sent message to ${channel.name}!`)},
            fail=>{
            logger.error(`Failed to send message to ${channel.name}!`)
            }
        );
}