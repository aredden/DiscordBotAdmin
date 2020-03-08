import React, { Component } from 'react';
import { TypeMessage } from '../types/discord-bot-admin-types';
import { hasContent } from './components-message/content/content';
import  Embed  from './components-message/embed/embed'
import { parseAllowLinks } from './components-message/markdown'
import moment from 'moment';
import Attatchments, { hasAttachment } from './components-message/attatchment/attatchment';
import { TypeMessageClass } from '../types/discord-bot-admin-react-types';
import { parseForNewline } from './components-message/regexfuncs';
import { hasMentions, parseMentions } from './components-message/mentions';

/**
 * @class Message - instance of message for MessageList box.
 * @returns Parsed message.
 */
export default class Message extends Component<TypeMessageClass>{

    constructor(props:TypeMessageClass){
        super(props)
        document.getElementById(`${this.props.message.id}text`)
    }

    render(){
        let { content, createdAt, attachments, embeds } = this.props.message;
        let { message } = this.props;
        
        content = hasMentions(message) ? parseMentions(message) : content;
        message.content = content;
        let contentArray:JSX.Element[], embedArray:JSX.Element[], attachmentArray:JSX.Element[];

        let time = moment(createdAt).format('ddd-MM-YY')
        let today = moment().format('ddd-MM-YY')
        let timeString:string;
        if(time===today){
            timeString = moment(createdAt).format('LT')
        }else{
            timeString = moment(createdAt).format('ddd LT');
        }
         
        contentArray = hasContent(content) ? parseAllowLinks(parseForNewline(content)) : [];
        embedArray = embeds.map(embed => <Embed {...embed}/>);
        attachmentArray = hasAttachment(message)? Attatchments(attachments) : []
        let messageArray = contentArray.concat(embedArray).concat(attachmentArray);
        return Row(message,messageArray,timeString,this.props.handleMessageEditClick)
    }
}

const Row = (message:TypeMessage,arrays:Array<JSX.Element>,time:string,handleMessageEditClick:(e,id)=>any)=>{

    function handleMouseEnter(e:React.MouseEvent<HTMLDivElement, MouseEvent>){
        let time = document.getElementById(`${message.id}time`);
        time.classList.remove('invisible');
    }

    function handleMouseLeave(e:React.MouseEvent<HTMLDivElement, MouseEvent>){
        let time = document.getElementById(`${message.id}time`);
        time.classList.add('invisible');
    }

    let editText:JSX.Element;
    if(message.editedAt){
        editText = 
            <small className="text-muted pl-1" style={{fontSize:'9',fontWeight:'lighter'}}>
                {`edited on ${moment(message.editedAt).format('ddd LT')}`}
            </small>
    }
    return(
            <div className="messagelist-message p-1 btn"
                 style={{textAlign:'start'}}
                 onMouseEnter={e=>handleMouseEnter(e)}
                 onMouseLeave={e=>handleMouseLeave(e)}
                 onClick={e=>handleMessageEditClick(e,message.id)}>
                <div id={message.id+'content'} className="pb-1">
                    {arrays}
                    {editText}
                    <small id={message.id+'time'} 
                           className="text-muted font-weight-light pl-2 invisible">
                        {time}
                    </small>
                </div>
            </div>
    )
}