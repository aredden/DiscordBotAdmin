import { TypeUser, TypeMessage, TypeRole, TypeGuildMember } from "../types/discord-admin-types"

export const buildDeadPerson = (user:TypeUser,msg:TypeMessage,guildName:string) =>{
    return({nickname:msg.author.name,
    id:msg.author.id,
    displayName:msg.author.name,
    displayHexColor:"#01010",
    highestRole:{
        name:"NONE",
        color:"red",
        id:"010101010",
        position:10,
        hexColor:"#01010",
        permissions:0,
        mentionable:false
    },
    user:msg.author,
    roles:new Map<string,TypeRole>(),
    presence:{
        status:"offline",
        game:undefined,
        clientStatus:undefined
    },
    guildName:guildName
} as TypeGuildMember)
}