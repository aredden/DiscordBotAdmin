import React, { Component } from 'react';
import {TypeMessage, TypeEmoji, TypeMessageAttachment} from '../types/lmaotypes';
import { parseEmoji } from './messageparsing/ParseEmoji';
import { parseattachments, hasattachment } from './messageparsing/ParseAttachments';
import { parseEmbeds, hasEmbed } from './messageparsing/ParseEmbeds';
import { parseContent, hasContent } from './messageparsing/ParseContent';
type TypeMessageClass = {
    message:TypeMessage, 
    emojis: Map<string,TypeEmoji>
}

const DISC_EMOJI_CDN_URL='https://cdn.discordapp.com/emoji';

export default class Message extends Component<TypeMessageClass>{
    render(){
        const { content, createdAt, member } = this.props.message;
        const { message, emojis } = this.props;
        const dateString = new Date(createdAt);


        let hourNum = dateString.getHours()
        let timeString = hourNum>12 ? (hourNum-12)+`:${dateString.getMinutes()}PM`: hourNum+`:${dateString.getMinutes()}AM`;


        const contentArray:Array<string> = hasContent(content) ? parseContent(content,emojis) : []
        const embeds:HTMLElement[] = hasEmbed(message) ? parseEmbeds(message.embeds) : undefined;
        const attachments:HTMLElement[] = hasattachment(message) ? parseattachments(message.attachments) : undefined;

        if(contentArray.length===0){
            return<div></div>;
        }
        return (
            <tr className="shadow-sm rounded d-flex">
                <td className="text-capitalize col-md-1">{timeString}</td>
                <td className="col-md-2" style={{color:member.displayHexColor}}>{member.displayName}</td>
                <td className="col-md-9" id={this.props.message.id}>{
                    contentArray.map((element, index)=>{
                        if(element.indexOf(DISC_EMOJI_CDN_URL) !== -1){
                            return(<img src={element} alt={element} key={index} style={{height:"1.7rem"}}/>)
                        }else if(element===" "){
                        }else{
                            return element+" ";
                        }
                    })
                }</td>
            </tr>
        )
    }
}
