import React, { Component } from 'react'
import Message from './Message';
import ErrorBoundary from './ErrorBoundary';
import moment from 'moment';
import InputBox from './InputBox';
import { TypeMessageList } from '../types/lmao-react-types';


/**
 * @class Container for all Messages in Channel {channelName}
 */
export default class MessageList extends Component <TypeMessageList> {
    render() {
        let {messages, emojis, guildID, channelID, sendFunction, requestMessages, guildName, channelName} = this.props;

        return (
            <div className="messagelist-spacing col-md-8">
                <div className="p-2 d-flex align-items-end">
                    <h2 className="d-inline-flex justify-content-start align-items-end ml-5">{guildName}</h2>
                    <h4 className="d-inline-flex justify-content-start align-items-end mr-3">&nbsp;&nbsp;#{channelName}</h4>
                    <button 
                        className="ml-3 d-flex justify-content-end align-items-start btn btn-sm btn-outline-primary"
                        style={{marginBottom:".4rem"}}
                        onClick={(e)=>
                            requestMessages(
                            e,
                            channelID,
                            guildID,
                            messages[0] ? messages[0].id:undefined
                        )}>
                        Update
                    </button>
                </div>
                <div id="message-table" className="table-responsive messagelist-table overflow-auto">
                    <table className="table table-sm">
                        <tbody>
                            {messages ? 
                                messages
                                .map((msg, idx) => {
                                    return (
                                        <ErrorBoundary key={`errorboundary-${idx}`}>
                                            <Message emojis={emojis} message={msg} key={msg.id + "-" + moment().unix()}/>
                                        </ErrorBoundary>
                                    )
                                })
                                : <tr/>}
                        </tbody>
                    </table>
                </div>
                <InputBox sendFunction={sendFunction} guildID={guildID} channelID={channelID} emojis={emojis}/>
            </div>
        )
    }
}
