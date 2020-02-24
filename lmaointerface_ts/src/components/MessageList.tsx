import React, { Component } from 'react'
import Message from './Message';
import ErrorBoundary from './ErrorBoundary';
import moment from 'moment';
import InputBox from './InputBox';
import { TypeMessageList } from '../types/lmao-react-types';


/**
 * @class Container for all Messages in Channel {channelName}
 */
export default class MessageList extends Component < TypeMessageList > {
    render() {
        let {emojis, guildID, channelID, sendFunction, guildName, channelName} = this.props;

        return (
            <div className="messagelist-spacing col-md-8">
                <div className="d-inline-flex align-items-end p-2">
                    <h2>{guildName}</h2>
                    <h4>&nbsp;&nbsp;#{channelName}</h4>
                </div>
                <div id="message-table" className="table-responsive messagelist-table overflow-auto">
                    <table className="table table-sm">
                        <tbody>
                            {this.props.messages
                                ? this
                                    .props
                                    .messages
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
