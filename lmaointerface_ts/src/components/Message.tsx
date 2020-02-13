import React, { Component  } from 'react';
import {TypeMessage, TypeEmoji } from '../types/lmaotypes';
import { parseContent, hasContent, wordContainsEmoji, getEmojiNameFromIdentifier } from './messagecomponents/utilfunctions/ParseContent';
import  Embed  from './messagecomponents/Embed'
type TypeMessageClass = {
    message:TypeMessage
    emojis:Map<string,TypeEmoji>
}

export default class Message extends Component<TypeMessageClass>{

    render(){
        const { content, createdAt, member, embeds } = this.props.message;
        const { message, emojis } = this.props;
        const dateString = new Date(createdAt);

        let hourNum = dateString.getHours()
        let timeString = hourNum>12 ? (hourNum-12)+`:${dateString.getMinutes()}PM`: hourNum+`:${dateString.getMinutes()}AM`;

        const contentArray:Array<string> = hasContent(content) ? parseContent(content,emojis) : []

        if(contentArray.length===0){
            return<tr></tr>;
        }
        if(embeds.length>0 && embeds[0].type==='rich'){
            return(
                <tr className="shadow-sm rounded d-flex">
                    <td className="text-capitalize col-md-1">{timeString}</td>
                    <td className="col-md-2" style={{color:member.displayHexColor}}>{member.displayName}</td>
                    <td className="col-md-9" id={message.id}>{
                            embeds.length>0 ? (
                                embeds.map(value=>{
                                    return <Embed emojiMap={emojis} key={`${message.id}-${Date.now()}`} embed={value}></Embed>
                                })
                            ):""
                        }
                    </td>
                </tr>
            )
        }
        return (
            <tr className="shadow-sm rounded d-flex">
                <td className="text-capitalize col-md-1">{timeString}</td>
                <td className="col-md-2" style={{color:member.displayHexColor}}>{member.displayName}</td>
                <td className="col-md-9" id={message.id}>
                    {
                        contentArray.map((element, index)=>{
                            let el = element.toString();
                            if(wordContainsEmoji(el)){
                                let emojiName = getEmojiNameFromIdentifier(el);
                                let emoji = emojis[emojiName];
                                return(<img src={emoji.url} alt={emoji.name} key={message.id + Date.now()} style={{height:"1.7rem"}}/>)
                            }else if(el===""){
                                return ""
                            }else{
                                return el+" "
                            }
                        })
                    }
                </td>
            </tr>
        )
    }
}
