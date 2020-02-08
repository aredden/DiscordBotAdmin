import express from 'express';
import { parseGuilds } from '../lmaobot/LmaoBotParsingFunctions';
import { parseEmojis } from '../lmaobot/LmaoBotParsingFunctions';
import getLogger from '../Logger';
import bot from '../index';
const router = express.Router();


const logger = getLogger('routes/index');

router.get("/", (req, res) => {
  res.send({ response: "LmaoServer is running." }).status(200);
});

router.get('/botguilds', (req,res)=>{
  logger.info(`Client from ${req.url} requested 'botguilds'`);
  let data = parseGuilds(bot.client.guilds);
  res.write(JSON.stringify(data));
  res.send();
})

router.get('/emojis', (req,res)=>{
    logger.info(`Client from ${req.originalUrl} requested 'emojis'`);
    let data = parseEmojis(bot.client.emojis);
    res.send();
})

router.get('/status', (req,res) =>{
  logger.info(`Client from ${req.originalUrl} requested 'status'`);
  res.send({status:bot.client.status}).status(200)
})

export default router;