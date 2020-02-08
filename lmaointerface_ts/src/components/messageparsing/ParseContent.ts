import { parseEmoji } from "./ParseEmoji";
import { TypeEmoji } from "../../types/lmaotypes";

export function hasContent(content:string):boolean{
    return content ? content.length>0 : false;
}

export function parseContent(content:string,emojis:Map<string,TypeEmoji>):Array<string>{
    let wordArray:Array<string> = content.split(" ");
    wordArray.forEach((value, idx)=>{
        let word = parseEmoji(value,emojis);
        if(word){
            wordArray[idx] = word;
        }
    })
    return wordArray;
}