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
    ChannelMap, EmojiMap, GuildMap } from './types/lmaotypes';
import { onMessageParseMessage } from './AppFunctions';
import { AppType } from './types/lmao-react-types';


export default class App extends Component<{},AppType> {
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
            messageNotifications:new Map<string,number>()
        }
        this.onUpdateNotifications = 
            this.onUpdateNotifications.bind(this);
        this.socket = socketIOClient(endpoint);
        this.onEmojis = this.onEmojis.bind(this);
        this.onReady = this.onReady.bind(this);
        this.onMessage = this.onMessage.bind(this);
        this.onError = this.onError.bind(this);
        this.onSwitchChannel = this.onSwitchChannel.bind(this);
        this.onSwitchGuild = this.onSwitchGuild.bind(this);
  }

  componentDidMount() {
        const  endpoint  = this.state.endpoint;
        this.socket.on("discordmessage", (message:string) => 
            this.onMessage(message));
        this.socket.on("error",(err:string)=> 
            this.onError(err))
        this.socket.on("messageUpdate",(data:string)=> 
            this.onMessageUpdate(data))
        axios.get(endpoint+"botguilds")
        .then((response)=>this.onReady(JSON.parse(response.data)))
        .then((_good)=>this.queryEmoji())
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
        })
  }

  onSwitchChannel = (e:React.MouseEvent,newChannel:string) => {
        let {messageNotifications, guildName} = this.state;
        if(messageNotifications[guildName+newChannel]>0){
                messageNotifications[guildName+newChannel]=0;
        }
        e.preventDefault()
        this.setState({
            messageNotifications:messageNotifications,
            channelName:newChannel
        });
        this.onUpdateNotifications(guildName+newChannel);
  }

  onSwitchGuild = (e:React.MouseEvent,newGuild:string) => {
        e.preventDefault()
        console.log("this is new guild:"+newGuild)
        this.setState({
            guildName:newGuild,
            channelName:"general"
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

  onSendMessage = (guildID:string, channelID:string, content:string) => {
        this.socket.emit("sendMessage",
            {
                guild:guildID,
                channel:channelID,
                content:content
            })
        console.log(`Sent message from ${guildID} guild, ${channelID} channel, with content:\n ${content}`)
        
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

  onError = (error:string) => {
        this.setState({error: error})
  }

  onUpdateChannelFocusForNotifications = (key:string) => {
        this.socket.emit("channelFocus", key)
  }

  onUpdateNotifications = (key:string) => {
        this.socket.emit("notificationsUpdate", key)
  }

  onInitializeNotifications = (data:string) => {
        const _data = JSON.parse(data)
        this.setState({
            messageNotifications: _data.notifications,
            guildName: _data.guild,
            channelName: _data.channel
        })
  }

  render() {
      let channels:ChannelMap, messages:Array<TypeMessage>,
          emojis:EmojiMap, ready = this.state.isReady,
          guildlist = Object.values(this.state.guildList),
          guildID:string, channelID:string;
      if(guildlist.length > 0){
          let {guildList , guildName, channelName} = this.state;
          emojis = this.state.emojis;
          channels = (guildList[guildName] as TypeGuild).channels;
          messages = (channels[channelName] as TypeTextChannel).messages;
          if(messages.length>35){
              let start = messages.length-35
              let newMessages:Array<TypeMessage> = [];
              for(start;start<messages.length;start++){
                newMessages.push(messages[start])
              }
              messages = newMessages;
          }
          guildID = guildList[guildName].id
          channelID = guildList[guildName].channels[channelName].id
      }

      return (
          <div className="App">
              <Nav/>
              <div className="row">
                  <SideBar
                      notifications={this.state.messageNotifications}
                      ready={ready}
                      guildList={this.state.guildList}
                      guildName={this.state.guildName}
                      onSwitchGuild={this.onSwitchGuild}
                      onSwitchChannel={this.onSwitchChannel}
                      guildChannels={channels as Map<string,TypeTextChannel>}/>
                  <MessageList
                      channelName={this.state.channelName}
                      guildName={this.state.guildName}
                      messages={messages as TypeMessage[]}
                      emojis={emojis}
                      sendFunction={this.onSendMessage}
                      channelID={channelID}
                      guildID={guildID}/>
              </div>
          </div>
      );
  }
}