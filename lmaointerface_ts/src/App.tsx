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
import { TypeGuild, TypeEmoji, TypeMessage, TypeTextChannel } from './types/lmaotypes';

type AppType = {
    isReady:boolean,
    error:undefined,
    guildList:Map<string,TypeGuild>,
    channelName:string,
    guildName:string,
    endpoint:string,
    emojis:Map<String,TypeEmoji>
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
      this.onReady = this.onReady.bind(this);
      this.onMessage = this.onMessage.bind(this);
      this.onError = this.onError.bind(this);
      this.onSwitchChannel = this.onSwitchChannel.bind(this);
  }

  componentDidMount() {
      const  endpoint  = this.state.endpoint;
      this.socket.on("discordmessage", (message:string) => this.onMessage(message));
      this.socket.on("error",(err:string)=> this.onError(err))
      axios.get(endpoint+"botguilds")
      .then((response)=>this.onReady(response.data))
  }

  queryEmoji(identifier:string){
      axios.get(this.state.endpoint+"emojis")
      .then(response=>this.onEmojis(response.data))
  }

  onEmojis(emojiData:Map<string,TypeEmoji>) {
      this.setState({emojis:emojiData})
  }

  onReady = (data:Map<string,TypeGuild>) => {
      var channelname = "general";
      var guildname="Lmaocraft";
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
      
      this.setState({
          guildList:guildlist
      })
  }

  onError = (error:string) => {
    //   this.setState({error: error})
  }

  render() {
      let channels
      let messages
      let emojis
      let ready = this.state.isReady
      let guildlist = Object.values(this.state.guildList)
      if(guildlist.length > 0){
          let guildlist = this.state.guildList;
          let guildname = this.state.guildName;
          channels = (guildlist[guildname] as TypeGuild).channels;
          messages = (channels[this.state.channelName] as TypeTextChannel).messages;
          emojis = (this.state.guildList[this.state.guildName] as TypeGuild).emojis;
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
                      emojis={emojis as Map<string,TypeEmoji>}/>
              </div>
          </div>
      );
  }
}