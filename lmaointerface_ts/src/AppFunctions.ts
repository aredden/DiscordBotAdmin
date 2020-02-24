import { TypeMessage, TypeGuild, TypeTextChannel, EmojiMap, ChannelMap } from "./types/lmaotypes";

type AppType = {
    isReady:boolean,
    error:string,
    guildList:Map<string,TypeGuild>,
    channelName:string,
    guildName:string,
    endpoint:string,
    emojis:EmojiMap,
    messageNotifications:Map<string,number>
}

export function onMessageParseMessage(message:string, state:AppType){
    const msg:TypeMessage = JSON.parse(message) as TypeMessage;
    console.log(msg);
    let { guildList, messageNotifications, emojis, channelName } =  state;
    const tempGuild = guildList[msg.guild] as TypeGuild;
    const channels = tempGuild.channels as ChannelMap;
    let channel = channels[msg.channel] as TypeTextChannel
    channel.messages.push(msg);
    if(channel.name !== channelName){
        messageNotifications[msg.guild+channel.name]+=1
    }
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