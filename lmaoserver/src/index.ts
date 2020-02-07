import express from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';
import http from 'http';
import router from './routes/index';
import DiscordBotSocketIo from './socket/DiscordBotSocket';
import { LmaoBot } from './lmaobot/LmaoBot';
import winston from 'winston';
import { parseGuilds } from './lmaobot/LmaoBotParsingFunctions';
const app = express();
const port = 3001
const server = http.createServer(app);
const bot:LmaoBot = new LmaoBot();

const logger = winston.createLogger({
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'log' }),
	],
	format: winston.format.printf(log => `[Index - ${log.level.toUpperCase()}] - ${log.message}`),
});

app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}));

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use(router)

app.get('/botguilds', (req,res)=>{
  logger.info(`Client from ${req.url} requested 'botguilds'`);
  let data = parseGuilds(bot.client.guilds);
  logger.info(data.toString())
  res.write(JSON.stringify(data));
  res.send();
})

app.get('/emojis', (req,res)=>{

})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/status', (req,res) =>{
    logger.info(`Client from ${req.url} requested 'status'`);
    res.send({status:bot.client.status}).status(200)
})

DiscordBotSocketIo(bot,server);
server.listen(port,"127.0.0.1")
bot.login()