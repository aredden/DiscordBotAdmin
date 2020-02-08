import express from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';
import http from 'http';
import router from './routes/index';
import DiscordBotSocketIo from './socket/DiscordBotSocket';
import { LmaoBot } from './lmaobot/LmaoBot';
import getLogger from './Logger';

const app = express();
const port = 3001
const server = http.createServer(app);
const bot:LmaoBot = new LmaoBot();

const logger = getLogger("index");

app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}));

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use(router)

DiscordBotSocketIo(bot,server);
server.listen(port,"127.0.0.1")
bot.login()

export default bot;