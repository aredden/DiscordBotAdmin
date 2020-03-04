import React, {Component} from 'react';
import './css/App.css';
import 'jquery';
import 'popper.js';
import 'bootstrap';
import Nav from './components/Nav';
import MessageList from './components/MessageList';
import SideBar from './components/Sidebar';
import socketIOClient from 'socket.io-client';
import axios from 'axios';
import { TypeGuild, TypeEmoji, TypeMessage, 
         TypeTextChannel, TypeMessageUpdateData, 
         GuildMap, TypeGuildMember } from './types/discord-bot-admin-types';
import { onMessageParseMessage, handleBatchMessage, 
         handleAppRender } from './DiscordUIFunctions';
import { TypeDiscordUI } from './types/discord-bot-admin-react-types';
import UserBar from './components/UserBar';
import { BrowserRouter as Router, Route,
         Switch } from 'react-router-dom'
import Commands from './components/Commands';


export default class DiscordUI extends Component<{},TypeDiscordUI> {
  private socket:SocketIOClient.Socket;
  constructor(props:Object) {
        super(props);
        const endpoint = 'http://localhost:3001/';
        this.state = {
            isReady: false,
            error: undefined,
            guildList:new Map<string,TypeGuild>(),
            channelName:"",
            guildName:"",
            endpoint:endpoint,
            emojis:new Map<string,TypeEmoji>(),
            messageNotifications:new Map<string,number>(),
            requestedMessages:false
        }
        this.onUpdateNotifications = 
            this.onUpdateNotifications.bind(this);
        this.socket = socketIOClient(endpoint,{
            reconnectionDelay:2000,
            reconnectionAttempts:10
        });
        this.onEmojis = this.onEmojis.bind(this);
        this.onReady = this.onReady.bind(this);
        this.onMessage = this.onMessage.bind(this);
        this.onError = this.onError.bind(this);
        this.onSwitchChannel = this.onSwitchChannel.bind(this);
        this.onSwitchGuild = this.onSwitchGuild.bind(this);
        this.onRequestMessages = this.onRequestMessages.bind(this);
  }

  componentWillUnmount(){
      this.socket.emit("killingSocket");
      this.socket.removeAllListeners();
  }

  componentDidMount() {
        const  endpoint  = this.state.endpoint;

        this.socket.on("discordmessage",(message:string)=> 
            this.onMessage(message));
        this.socket.on("error",(err:string)=> 
            this.onError(err))
        this.socket.on("messageUpdate",(data:string)=> 
            this.onMessageUpdate(data))
        this.socket.on("presenceUpdate",(newMemberData:string)=>
            this.onPresenceUpdate(newMemberData))
        this.socket.on("emojiUpdate",(data:string)=>
            this.setState({emojis:JSON.parse(data)}))
        this.socket.on("batchMessages",(messages:string)=>
            this.onBatchMessage(messages))

        axios.get(endpoint+"botguilds")
        .then((response)=>this.onReady(JSON.parse(response.data)))
        .then((_good)=>this.queryEmoji())
  }

    onPresenceUpdate(newMemberData: string) {
        const memberUpdated = JSON.parse(newMemberData) as TypeGuildMember;
        let {guildList} = this.state;
        let userList = (guildList[memberUpdated.guildName] as TypeGuild).users
        let toRemove = ""
        Object.values(userList).forEach((user:TypeGuildMember)=>{
            if(user.id===memberUpdated.id){
                toRemove = user.displayName;
            }
        })
        userList[toRemove]=undefined;
        userList[memberUpdated.displayName] = memberUpdated;
        guildList[memberUpdated.guildName].users = userList;
        this.setState({guildList:guildList});
    }

  queryEmoji(){
        axios.get(this.state.endpoint+"emojis")
        .then(response=>this.onEmojis(response.data))
  }

  onEmojis(emojiData:Map<string,TypeEmoji>) {
        if(this.state.emojis.size>0){
            let {emojis} = this.state;
            emojiData.forEach((emoji, name)=>{
                if(!emojis[name]){
                    emojis.set(name,emoji);
                }
            })
            this.setState({emojis:emojis});
        }else this.setState({emojis:emojiData})
  }

  onReady = (data:{guilds:GuildMap, focusKey:string, notifications:Map<string,number>}) => {
        var channelname = "general";
        var guildname="Zippys Test Server";
        let msgNotifications = this.state.messageNotifications;
        Object.values(data.guilds).forEach((guild:TypeGuild)=>{
            Object.values(guild.channels).forEach((channel:TypeTextChannel)=>{
                msgNotifications[guild.name+channel.name]=0;
                if(guild.name+channel.name===data.focusKey){
                    channelname=channel.name;
                    guildname=guild.name;
                }
            })
        })
        this.setState({
            messageNotifications:data.notifications,
            isReady: true,
            guildList: data.guilds,
            channelName: channelname,
            guildName: guildname,
        },()=>
        this.onUpdateChannelFocusForNotifications(guildname+channelname))
  }

