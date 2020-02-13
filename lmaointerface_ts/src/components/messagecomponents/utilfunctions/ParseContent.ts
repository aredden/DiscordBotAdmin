import { TypeEmoji } from "../../../types/lmaotypes";

import { isNullOrUndefined } from "util";

function _stringSplitter(str:string):Array<string>{
    let wordArray:Array<string> = []
    let newlines = str.replace("\n"," __NEWLINE__ ")
    newlines = newlines.replace(/<|>/g," ")
    wordArray = newlines.split(/ +/g)
    return wordArray;
}

export function getUrlFromId(ids:string):string{
        return `https://cdn.discordapp.com/emojis/${ids}`;
}


export function getEmojiNameFromIdentifier(identifier:string){
    const pattern = /:\w*-*\w*:/g;
    let emojiNameArray = identifier.match(pattern);
    let name = emojiNameArray[0]
    name = name.substring(1,name.length-1);
    return name;
}

export function getIdFromEmojiStringAfterConfirmed(emojiString:string){
    const pattern = /\d{5,}/g;
    const result = emojiString.match(pattern);
    return result[0];
}

export function wordContainsEmoji(emojiString:string):boolean{
    const pattern = /:\w*-*\w*:\d{5,}/g;
    const result = emojiString.match(pattern);
    return !isNullOrUndefined(result);
}

export function hasContent(content:string):boolean{
    return content ? content.length>0 : false;
}

export function parseContent(content:string,emojiMap:Map<string,TypeEmoji>):Array<string>{
    let wordArray:Array<string> = _stringSplitter(content);
    wordArray.forEach((value, idx)=>{
        let word = value;
        if(word){
                wordArray[idx] = word;
            }
        }
    )
    return wordArray.filter((word)=>word);
}