import React, { Component } from 'react';
import { TypeMessage } from '../types/lmaotypes';
import { hasContent } from './components-message/content/content';
import  Embed  from './components-message/embed/embed'
import { parseAllowLinks } from './components-message/markdown'
import moment from 'moment';
import Attatchments, { hasAttachment } from './components-message/attatchment/attatchment';
import { TypeMessageClass } from '../types/lmao-react-types';
import { parseForNewline } from './components-message/regexfuncs';
import { hasMentions, parseMentions } from './components-message/mentions';

/**
 * @class Message - instance of message for MessageList box.
 * @returns Parsed message.
 */
export default class Message extends Component<TypeMessageClass>{

    render(){
        let { content, createdAt, attachments, embeds } = this.props.message;
        let { message } = this.props;
        
        content = hasMentions(message) ? parseMentions(message) : content;
        message.content = content;
        let contentArray:JSX.Element[], embedArray:JSX.Element[], attachmentArray:JSX.Element[];
        let timeString = moment(createdAt).format('LT');
        contentArray = hasContent(content) ? parseAllowLinks(parseForNewline(content)) : [];
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