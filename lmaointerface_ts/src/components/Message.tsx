import React, { Component } from 'react';
import {TypeMessage, TypeEmoji} from '../types/lmaotypes';


export default class Message extends Component<{
    message:TypeMessage, emojis: Map<string,TypeEmoji>}>{
    render(){
        let {
            content,
            createdAt,
            member,
        } = this.props.message;
        const emojis = this.props.emojis;
        const dateString = new Date(createdAt);
        var contentArray= [content];
        if(content.indexOf(":")!==-1){
            let foundEmoji = false;
            Object.values(emojis).forEach((emoji) => {
                if(content.indexOf("<:"+emoji.identifier+">")!==-1){
                    if(!foundEmoji){
                        contentArray = [];
                        foundEmoji=true;
                    }
                    content = content.replace("<:"+emoji.identifier+">",`&&splithere&&url=${emoji.url}&&splithere&&`);
                    content = content.substring(content.indexOf("<:"+emoji.identifier+">"),content.length)
                    content = content.replace("<:"+emoji.identifier+">","");
                    contentArray = content.split("&&splithere&&");
                    contentArray = contentArray.filter((value)=>{
                        return value!==""
                    })
                }
            });
        }
        let hourNum = dateString.getHours()
        let timeString = hourNum>12 ? (hourNum-12)+`:${dateString.getMinutes()}PM`: hourNum+`:${dateString.getMinutes()}AM`;

        return (
            <tr className="shadow-sm d-flex">
                <td className="text-capitalize col-md-1">{timeString}</td>
                <td className="col-md-2"style={{color:member.displayHexColor}}>{member.displayName}</td>
                <td className="col-md-9" id={this.props.message.id}>{
                    contentArray.map((element, index)=>{
                        if(element.indexOf('url=') !== -1){
                            element = element.replace("url=","");
                            return(<img src={element} alt={element} key={index} style={{height:"1.7rem"}}/>)
                        }else{
                            return element;
                        }
                    })
                }</td>
            </tr>
        )
    }
}
