import { Message, MessageAttachment, MessageEmbed, TextChannel, Guild, Channel, ChannelLogsQueryOptions, User } from "discord.js";
import { Socket } from "socket.io";
import { parseMessage, parseNewMessage, parseMessages } from "../lmaobot/typeparserfunctions";
import { TypeMessageData, TypeMessage } from "../types/lmaotypes";
import { LmaoBot } from "../lmaobot/lmaobot";
import  getLogger  from "../logger";
import { updateChannelNotifications, getFocusKey } from "../index";
import bot from '../index';

const logger = getLogger("socketfunctions")

export function handleMessageUpdate(oldMsg:Message,newMsg:Message,socket:Socket,startDate:number){
    const {createdAt} = oldMsg;
    const time = createdAt.valueOf();
    if(time>startDate){

        const messageUpdateData={
            old:parseMessage(oldMsg),
            new:parseNewMessage(newMsg)
        }
        socket.emit("messageUpdate",JSON.stringify(messageUpdateData))
    }
}

export function handleSendMessage(
    messageData:TypeMessageData,
    lmaobot:LmaoBot,
    _attatchments?:MessageAttachment[],
    _embeds?:MessageEmbed[]){
    const guild = lmaobot.client.guilds.get(messageData.guild)
    if(!guild){
        logger.error(`guild w/ id: ${messageData.guild} does not exist!`)
        return;
    }
    const channel = guild.channels.get(messageData.channel) as TextChannel;
    if(!channel){
        logger.error(`guild w/ id: ${messageData.channel} does not exist!`)
        return;
    }
    logger.info(`Sending message to ${channel.name} in ${channel.guild.name} content:\n${messageData.content}`)
    channel.send(messageData.content)
        .then(
            _success=>{
            logger.info(`Successfully sent message to ${channel.name}!`)},
            _fail=>{
            logger.error(`Failed to send message to ${channel.name}!`)
            }
        );
}

export function handleNotificationsUpdate(key:string){
    updateChannelNotifications(key,undefined,true);
}

export function handleMessagesRequest(guildID:string,channelID:string,lastMessage:string,sock:Socket){
    let queryOpts:ChannelLogsQueryOptions = {
        before:lastMessage?lastMessage:undefined,
        limit:30
    };

    ((bot.client.guilds.get(guildID) as Guild)
        .channels.get(channelID) as TextChannel)
        .fetchMessages(queryOpts)
        .then((messages)=>{
            return parseMessages(messages)
        },(_fail)=>{
            logger.error(`Failed to update messages: ${_fail}`)
        })
        .then((parsedMessages:TypeMessage[])=>{
            sock.emit("batchMessages",JSON.stringify(parsedMessages))
        })
}

export function handleTypingStart(channel:Channel, user:User, socket:Socket){
    if(channel.type ==="text"){
        let txtChannel = channel as TextChannel
        if(getFocusKey()===txtChannel.guild.name+txtChannel.name){
            socket.emit("typingStart",
                JSON.stringify(
                    {
                        user:user.username,
                        id:user.id,
                        discriminator:user.discriminator
                    }
                )
            )
        }
    }
}

export function handleTypingStop(channel:Channel, user:User, socket:Socket){
    if(channel.type ==="text"){
        let txtChannel = channel as TextChannel
        if(getFocusKey()===txtChannel.guild.name+txtChannel.name){
            socket.emit("typingStop",
                JSON.stringify(
                    {
                        user:user.username,
                        id:user.id,
                        discriminator:user.discriminator
                    }
                )
            )
        }
    }
}