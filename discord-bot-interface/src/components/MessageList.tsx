import React, { Component, useState, useEffect } from 'react'
import InputBox from './InputBox';
import { TypeMessageList } from '../types/discord-bot-admin-react-types';
import MessageGroups from './MessageGroups';
import { TypeMessage } from '../types/discord-bot-admin-types';
import $ from 'jquery';

export const RequestMessageButton = ({requestMessages,channelID,guildID,messages}) => {
    return (
        <button 
        tabIndex={-1}
        className="ml-3 btn btn-sm btn-outline-primary"
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

type TypeMessageListState = {
    typing:Array<string>,
    messageEditModalMessage:TypeMessage
}

/**
 * @class Container for all Messages in Channel {channelName}
 */
export default class MessageList extends Component <TypeMessageList,TypeMessageListState> {
    
    constructor(props:TypeMessageList) {
        super(props)
        this.state = {
            typing:new Array<string>(),
            messageEditModalMessage:undefined
        }
        this.handleMessageEditClick = this.handleMessageEditClick.bind(this);
        this.handleEditCancel = this.handleEditCancel.bind(this);
        this.handleEditConfirm = this.handleEditConfirm.bind(this);
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

    handleMessageEditClick = (_e,id:string) => {
        let {messages} = this.props;
        let messageToEdit:TypeMessage = undefined;
        messages.forEach((message)=>{
            if(message.id===id){
                messageToEdit=message;
            }
        })
        this.setState({messageEditModalMessage:messageToEdit},()=>{
            $('#messageEditModal').modal('show');
        })
    }

    handleTypingStart = (data:string) => {
        let {typing} = this.state;
        let typingdata = JSON.parse(data) as TypingData;
        if(typing.indexOf(typingdata.user)===-1) {typing.push(typingdata.user);}
        return typing;
    }
    
    handleTypingStop = (data:string) => {
        let {typing} = this.state;
        let typingdata = JSON.parse(data) as TypingData;
        return typing.length===1? new Array<string>() : 
               typing.filter((name:string)=>name!==typingdata.user);
    }

    handleEditCancel = (e:React.MouseEvent<HTMLButtonElement,MouseEvent>) => {
        this.setState({messageEditModalMessage:undefined})
    }

    handleEditConfirm = (e:React.MouseEvent<HTMLButtonElement,MouseEvent>,content:string) => {
        let { messageEditModalMessage } = this.state;
        let { socket, guildID, channelID } = this.props;
        
        let requestParams = {
            guildID:guildID,
            channelID:channelID,
            messageID:messageEditModalMessage.id,
            content:content
        }
        socket.emit('messageEditRequest',JSON.stringify(requestParams))
        this.setState({messageEditModalMessage:undefined})
    }


    render() {
        let {messages, emojis, guildID, channelID, sendFunction, 
             requestMessages, guildName, channelName} = this.props;
        let { typing, messageEditModalMessage } = this.state;
        let handleMessageEditClick = this.handleMessageEditClick;
        return (
            <div className="messagelist-spacing flex-column col-md-8" style={messageListStyles}>
                {messageEditModalMessage && 
                    <MessageEditModal message={messageEditModalMessage} 
                                      handleMessageEditCancel={this.handleEditCancel}
                                      handleMessageEditConfirm={this.handleEditConfirm}/>
                }
                <div className="p-3 d-flex align-items-end">
                    <h2 className="ml-3">{guildName}</h2>
                    <h4 className="ml-3">#{channelName}</h4>
                    <div className="ml-auto mr-3">
                        <RequestMessageButton {...{requestMessages,channelID,guildID,messages}}/>
                    </div>
                </div>
                <div id="message-table" 
                     className="table-responsive messagelist-table overflow-auto" 
                    style={{ scrollbarColor:'#0f0f0f'}}>
                    <table className="table table-sm">
                        <MessageGroups {...{guildName,emojis,messages,handleMessageEditClick}}/>
                    </table>
                </div>
                <InputBox socket={this.props.socket} 
                          sendFunction={sendFunction} 
                          guildID={guildID} 
                          channelID={channelID} 
                          emojis={emojis}/>
                <small className="text-muted">
                    {typing.length>0?typing.join(", ")+" is/are typing.":""}
                </small>
            </div>
        )
    }
}

const messageListStyles = {
    msScrollbarBaseColor:"#F0F0F0", 
    backgroundColor:'#F0F0F0',
    paddingLeft:'2rem',
    paddingRight:'1rem'
}

type TypeMessageEditModal = {
    message:TypeMessage,
    handleMessageEditConfirm:(e:React.MouseEvent<HTMLButtonElement,MouseEvent>,content:string)=>any,
    handleMessageEditCancel:(e:React.MouseEvent<HTMLButtonElement,MouseEvent>)=>any
}

const MessageEditModal = ({message, handleMessageEditConfirm, handleMessageEditCancel}:TypeMessageEditModal) => {
    const [messageText, setMessageText] = useState(null);
    
    useEffect(() => {
        setMessageText(message && message.content);
    },[message])


    return(
        <div className="modal fade" id="messageEditModal" tabIndex={-1} role="dialog" 
             aria-labelledby="messageEditModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title" id="messageEditModalLabel">Edit message</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div className="modal-body">
                <form>
                <div className="form-group">
                    <label  className="col-form-label">Message:</label>
                    <textarea className="form-control" 
                              id="message-edit-text" 
                              onChange={e=>{setMessageText(e.target.value)}}>
                                  {messageText?messageText:message.content}
                    </textarea>
                </div>
                </form>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal"
                        onClick={e=>{handleMessageEditCancel(e)}}>
                    Close
                </button>
                <button type="button" className="btn btn-primary" data-dismiss="modal"
                            onClick={e=>{handleMessageEditConfirm(e,messageText)}}>
                            Send message
                </button>
            </div>
            </div>
        </div>
        </div>
    )
}