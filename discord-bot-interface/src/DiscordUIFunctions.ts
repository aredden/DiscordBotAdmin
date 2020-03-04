import { TypeMessage, TypeGuild, TypeTextChannel, EmojiMap, ChannelMap, MemberMap } from "./types/discord-bot-admin-types";
import moment from "moment";
import { TypeDiscordUI } from "./types/discord-bot-admin-react-types";

/**
 * Function for preparing data pre-render.
 * @param state state of App.
 */
export const handleAppRender = (state:TypeDiscordUI) => {
    
    let {guildList , guildName, channelName } = state;
    let guildID:string, channelID:string, 
        members:MemberMap, channels:ChannelMap,
        messages:Array<TypeMessage>
    if(Object.values(guildList).length > 0){
        channels = (guildList[guildName] as TypeGuild).channels;
        messages = (channels[channelName] as TypeTextChannel).messages;
        if(messages.length>35){
            let start = messages.length-35
            let newMessages:Array<TypeMessage> = [];
            for(start;start<messages.length;start++){
            newMessages.push(messages[start])
            }
            messages = newMessages;
        }
        members = guildList[guildName].users;
        guildID = guildList[guildName].id;
        channelID = guildList[guildName].channels[channelName].id;
    }
    return({guildID, channelID, messages, channels, members})
}


/**
 * Parses individual messages recieved from socket event 'message'.
 * @param message 
 * @param state 
 */
export function onMessageParseMessage(message:string, state:TypeDiscordUI){
    const msg:TypeMessage = JSON.parse(message) as TypeMessage;
    //console.log(msg);
    let { guildList, messageNotifications, emojis, channelName } =  state;
    const tempGuild = guildList[msg.guild] as TypeGuild;
    const channels = tempGuild.channels as ChannelMap;
    let channel = channels[msg.channel] as TypeTextChannel
    channel.messages.push(msg);
    if(channel.name !== channelName){
        messageNotifications[msg.guild+channel.name]+=1
    }
    channel.messages = channel.messages.sort((a,b)=>{
        return moment(a.createdAt).unix() - moment(a.createdAt).unix()
    })
    let emojisFromMsg = msg.newEmojis as EmojiMap
    if(emojisFromMsg){
        Object.keys(emojisFromMsg).forEach((key) => {
            if(!emojis[key]){
                emojis[key]=emojisFromMsg[key];
            }
        });
    }
    return ({emojis:emojis,guildList:guildList})
}

/**
 * Handles batch message processing after socket response event from 'requestMessages'.
 * @param data 
 * @param state 
 */
export const handleBatchMessage = (data:string, state:TypeDiscordUI) => {
    const msgs:TypeMessage[] = JSON.parse(data) as Array<TypeMessage>;

    let { guildList, messageNotifications, channelName } =  state;
    const tempGuild = guildList[msgs[0].guild] as TypeGuild;
    const channels = tempGuild.channels as ChannelMap;
    let channel = channels[msgs[0].channel] as TypeTextChannel
    for(let msg of msgs){     
        channel.messages.push(msg);
        if(channel.name !== channelName){
            messageNotifications[msg.guild+channel.name]+=1
        }
    }
    channel.messages = channel.messages.sort((a,b)=>{
        return moment(a.createdAt).unix() - moment(a.createdAt).unix()
    })
    return(guildList)
}