import { TypeEmoji } from "../../types/lmaotypes";


export function parseEmoji(emojiString:string,emojis:Map<string,TypeEmoji>){
    const pattern = /:\w*:/g;
    const result = emojiString.match(pattern);
    let resultString:string;
    let emojiUrl:string;
    if(result && result.length===1){
        resultString = result[0].substring(1,result[0].length-1)
        if( Object.keys(emojis).includes(resultString)){
            emojiUrl = emojis[resultString]
            return(emojiUrl);
        } else {
            const numPattern = /:[0-9]*>/g;
            const numResult =  emojiString.match(numPattern);
            if(numResult && numResult.length===1){
                const numResultString:string = numResult[0];
                return `https://cdn.discordapp.com/emojis/${numResultString.substring(1,numResultString.length-1)}`
            }else{
                console.log(`Could not parse emoji ${resultString}`)
            }
        }
    }
}