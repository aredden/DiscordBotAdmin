import React, { Component } from 'react';
import {TypeMessage, TypeEmoji } from '../types/lmaotypes';
import { hasContent } from './components-message/content/content';
import  Embed  from './components-message/embed/embed'
import { parseAllowLinks } from './components-message/embed/markdown'
import moment from 'moment';
import Attatchments, { hasAttachment } from './components-message/attatchment/attatchment';
import {TypeMessageClass} from '../types/lmao-react-types';
export default class Message extends Component<TypeMessageClass>{

    render(){
        const { content, createdAt, attachments, embeds } = this.props.message;
        const { message } = this.props;
        let contentArray:JSX.Element[], embedArray:JSX.Element[], attachmentArray:JSX.Element[];
        let timeString = moment(createdAt).format('LT');
        contentArray = hasContent(content) ? parseAllowLinks(content) : [];
        embedArray = embeds.map(embed => <Embed {...embed}/>);
        attachmentArray = hasAttachment(message)? Attatchments(attachments) : []
        let messageArray = contentArray.concat(embedArray).concat(attachmentArray);
        return Row(message,messageArray,timeString)
    }
}

const Row = (message:TypeMessage,arrays:Array<JSX.Element>,time:string)=>{
    let editText:JSX.Element;
    if(message.editted){
        editText = <small className="text-muted">editted</small>
    }
    return(
        <tr className="shadow-sm rounded d-flex">
            <td className="text-capitalize col-md-1"><small className="text-muted font-weight-light">{time}</small></td>
            <td className="col-md-2" style={{color:message.member.displayHexColor}}>{message.member.displayName}</td>
            <td className="col-md-9" id={message.id}>
                {arrays}{editText?editText:""}
            </td>
        </tr>
    )
}