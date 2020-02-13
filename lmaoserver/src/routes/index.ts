import express from 'express';
import { parseGuilds } from '../lmaobot/LmaoBotTypeParsingFunctions';
import getLogger from '../Logger';
import bot, { getEmojiMap} from '../index';
import chalk from 'chalk';

const router = express.Router();

const logger = getLogger('routes/index');

router.get('/', (req, res) => {
  res.send({ response: 'LmaoServer is running.' }).status(200);
});

router.get('/botguilds', (req,res)=>{
  logger.info(`Client from ${req.headers.referer} requested route '/botguilds'`);
  let data = parseGuilds(bot.client.guilds);
  res.json(data);
})

router.get('/emojis', (req,res)=>{
    logger.info(`Client from ${req.headers.referer} requested route '/emojis'`);
    let data = getEmojiMap();
    logger.info(chalk.yellow('UNMODIFIED EMOJI MAP?')+JSON.stringify(data,null,1))
    res.json(data)
})

router.get('/status', (req,res) =>{
  logger.info(`Client from ${req.headers.referer} requested route '/status'`);
  res.send({status:bot.client.status}).status(200)
})

export default router;