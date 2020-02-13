import React, { Component } from 'react'
import Message from './Message';
import { TypeMessage, TypeEmoji } from '../types/lmaotypes';
import ErrorBoundary from './ErrorBoundary';

type TypeMessageList = {
    messages: Array <TypeMessage>,
    guildName: string,
    channelName:string,
    emojis: Map <string,TypeEmoji>,
}
/**
 * @class Container for all Messages in Channel {channelName}
 */
export default class MessageList extends Component <TypeMessageList> {

    constructor(props:TypeMessageList) {
        super(props)
    }

    render() {
        let {emojis} = this.props;
        return (
            <div className="messagelist-spacing col-md-8">
                <div className="d-inline-flex align-items-end p-2">
                    <h2>{this.props.guildName}</h2>
                    <h4>&nbsp;&nbsp;#{this.props.channelName}</h4>
                </div>
                <div className="table-responsive">
                    <table className="table table-sm">
                        <tbody>
                            {this.props.messages ? 
                            this.props.messages.map((msg, index)=>{
                            return(<ErrorBoundary>
                                        <Message
                                            emojis={emojis}
                                            message={msg}  
                                            key={msg.id+"-"+index}/>
                                   </ErrorBoundary>)}
                            ):<tr/>}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

