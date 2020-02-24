import { LmaoBot } from '../lmaobot/lmaobot';
import { Message } from 'discord.js';
import getLogger from '../logger';
import { TypeMessageData } from '../types/lmaotypes';
import { readJSON } from 'fs-extra';
import chalk from 'chalk';
import { handleSendMessage } from '../socket/socketfunctions';
const logger = getLogger('LmaoBotControl');

export default class LmaoBotControl {
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
        this.bot.client.on("message",(message)=>{
            if(message.member!==null)this.commandsCheck(message)
        })
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

