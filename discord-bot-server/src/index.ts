import express from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';
import http from 'http';
import chalk from 'chalk';
import dotenv from 'dotenv';

import router from './routes/index';
import getLogger from './logger';
import DiscordBotSocketIo from './socket/botsocket';

import { DiscordBot } from './discordbot/bot';
import { TypeEmoji, EmojiMap, TypeGuild,
         TypeTextChannel } from './types/discord-bot-admin-types';
import { parseEmojis, parseGuilds,
         parseTextChannel } from './discordbot/typeparserfunctions';
import { TextChannel } from 'discord.js';
import BotControl from './commands/command';
import { buildSocketFunctions } from './socket/socketfunctions';

dotenv.config()
const HOST = process.env.LOCAL_HOST;
const INTERFACE_ADDR = process.env.LOCAL_INTERFACE;
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

export function updateEmojiMap(emojis: Map<string,TypeEmoji>, toRemove?: Map<string,TypeEmoji>){
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
    logger.info(chalk.yellow('UPDATED EMOJIS:')+JSON.stringify(EMOJIS_MAP,null,1))
    return EMOJIS_MAP;
}

// Returns most up-to-date EmojiMap
export function getEmojiMap(){
    return EMOJIS_MAP;
}

this.getEmojiMap = getEmojiMap.bind(this);
this.updateEmojiMap = updateEmojiMap.bind(this);

export async function getGuildData(){
    GUILD_DATA = await parseGuilds(bot.client.guilds);
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

bot.client.once('ready', async ()=>{

    logger.info('Parsing emojis..');
    EMOJIS_MAP = parseEmojis(bot.client.emojis.cache) as Map<string,TypeEmoji>;

    logger.info('Building socket functions..');
    buildSocketFunctions();

    logger.info('Parsing initial guild data.');
    GUILD_DATA = await parseGuilds(bot.client.guilds);
    KEY_FOCUS="Zippys Test Servergeneral";
    Object.values(GUILD_DATA).forEach((guild:TypeGuild)=>{
        Object.values(guild.channels).forEach((channel:TypeTextChannel)=>{
            CHANNEL_NOTIFICATIONS[guild.name+channel.name]=0;
        })
    })
    logger.info('Initializing commands w/ commandsDB.json');
    COMMAND = new BotControl(bot);
})

bot.client.on('message', async (message)=>{
    if(message.member!==null && !message.deleted){
        logger.info('Recieved new message.')
        const channel = await parseTextChannel(message.channel as TextChannel)
        const channelName = channel.name
        if(message.guild.name+channelName !== KEY_FOCUS){
            updateChannelNotifications(message.guild.name+channel,1)
        }
    }
})

// express.js setup
app.use(cors({
    origin: INTERFACE_ADDR,
    credentials: true
}));
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use(router)

// start frontent socket, server, bot login.
DiscordBotSocketIo(bot,server);
server.listen(port, HOST)
bot.login()

export default bot;