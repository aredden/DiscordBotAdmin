import express from 'express';
import getLogger from '../logger';
import bot, { getEmojiMap, getChannelNotification, getFocusKey, getCommands, getGuildData} from '../index';
import _chalk from 'chalk';

const router = express.Router();

const logger = getLogger('routes/index');

router.get('/', (_req, res) => {
  res.send({ response: 'LmaoServer is running.' }).status(200);
});

router.get('/botguilds', async (req,res)=>{
  const guildData = await getGuildData();
  let data = {
    guilds: guildData,
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

router.get('/status', (req,res) => {
  logger.info(`Client from ${req.headers.referer} requested route '/status'`);
  res.send({status:bot.client.toJSON()}).status(200)
})

router.get('/botcommands', (_req,res) => {
  res.json(getCommands())
})

export default router;