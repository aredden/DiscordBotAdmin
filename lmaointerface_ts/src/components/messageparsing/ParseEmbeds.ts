import { TypeEmbed, TypeMessage } from "../../types/lmaotypes";

export function parseEmbeds(embeds:TypeEmbed[]):HTMLElement[]{
    let embedArray:Array<HTMLElement> = [];
    embeds.forEach((embed,idx,embedarr)=>{
        switch (embed.type) {
            case 'rich':
                console.log("was rich")
                break;
        
            default:
                break;
        }
    })
    return;
}

export function hasEmbed(message: TypeMessage){
    if(message.embeds.length>0){
        return true;
    }
    return false;
}