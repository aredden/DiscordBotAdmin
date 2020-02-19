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
    TypeTextChannel, TypeMessageUpdateData } from './types/lmaotypes';

type AppType = {
    isReady:boolean,
    error:string,
    guildList:Map<string,TypeGuild>,
    channelName:string,
    guildName:string,
    endpoint:string,
    emojis:Map<string,TypeEmoji>
}

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
      }
      this.socket = socketIOClient(endpoint);
      this.onEmojis = this.onEmojis.bind(this);
      this.onReady = this.onReady.bind(this);
      this.onMessage = this.onMessage.bind(this);
      this.onError = this.onError.bind(this);
      this.onSwitchChannel = this.onSwitchChannel.bind(this);
      this.onGuildSwitch = this.onGuildSwitch.bind(this);
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
      .then((response)=>this.onReady(response.data))
      .then((good)=>this.queryEmoji())
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

  onReady = (data:Map<string,TypeGuild>) => {
      var channelname = "general";
      var guildname="Zippys Test Server";
      this.setState({
        isReady: true,
        guildList: data,
        channelName: channelname,
        guildName: guildname,
      })
  }

  onSwitchChannel = (e:React.MouseEvent,newChannel:string) => {
      e.preventDefault()
      this.setState({
          channelName:newChannel
      });
  }

  onGuildSwitch = (e:React.MouseEvent,newGuild:string) => {
      e.preventDefault()
      this.setState({
          guildName:newGuild
      })
  }

  onMessage = (message:string) => {
      const parsedMessage:TypeMessage = JSON.parse(message) as TypeMessage;
      console.log(parsedMessage);
      var guildlist =  this.state.guildList;
      try{
        const tempGuild = guildlist[parsedMessage.guild] as TypeGuild;
        const channels = tempGuild.channels as Map<string,TypeTextChannel>;
        let channel = channels[parsedMessage.channel] as TypeTextChannel
        channel.messages.push(parsedMessage);
      }catch(error){
        console.log("Ran into error pushing message to array of messages.")
      }
      let emojiMapFromState = this.state.emojis;
      let emojiMapFromMessage = parsedMessage.newEmojis as Map<string,TypeEmoji>
      if(emojiMapFromMessage){
        Object.keys(emojiMapFromMessage).forEach((key) => {
            if(!emojiMapFromState[key]){
                emojiMapFromState[key]=emojiMapFromMessage[key];
            }
        });
      }
      this.setState({
          guildList:guildlist,
          emojis:emojiMapFromState
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
  }

  onError = (error:string) => {
        this.setState({error: error})
  }

  render() {
      let channels:Map<string,TypeTextChannel>, messages:Array<TypeMessage>,
          emojis:Map<string,TypeEmoji>,ready = this.state.isReady,
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
                      ready={ready}
                      guildList={this.state.guildList}
                      guildName={this.state.guildName}
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