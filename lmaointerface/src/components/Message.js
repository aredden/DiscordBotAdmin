import React, { Component } from 'react'
export default class Message extends Component {

    render(){
        const {
            author,
            content,
            createdAt,
            member,
        } = this.props.message;
        const dateString = Date(createdAt);

        if(content.includes(":")){
            console.log(this.props.emojis)
        }

        return (
            <tr className="shadow-sm">
                <td className="text-capitalize">{dateString.replace("GMT-0500 (Eastern Standard Time)","")}</td>
                <td style={{color:member.displayHexColor}}>{author.name}</td>
                <td>{content}</td>
            </tr>
        )
    }
}
