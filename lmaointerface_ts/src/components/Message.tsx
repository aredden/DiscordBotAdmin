import React, { Component } from 'react';
import {TypeMessage, TypeEmoji } from '../types/lmaotypes';
import { parseContent, hasContent } from './components-message/content/content';
import  Embed  from './components-message/embed/embed'
import { parse } from './components-message/embed/markdown'
import moment, { Moment } from 'moment';
import Attatchments, { hasAttachment } from './components-message/attatchment/attatchment';
type TypeMessageClass = {
    message:TypeMessage
    emojis:Map<string,TypeEmoji>
}

export default class Message extends Component<TypeMessageClass>{

    render(){
        const { content, createdAt, member, embeds } = this.props.message;
        const { message } = this.props;

        let timeString = moment(createdAt).format('LT');
        const contentArray:Array<JSX.Element> = hasContent(content) ? parse(content) : [];
        const embedArray:Array<JSX.Element> = message.embeds.map(embed=> <Embed {...embed}/>);
        const attachmentArray = hasAttachment(message)? Attatchments(message.attachments) : []
        let messageArray = contentArray.concat(embedArray);
        messageArray = messageArray.concat(attachmentArray);
        return Row(message,messageArray,timeString)
    }
}

const Row = (message:TypeMessage,arrays:Array<JSX.Element>,time:string)=>{
    return(
        <tr className="shadow-sm rounded d-flex">
            <td className="text-capitalize col-md-1"><small className="text-muted font-weight-light">{time}</small></td>
            <td className="col-md-2" style={{color:message.member.displayHexColor}}>{message.member.displayName}</td>
            <td className="col-md-9" id={message.id}>
                {arrays}
            </td>
        </tr>
    )
}