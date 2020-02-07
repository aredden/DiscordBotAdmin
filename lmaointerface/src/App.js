import React, {Component} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.slim.min';
import 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Nav from './components/Nav';
import MessageList from './components/MessageList';
import SideBar from './components/Sidebar';
import socketIOClient from 'socket.io-client';
import axios from 'axios';
export default class App extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isReady: false,
            error: false,
            guildList:false,
            channelName:false,
            guildName:false,
            endpoint:'http://localhost:3001/',
            socket:false,
            emojis:false,
        }
        this.onReady = this.onReady.bind(this);
        this.onMessage = this.onMessage.bind(this);
        this.onError = this.onError.bind(this);
        this.onSwitchChannel = this.onSwitchChannel.bind(this);
        this.socket = socketIOClient(this.state.endpoint,{
            origin:this.state.endpoint,
            credentials:false
        });
    }

    componentDidMount() {
        const { endpoint } = this.state;
        this.socket.on("discordmessage", (message) => this.onMessage(message));
        this.socket.on("error",(err)=> this.onError(err))
        axios.get(endpoint+"botguilds")
        .then((response)=>this.onReady(response.data))

    }

    // updateEmojis(){
    //     axios.get(endpoint+"emojis")
    //     .then(response=>this.onEmojis(response.data))
    // }

    onEmojis(emojiData) {
        console.log(emojiData);
        this.setState({emojis:emojiData})
    }

    onReady = (data) => {
        console.log(data);
        var channelname = "general";
        var guildname="Lmaocraft";
        this.setState({
          isReady: true,
          guildList: data,
          channelName: channelname,
          guildName: guildname,
        })
    }

    onSwitchChannel = (e=Event,newChannel) => {
        e.preventDefault()
        this.setState({
            channelName:newChannel
        });
    }

    onGuildSwitch = (e=Event,newGuild) => {
        e.preventDefault()
        this.setState({
            guildName:newGuild
        })
    }

    onMessage = (message) => {
        const parsedMessage = JSON.parse(message);
        console.log(parsedMessage);
        var guildlist = this.state.guildList;
        guildlist[parsedMessage.guild].channels[parsedMessage.channel].messages.push(parsedMessage);
        this.setState({
            guildList:guildlist
        })
    }

    onError = (error) => {
        this.setState({error: error})
    }

    render() {
        let channels
        let messages
        let emojis
        if(this.state.guildList){
            channels = this.state.guildList[this.state.guildName].channels;
            messages = channels[this.state.channelName].messages;
            emojis = this.state.guildList[this.state.guildName].emojis;
        }
        return (
            <div className="App">
                <Nav/>
                <div className="row">
                    <SideBar
                        ready={this.state.isReady}
                        error={this.state.error}
                        guildList={this.state.guildList}
                        guildName={this.state.guildName}
                        onSwitchChannel={this.onSwitchChannel}
                        guildChannels={channels}/>
                    <MessageList
                        channelName={this.state.channelName}
                        guildName={this.state.guildName}
                        messages={messages}
                        emojis={emojis}/>
                </div>
            </div>
        );
    }
}
