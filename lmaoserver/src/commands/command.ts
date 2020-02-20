import { LmaoBot } from '../lmaobot/lmaobot';
import { TextChannel, MessageAttachment, MessageEmbed, Message } from 'discord.js';
import getLogger from '../logger';
import { TypeMessageData } from '../types/lmaotypes';
import { readJSON } from 'fs-extra';
import chalk = require('chalk');
const logger = getLogger('LmaoBotControl');

export default class LmaoBotControl{
    public guilds:object;
    private bot:LmaoBot;
    private commandsDB:object;
    constructor(bot:LmaoBot){
        this.bot=bot;
        this.bot.client.once('ready',()=>{
            logger.info('LmaoBot Ready');
        })
        readJSON('./src/commandsDB.json')
            .then(_json=>this.setCommandsDB(_json))
        this.bot.client.on("message",(message)=>this.commandsCheck(message))
    }

    commandsCheck(message:Message){
        let {content} = message;
        let {commandsDB} = this;
        if(!message.author.bot){
            let messageData:TypeMessageData={
                guild:message.guild.id,
                channel:message.channel.id,
                content:""
            }
            Object.keys(commandsDB).forEach((trigger,idx)=>{
                messageData.content = commandsDB[trigger];
                if(content.startsWith(trigger)){
                    logger.info(chalk.yellow(`COMMAND TRIGGERED:`)+trigger)
                    handleSendMessage(messageData,this.bot)
                }
            })
        }
    }

    setCommandsDB(parsedJson:object){
        logger.info(chalk.yellow(`COMMANDS PARSED:\n`)+JSON.stringify(parsedJson,null,2));
        this.commandsDB=parsedJson;
    }
}

export function handleSendMessage(
    messageData:TypeMessageData,
    bot:LmaoBot,
    _attatchments?:MessageAttachment[],
    _embeds?:MessageEmbed[]){
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
            _success=>{
            logger.info(`Successfully sent message to ${channel.name}!`)},
            _fail=>{
            logger.error(`Failed to send message to ${channel.name}!`)
            }
        );
}