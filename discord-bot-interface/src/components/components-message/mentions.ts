import { TypeMessage, TypeGuildMember } from "../../types/discord-bot-admin-types";

export function hasMentions(msg:TypeMessage):boolean{
    return msg.mentions ? msg.mentions.length>0 : false
}

export function parseMentions(msg:TypeMessage):string{
    let content = msg.content;
    if(msg.mentions.length>0){
        msg.mentions.forEach((member:TypeGuildMember)=>{
            const id = member.user.id
            let reg = RegExp("<@!*"+id+">","gm")
            content = content.replace(reg,`**@${member.displayName}**`)
    })}
    return content;
}