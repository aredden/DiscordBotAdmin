import React, { Component } from 'react';
import {TypeMessage, TypeEmoji} from '../types/lmaotypes';
import { parseEmoji } from './messageparsing/ParseEmoji';


type TypeMessageClass = {
    message:TypeMessage, 
    emojis: Map<string,TypeEmoji>
}

export default class Message extends Component<TypeMessageClass>{
    render(){
        let {
            content,
            createdAt,
            member,
        } = this.props.message;
        const emojis = this.props.emojis;
        const dateString = new Date(createdAt);

        let array = content.split(" ");
        array.forEach((value, idx)=>{
            let word = parseEmoji(value,emojis);
            if(word){
                array[idx] = word;
            }
        })
        let hourNum = dateString.getHours()
        let timeString = hourNum>12 ? (hourNum-12)+`:${dateString.getMinutes()}PM`: hourNum+`:${dateString.getMinutes()}AM`;

        

        return (
            <tr className="shadow-sm rounded d-flex">
                <td className="text-capitalize col-md-1">{timeString}</td>
                <td className="col-md-2" style={{color:member.displayHexColor}}>{member.displayName}</td>
                <td className="col-md-9" id={this.props.message.id}>{
                    array.map((element, index)=>{
                        if(element.indexOf('https://cdn.discordapp.com/emoji') !== -1){
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
