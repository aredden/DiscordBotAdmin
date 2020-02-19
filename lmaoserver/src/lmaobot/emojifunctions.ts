import { TypeEmoji } from '../types/lmaotypes';
import { Emoji, Collection } from 'discord.js';
import { isNullOrUndefined } from 'util';
import getLogger from '../logger';
import chalk from 'chalk';



const logger = getLogger('EmojiParserFunctions')

/**
 *
 * @param emojiString
 */
function wordContainsEmoji(emojiString:string):boolean{
    const pattern = /:\w*-*\w*:\d{5,}/g;
    const result = emojiString.match(pattern);
    return !isNullOrUndefined(result);
}

/**
 *
 * @param emojiString
 */
function getIdFromEmojiStringAfterConfirmed(emojiString:string){
    const pattern = /\d{5,}/g;
    const result = emojiString.match(pattern);
    return result;
}

/**
 * Requires @wordContainsEmoji for confirmation!!!
 * @param emojiString
 */
function getEmojisAfterConfirmed(emojiString:string,emojiMap:Map<string,TypeEmoji>):TypeEmoji[]{
    const pattern = /:\w*-*\w*:/g;
    let emojiNameArray = emojiString.match(pattern);
    let emojiArray:TypeEmoji[]=[]
    let ids = getIdFromEmojiStringAfterConfirmed(emojiString);
    let urls = getUrlFromIds(ids);
    emojiNameArray.forEach((element,index) => {
        if(!emojiMap[element]){
            let emojiName = element.substring(1,element.length-1);
            let emojiId = ids[index];
            let emojiUrl = urls[index];
            let emoji:TypeEmoji = getTypeEmojiFromParsedEmojiWord(emojiName,emojiId,emojiUrl);
            emojiArray.push(emoji);
        }
    });
    return emojiArray;
}

/**
 *
 * @param name
 * @param id
 * @param url
 */
function getTypeEmojiFromParsedEmojiWord(name:string,id:string,url:string):TypeEmoji{
    const emoji:TypeEmoji = {
        name,
        id,
        url,
        identifier:`${name}:${id}`,
        requiresColons:true
    }
    return emoji;
}

/**
 *
 * @param ids
 */
function getUrlFromIds(ids:string[]):string[]{
    let idArray:string[] = []
    ids.forEach((id,idx)=>{
        idArray.push(`https://cdn.discordapp.com/emojis/${id}`)
    })
    return idArray;
}

/**
 *
 * @param str
 */
function stringSplitter(str:string):string[]{
    let wordArray:string[] = []
    let newlines = str.replace('\n',' \n ')
    newlines = newlines.replace(/<|>/g,' ')
    wordArray = newlines.split(/ +/g)
    return wordArray;
}

/**
 *
 * @param emojiString
 * @param emojis
 */
export function parseEmojisFromString(emojiString:string,
        emojis:Map<string,TypeEmoji>):Map<string,TypeEmoji>{
    const chlk = chalk.red;

    // logger.info(chlk(emojiString));
    let typeEmojiMap:Map<string,TypeEmoji> = new Map<string,TypeEmoji>();
    let wordsBeforeParseEmoji:string[] = stringSplitter(emojiString);
    wordsBeforeParseEmoji.forEach((word) => {
        if(wordContainsEmoji(word)){
            let tempArray = getEmojisAfterConfirmed(word, typeEmojiMap);
            tempArray.forEach((emoji)=>{
                if(!emojis[emoji.name]){
                    // logger.info(JSON.stringify(emoji))
                    // logger.info(chalk.red('PARSING EMPTY EMOJIMAP?')+JSON.stringify(typeEmojiMap,null,2))
                    typeEmojiMap[emoji.name] = emoji;
                }
            })
        }
    });
    return typeEmojiMap;
}

/**
 *
 * @param emojis
 * @param currentEmojis
 */
export function concatEmojiCollections(emojis:emojiColl, currentEmojis:emojiColl):emojiColl{
    emojis.forEach((emoji,key)=>{
        if(!currentEmojis[key]){
            currentEmojis[key]=emoji
        }
    })
    return currentEmojis;
}


type emojiColl = Collection<string,Emoji>
type emojisMap = Map<string,TypeEmoji>

/**
 *
 * @param emojis - Collection of Emojis from discord.js Client
 * @returns emojisMap:Map<string,TypeEmoji>
 */
export function parseEmojisFromCollection(emojis:emojiColl):emojisMap{
    let _emojisMap:Map<string,TypeEmoji>= new Map<string,TypeEmoji>();
    logger.info(JSON.stringify(emojis,null,4))
    emojis.forEach((emoji)=>{
        _emojisMap[emoji.name]=emoji;
    })
    return _emojisMap;
}