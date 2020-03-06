import express from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';
import http from 'http';
import chalk from 'chalk';

import router from './routes/index';
import getLogger from './logger';
import DiscordBotSocketIo from './socket/botsocket';

import { DiscordBot } from './discordbot/bot';
import { TypeEmoji, EmojiMap, TypeGuild, TypeTextChannel } from './types/discord-bot-admin-types';
import { parseEmojis, parseNewMessage, parseGuilds, parseTextChannel } from './discordbot/typeparserfunctions';
import { TextChannel } from 'discord.js';
import BotControl from './commands/command';


const app = express();
const port = 3001;
const server = http.createServer(app);
const bot:DiscordBot = new DiscordBot();
const logger = getLogger('src/index');
// eslint-disable-next-line
let COMMAND:BotControl;
// Emoji setup.
let EMOJIS_MAP:EmojiMap = new Map<string,TypeEmoji>();
let CHANNEL_NOTIFICATIONS:Map<string,number> = new Map<string,number>();
let GUILD_DATA:Map<string,TypeGuild> = new Map<string,TypeGuild>();
let KEY_FOCUS:string = "";
// Function for updating EmojiMap w/ list of new Emojis.

export function updateEmojiMap(emojis:Map<string,TypeEmoji>,toRemove?:Map<string,TypeEmoji>){
    logger.info(chalk.yellow('ATTEMPTING TO UPDATE EMOJIS:')+JSON.stringify(emojis,null,1))
    if(toRemove){
        toRemove.forEach((_emoji,name)=>{
            if(EMOJIS_MAP[name]){
                EMOJIS_MAP[name]=undefined;
            }
        })
    }
    if(emojis){
        emojis.forEach((emoji,name)=>{
            if(!EMOJIS_MAP[name]){
                EMOJIS_MAP[name]=emoji
            }
        })
    }
    logger.info(chalk.yellow('UPDATED EMOJIS:')+JSON.stringify(emojis,null,1))
    return EMOJIS_MAP;
}

// Returns most up-to-date EmojiMap
export function getEmojiMap(){
    return EMOJIS_MAP;
}

this.getEmojiMap = getEmojiMap.bind(this);
this.updateEmojiMap = updateEmojiMap.bind(this);

export function getGuildData(){
    GUILD_DATA = parseGuilds(bot.client.guilds);
    return GUILD_DATA;
}

export function getChannelNotification(){
    return CHANNEL_NOTIFICATIONS;
}

export function updateChannelNotifications(key:string, value?:number, newChannel?:boolean){
    CHANNEL_NOTIFICATIONS[key] = value ? CHANNEL_NOTIFICATIONS[key] + value : 0
    if(newChannel){
        setNewChannelFocus(key)
    }
    return CHANNEL_NOTIFICATIONS;
}

export function getFocusKey(){
    return KEY_FOCUS;
}

export function setNewChannelFocus(key:string){
    KEY_FOCUS = key;
    CHANNEL_NOTIFICATIONS[key]=0;
}

export function getCommands(){
    return COMMAND.getCommands();
}

bot.client.once('ready',()=>{
    logger.info('Parsing emojis..');
    EMOJIS_MAP = parseEmojis(bot.client.emojis) as Map<string,TypeEmoji>;
    logger.info('Initializing commands w/ commandsDB.json');

    GUILD_DATA = parseGuilds(bot.client.guilds);
    KEY_FOCUS="Zippys Test Servergeneral";
    Object.values(GUILD_DATA).forEach((guild:TypeGuild)=>{
        Object.values(guild.channels).forEach((channel:TypeTextChannel)=>{
            CHANNEL_NOTIFICATIONS[guild.name+channel.name]=0;
        })
    })

    COMMAND = new BotControl(bot);
})

bot.client.on('message',(message)=>{
    if(message.member!==null){
        logger.info('Recieved new message.')
        const messageParsed = parseNewMessage(message);
        let newEmojis = messageParsed.newEmojis;
        if(newEmojis && Object.keys(newEmojis).length>0){
            Object.keys(newEmojis).forEach((name)=>{
                if(!EMOJIS_MAP[name]){
                    EMOJIS_MAP[name]=newEmojis[name];
                }
            })
        }
        const channel = parseTextChannel(message.channel as TextChannel).name
        if(message.guild.name+channel !== KEY_FOCUS){
            updateChannelNotifications(message.guild.name+channel,1)
        }
    }
})

// express.js setup
app.use(cors({
    origin:'http://localhost:3000',
    credentials:true
}));
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use(router)

// start frontent socket, server, bot login.
DiscordBotSocketIo(bot,server);
server.listen(port,'127.0.0.1')
bot.login()

export default bot;