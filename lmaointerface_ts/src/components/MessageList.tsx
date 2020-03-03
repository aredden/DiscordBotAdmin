import React, { Component } from 'react'
import Message from './Message';
import ErrorBoundary from './ErrorBoundary';
import moment from 'moment';
import InputBox from './InputBox';
import { TypeMessageList } from '../types/lmao-react-types';

export const RequestMessageButton = ({requestMessages,channelID,guildID,messages}) => {
    return (
        <button 
        tabIndex={-1}
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
    )
}

type TypingData = {
    user:string,
    id:string,
    discriminator:string
}

/**
 * @class Container for all Messages in Channel {channelName}
 */
export default class MessageList extends Component <TypeMessageList,{typing:Array<string>}> {
    
    constructor(props:TypeMessageList) {
        super(props)
        this.state = {
            typing:new Array<string>()
        }
    }

    componentDidUpdate(prevProps:TypeMessageList){
        if(prevProps.channelID!==this.props.channelID){
            this.setState({typing:new Array<string>()})
        }
    }

    componentDidMount(){
        if (!this.props.socket.hasListeners("typingStart")){
            this.props.socket.on("typingStart",(data:string)=>{this.setState({typing:this.handleTypingStart(data)})})
            this.props.socket.on("typingStop",(data:string) =>{this.setState({typing:this.handleTypingStop(data)})})
        }
    }

    componentWillUnmount(){
        if (this.props.socket.hasListeners("typingStart")){
            this.props.socket.removeEventListener("typingStart");
            this.props.socket.removeEventListener("typingStop");
        }
    }

    handleTypingStart = (data:string) => {
        let {typing} = this.state;
        let typingdata = JSON.parse(data) as TypingData;
        console.log("Started typing for: "+typingdata.user)
        if(typing.indexOf(typingdata.user)===-1) {typing.push(typingdata.user);}
        return typing;
    }
    
    handleTypingStop = (data:string) => {
        let {typing} = this.state;
        let typingdata = JSON.parse(data) as TypingData;
        console.log("Stopped typing for: "+typingdata.user)
        let returnValue = typing.filter((name:string)=>name!==typingdata.user);
        console.log("List currently: "+returnValue)
        return typing.length===1? new Array<string>() : typing.filter((name:string)=>name!==typingdata.user);
    }


    render() {
        let {messages, emojis, guildID, channelID, sendFunction, requestMessages, guildName, channelName} = this.props;
        let {typing} = this.state;
        return (
            <div className="messagelist-spacing col-md-8">
                <div className="p-2 d-flex align-items-end">
                    <h2 className="d-inline-flex justify-content-start align-items-end ml-5">{guildName}</h2>
                    <h4 className="d-inline-flex justify-content-start align-items-end mr-3">&nbsp;&nbsp;#{channelName}</h4>
                    <RequestMessageButton {...{requestMessages,channelID,guildID,messages}}/>
                </div>
                <div id="message-table" className="table-responsive messagelist-table overflow-auto">
                    <table className="table table-sm">
                        <tbody>
                            {messages ? 
                                messages
                                .sort((a,b)=>(moment(a.createdAt).unix()-moment(b.createdAt).unix()))
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
                <InputBox socket={this.props.socket} sendFunction={sendFunction} guildID={guildID} channelID={channelID} emojis={emojis}/>
                <small className="text-muted">
                    {typing.length>0?typing.join(", ")+" is/are typing.":""}
                </small>
            </div>
        )
    }
}
