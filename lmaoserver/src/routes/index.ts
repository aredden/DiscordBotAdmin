import express from 'express';
import { parseGuilds } from '../lmaobot/typeparserfunctions';
import getLogger from '../logger';
import bot, { getEmojiMap, getChannelNotification, getFocusKey} from '../index';
import _chalk from 'chalk';

const router = express.Router();

const logger = getLogger('routes/index');

router.get('/', (_req, res) => {
  res.send({ response: 'LmaoServer is running.' }).status(200);
});

router.get('/botguilds', (req,res)=>{
  logger.info(`Client from ${req.headers.referer} requested route '/botguilds'`);
  let data = {
    guilds:parseGuilds(bot.client.guilds),
    focusKey:getFocusKey(),
    notifications:getChannelNotification()
  }
  res.json(JSON.stringify(data));
})

router.get('/emojis', (req,res)=>{
    logger.info(`Client from ${req.headers.referer} requested route '/emojis'`);
    let data = getEmojiMap();
    res.json(data)
})

router.get('/status', (req,res) =>{
  logger.info(`Client from ${req.headers.referer} requested route '/status'`);
  res.send({status:bot.client.status}).status(200)
})

export default router;