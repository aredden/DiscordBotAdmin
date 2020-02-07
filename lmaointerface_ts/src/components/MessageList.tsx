import React, {Component} from 'react'
import Message from './Message';
import { TypeMessage, TypeEmoji } from '../types/lmaotypes';

type TypeMessageList = {
    messages: Array<TypeMessage>,
    guildName: string,
    channelName:string,
    emojis: Map<string,TypeEmoji>
}

export default class MessageList extends Component<TypeMessageList, {}> {
    render() {
        return (
            <div className="messagelist-spacing col-md-8">
                <div className="d-inline-flex align-items-end p-2">
                    <h2>{this.props.guildName}</h2>
                    <h4>&nbsp;&nbsp;#{this.props.channelName}</h4>
                </div>
                <div className="table-responsive">
                    <table className="table table-sm">
                        <tbody>
                            {
                            this.props.messages ? 
                            this.props.messages.map((msg, index) => 
                                <Message message={msg} emojis={this.props.emojis} key={msg.id}/>)
                            :""
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}