  onSwitchChannel = (e:React.MouseEvent,newChannel:string) => {
        let {messageNotifications, guildName} = this.state;
        if(messageNotifications[guildName+newChannel]>0){
                messageNotifications[guildName+newChannel]=0;
        }
        this.setState({
            messageNotifications:messageNotifications,
            channelName:newChannel,
            requestedMessages:false
        },()=>
            this.onUpdateNotifications(guildName+newChannel)
        );
        
  }

  onSwitchGuild = (e:React.MouseEvent,newGuild:string) => {
        console.log("this is new guild:"+newGuild)
        this.setState({
            guildName:newGuild,
            channelName:"general",
            requestedMessages:false
        })
        this.onUpdateNotifications(newGuild+'general')
  }

  onMessage = (message:string) => {
        let parsed = onMessageParseMessage(message,this.state)
        this.setState({
            guildList:parsed.guildList,
            emojis:parsed.emojis
        })
        let el = document.getElementById('message-table')
        el.scrollTop = el.scrollHeight;
  }

  onBatchMessage = (messages:string) => {
        this.setState({
            guildList:handleBatchMessage(messages,this.state)
        })
  }

  onSendMessage = (guildID:string, channelID:string, content:string) => {
        this.socket.emit("sendMessage",
            {
                guild:guildID,
                channel:channelID,
                content:content
            })
        console.log(`Sent message from ${guildID} guild,
             ${channelID} channel, with content:\n ${content}`)
  }

  onMessageUpdate = (data:string) => {
        console.log(`got message update data`);
        const msgUpdateData:TypeMessageUpdateData = JSON.parse(data);
        let {id,guild,channel} = msgUpdateData.old, {guildList} = this.state;
        let messageArray = guildList[guild].channels[channel].messages;
        let messageIndex:number;
        messageArray.forEach((message:TypeMessage,idx:number) => {
            if(message.id === id){
                messageIndex=idx;
            }
        });
        messageArray[messageIndex] = msgUpdateData.new;
        guildList[guild].channels[channel].messages = messageArray;
        this.setState({guildList:guildList});
        let el = document.getElementById('message-table')
        el.scrollTop = el.scrollHeight;
  }

  onRequestMessages = ( e:MouseEvent, channelID:string, guildID:string,
                        messageID?:string, requestFromRender?:boolean ) => {
        e && e.preventDefault();
        let requestData = {
            channelID:channelID,
            guildID:guildID,
            lastMessage:messageID?messageID:undefined
        };
        if(requestFromRender){
            this.setState({
                requestedMessages:true
            },()=>{
                this.socket.emit("requestMessages",JSON.stringify(requestData))
            })
        } else {
        this.socket.emit("requestMessages",JSON.stringify(requestData))
        }
  }

  onError = (error:string) => {
        this.setState({error: error})
  }

  onUpdateChannelFocusForNotifications = (key:string) => {
        this.socket.emit("channelFocus", key)
  }

  onUpdateNotifications = (key:string) => {
        this.socket.emit("notificationsUpdate", key)
  }

  render() {
      let { guildList, messageNotifications, emojis,
            guildName, channelName, isReady, requestedMessages } = this.state
      let { guildID, channelID, messages, members, channels } = handleAppRender(this.state);
      if(Object.values(guildList).length > 0){
          if(messages.length===0&&!requestedMessages&&channelID&&guildID){
            this.onRequestMessages(undefined,channelID,guildID,undefined,true);
          }
      }

      let sideBarProps = {
        notifications:messageNotifications,
        ready:isReady,
        guildList:guildList,
        guildName:guildName,
        onSwitchGuild:this.onSwitchGuild,
        onSwitchChannel:this.onSwitchChannel,
        guildChannels:channels
      }

      let messageListProps = {
        socket:this.socket,
        requestMessages:this.onRequestMessages,
        channelName:channelName,
        guildName:guildName,
        messages:messages as TypeMessage[],
        emojis:emojis,
        sendFunction:this.onSendMessage,
        channelID:channelID,
        guildID:guildID
      }

      return (
        <Router>
            <div className="App">
                <Nav/>
                <div className="row bg-light">
                        <SideBar {...sideBarProps}/>
                        <Switch>
                                <Route exact path="/">
                                    <MessageList {...messageListProps}/>
                                    <UserBar members={members}/>
                                </Route>
                                <Route path="/commands">
                                    <Commands />
                                </Route>
                        </Switch>
                </div>
            </div>
        </Router>
      );
  }
}