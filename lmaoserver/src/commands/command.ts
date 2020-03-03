import { LmaoBot } from '../lmaobot/lmaobot';
import { Message, User, Collection, GuildMember } from 'discord.js';
import getLogger from '../logger';
import { TypeMessageData } from '../types/lmaotypes';
import { readJSON } from 'fs-extra';
import chalk from 'chalk';
import { handleSendMessage } from '../socket/socketfunctions';
import { parseGuildMembers } from '../lmaobot/typeparserfunctions';
const logger = getLogger('LmaoBotControl');


type parsedCommandDB={
        mention:string[],
        contains:Map<string,string[]>
        startsWith:Map<string,string[]>
}

export default class LmaoBotControl {

    public guilds:object;
    private bot:LmaoBot;
    private mention:string[] = new Array<string>();
    private contains:Map<string,string[]> = new Map<string,string[]>();
    private startsWith:Map<string,string[]> = new Map<string,string[]>();
    private regex:RegExp;
    constructor(bot:LmaoBot){
        this.bot=bot;
        this.bot.client.once('ready',()=>{
            logger.info('LmaoBot Ready');
        })
        readJSON('./src/commandsDB.json')
            .then(_json=>this.setCommandsDB(_json))
            .then(_finished=>this.buildCommandRegex())
        this.bot.client.on("message",(message)=>{
            if(message.member!==null)this.commandsCheck(message)
        })
    }

    commandsCheck(message:Message){
        let {content} = message;
        if(!message.author.bot){
            let messageData:TypeMessageData={
                guild:message.guild.id,
                channel:message.channel.id,
                content:""
            }
            if(content.toLowerCase().match(this.regex)!==null){
                messageData.content = this.handleStartsWith(content.toLowerCase())
                if(!messageData.content || messageData.content === ""){
                    messageData.content = this.handleContains(content.toLowerCase())
                }
            }else if(!message.mentions.members.entries().next().done){
                let arrayThing = parseGuildMembers(message.mentions.members);
                for(let x of Object.values(arrayThing)){
                    if(x.user.id===this.bot.client.user.id){
                        const len = this.mention.length;
                        messageData.content = this.mention[Math.floor(Math.abs((Math.random()*len-.00000001)))]
                    }
                }
            }

            if(messageData.content && messageData.content!==""){
                handleSendMessage(messageData,this.bot)
            }
        }
    }

    handleStartsWith(content:string){
        let {found, trigger} = this.checkStartsWithFromArray(content,Object.keys(this.startsWith));
        logger.info(`found: ${found}\n trigger:${trigger}`);
        if(found){
            let len = this.startsWith[trigger].length;
            return (this.startsWith[trigger][Math.floor(Math.abs((Math.random()*len-.00000001)))]);
        }
        return "";
    }

    handleContains(content:string){
        let {found, trigger} = this.checkContainsFromArray(content,Object.keys(this.contains));
        logger.info(`found: ${found}\n trigger:${trigger}`);
        if(found){
            let len = this.contains[trigger].length;
            return (this.contains[trigger][Math.floor(Math.abs((Math.random()*len-.00000001)))]);
        }
        return "";
    }

    buildCommandRegex(): any {
        let reg:string[] = [];
        Object.keys(this.contains).forEach((str)=>reg.push(str))
        Object.keys(this.startsWith).forEach((str)=>reg.push(`^${str}`))
        this.regex = RegExp(reg.join("|"),"gm");
    }

    setCommandsDB(parsedJson:parsedCommandDB){
        logger.info(chalk.yellow(`COMMANDS PARSED:\n`)+JSON.stringify(parsedJson,null,2));
        this.mention = parsedJson.mention;
        this.contains = parsedJson.contains;
        this.startsWith = parsedJson.startsWith;
        return true;
    }

    checkStartsWithFromArray(msg:string,checks:string[]){
        let found:boolean = false;
        let trigger:string = "";
        for(let x of checks){
            if(msg.indexOf(x)===0){
                found=true;
                trigger=x;
                break;
            }
        }
        return {found, trigger};
    }

    checkContainsFromArray(msg:string,checks:string[]){
        logger.info(`${checks}`)
        let found:boolean = false;
        let trigger:string = "";
        for(let x of checks){
            if(msg.indexOf(x)!==-1){
                found=true;
                trigger=x;
                break;
            }
        }
        return {found,trigger};
    }
}

