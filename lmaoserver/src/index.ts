import express from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';
import http from 'http';
import router from './routes/index';
import DiscordBotSocketIo from './socket/lmaosocket';
import { LmaoBot } from './lmaobot/lmaobot';
import getLogger from './logger';
import { TypeEmoji, EmojiMap } from './types/lmaotypes';
import { parseEmojis, parseNewMessage } from './lmaobot/typeparserfunctions';
import chalk from 'chalk';
import LmaoBotControl from './commands/command';

const app = express();
const port = 3001;
const server = http.createServer(app);
const bot:LmaoBot = new LmaoBot();
const logger = getLogger('src/index');
// eslint-disable-next-line
let COMMAND:LmaoBotControl;
// Emoji setup.
let EMOJIS_MAP:EmojiMap = new Map<string,TypeEmoji>();

// Function for updating EmojiMap w/ list of new Emojis.
export function updateEmojiMap(emojis:Map<string,TypeEmoji>){
    logger.info(chalk.red('ATTEMPTING TO UPDATE EMOJIS:')+JSON.stringify(emojis))
    if(emojis){
        emojis.forEach((emoji,name)=>{
            if(!EMOJIS_MAP[name]){
                EMOJIS_MAP[name]=emoji
            }
        })
    }
    logger.info(chalk.red('UPDATE EMOJIS:')+JSON.stringify(emojis))
    return EMOJIS_MAP;
}

// Returns most up-to-date EmojiMap
export function getEmojiMap(){
    return EMOJIS_MAP;
}
this.getEmojiMap = getEmojiMap.bind(this);
this.updateEmojiMap = updateEmojiMap.bind(this);

bot.client.once('ready',()=>{
    logger.info('Parsing emojis..');
    EMOJIS_MAP = parseEmojis(bot.client.emojis) as Map<string,TypeEmoji>;
    logger.info('Initializing commands w/ commandsDB.json');
    COMMAND = new LmaoBotControl(bot);
})

bot.client.on('message',(message)=>{
    logger.info('Recieved new message, updating global EMOJIS_MAP.')
    const messageParsed = parseNewMessage(message);
    let newEmojis = messageParsed.newEmojis;
    if(Object.keys(newEmojis).length>0){
        Object.keys(newEmojis).forEach((name)=>{
            if(!EMOJIS_MAP[name]){
                EMOJIS_MAP[name]=newEmojis[name];
            }
        })
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

DiscordBotSocketIo(bot,server);
server.listen(port,'127.0.0.1')
bot.login()

export default bot;