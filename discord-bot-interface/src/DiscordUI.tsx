/** @format */

import React, { Component } from 'react';
import './css/App.css';
import 'jquery';
import 'popper.js';
import 'bootstrap';
import Nav from './components/Nav';
import MessageList from './components/MessageList';
import SideBar from './components/Sidebar';
import socketIOClient from 'socket.io-client';
import {
	TypeGuild,
	TypeEmoji,
	TypeMessage,
	GuildMap,
} from './types/discord-bot-admin-types';
import {
	onMessageParseMessage,
	handleBatchMessage,
	handleAppRender,
	createNewChannelsMap,
	setUpDiscordFocus,
	onMessageDeleted,
	messageReactionAdd,
	messageReactionRemove,
	messageUpdate,
	presenceUpdate,
} from './DiscordUIFunctions';
import { DiscordUIState } from './types/discord-bot-admin-react-types';
import UserBar from './components/UserBar';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Commands from './components/Commands';
import dotenv from 'dotenv';

export default class DiscordUI extends Component<{}, DiscordUIState> {
	private socket: SocketIOClient.Socket;
	constructor(props: Object) {
		super(props);
		dotenv.config();

		const endpoint = process.env.LOCAL_SERVER;
		this.state = {
			isReady: false,
			error: undefined,
			guildList: new Map<string, TypeGuild>(),
			channelName: '',
			guildName: '',
			endpoint: endpoint,
			emojis: new Map<string, TypeEmoji>(),
			messageNotifications: new Map<string, number>(),
			requestedMessages: false,
		};
		this.onUpdateNotifications = this.onUpdateNotifications.bind(this);
		this.socket = socketIOClient(endpoint, {
			reconnectionDelay: 2000,
			reconnectionAttempts: 10,
		});
		this.onEmojis = this.onEmojis.bind(this);
		this.onReady = this.onReady.bind(this);
		this.onMessage = this.onMessage.bind(this);
		this.onError = this.onError.bind(this);
		this.onSwitchChannel = this.onSwitchChannel.bind(this);
		this.onSwitchGuild = this.onSwitchGuild.bind(this);
		this.onRequestMessages = this.onRequestMessages.bind(this);
	}

	componentWillUnmount() {
		this.socket.emit('killingSocket');
		this.socket.removeAllListeners();
	}

	componentDidMount() {
		const { guildList } = this.state;

		this.socket.on('discordmessage', (message: string) =>
			this.onMessage(message)
		);
		this.socket.on('error', (err: string) => this.onError(err));
		this.socket.on('messageUpdate', (data: string) => this.onMessageUpdate(data));
		this.socket.on('presenceUpdate', (newMemberData: string) =>
			this.onPresenceUpdate(newMemberData)
		);
		this.socket.on('emojiUpdate', (data: string) =>
			this.setState({ emojis: JSON.parse(data) })
		);
		this.socket.on('memberUpdate', (data: string) => {
			let memberData = JSON.parse(data);
			guildList[memberData.guild].users = memberData.members;
			this.setState({ guildList: guildList });
		});
		this.socket.on('channelUpdate', (data: string) => {
			this.onChannelUpdate(data);
		});
		this.socket.on('channelDelete', (data: string) => {
			this.onChannelDelete(data);
		});
		this.socket.on('batchMessages', (messages: string) =>
			this.onBatchMessage(messages)
		);
		this.socket.on('msgReactionAdd', (jsonData: string) => {
			this.onMessageReactionAdd(jsonData);
		});
		this.socket.on('msgReactionRemove', (jsonData: string) => {
			this.onMessageReactionRemove(jsonData);
		});
		this.socket.on('messageDeleted', (data: string) => {
			this.setState({ guildList: onMessageDeleted(data, this.state) });
		});

		fetch('botguilds', {
			credentials: 'include',
			mode: 'cors',
		})
			.then((response: Response) => response.json())
			.then((json) => this.onReady(JSON.parse(json)))
			.then(
				(_good) => this.queryEmoji(),
				(_bad) => console.log(_bad)
			);
	}

	onMessageReactionAdd(jsonString: string) {
		let result = messageReactionAdd(jsonString, this.state);
		if (result) {
			this.setState({ guildList: result as GuildMap });
		}
	}

	onMessageReactionRemove(jsonString: string) {
		let result = messageReactionRemove(jsonString, this.state);
		if (result) {
			this.setState({ guildList: result as GuildMap });
		}
	}

	onChannelDelete(data: string) {
		let { id, guild } = JSON.parse(data);
		let { guildList } = this.state;
		let channelMap = guildList[guild].channels;
		guildList[guild].channels = createNewChannelsMap(channelMap, id);
		this.setState({ guildList: guildList });
	}

	onChannelUpdate(data: string) {
		let { channel, id, guild } = JSON.parse(data);
		let { guildList } = this.state;
		let channelMap = guildList[guild].channels;
		guildList[guild].channels = createNewChannelsMap(channelMap, id, channel);
		this.setState({ guildList: guildList });
	}

	onPresenceUpdate(newMemberData: string) {
		this.setState({ guildList: presenceUpdate(newMemberData, this.state) });
	}

	queryEmoji() {
		fetch('emojis', {
			credentials: 'include',
			mode: 'cors',
		})
			.then((response) => response.json())
			.then((emojis) => this.onEmojis(emojis));
	}

	onEmojis(emojiData: Map<string, TypeEmoji>) {
		if (this.state.emojis.size > 0) {
			let { emojis } = this.state;
			emojiData.forEach((emoji, name) => {
				if (!emojis[name]) {
					emojis.set(name, emoji);
				}
			});
			this.setState({ emojis: emojis });
		} else this.setState({ emojis: emojiData });
	}

	onReady = (data: {
		guilds: GuildMap;
		focusKey: string;
		notifications: Map<string, number>;
	}) => {
		let { guilds, focusKey, notifications } = data;
		let { channelName, guildName } = setUpDiscordFocus(guilds, focusKey);

		this.setState(
			{
				messageNotifications: notifications,
				isReady: true,
				guildList: data.guilds,
				channelName: channelName,
				guildName: guildName,
			},
			() => this.onUpdateChannelFocusForNotifications(guildName + channelName)
		);
	};

	onSwitchChannel = (e: React.MouseEvent, newChannel: string) => {
		let { messageNotifications, guildName } = this.state;
		if (messageNotifications[guildName + newChannel] > 0) {
			messageNotifications[guildName + newChannel] = 0;
		}
		this.setState(
			{
				messageNotifications: messageNotifications,
				channelName: newChannel,
				requestedMessages: false,
			},
			() => this.onUpdateNotifications(guildName + newChannel)
		);
	};

	onSwitchGuild = (e: React.MouseEvent, newGuild: string) => {
		console.log('this is new guild:' + newGuild);
		this.setState({
			guildName: newGuild,
			channelName: 'general',
			requestedMessages: false,
		});
		this.onUpdateNotifications(newGuild + 'general');
	};

	onMessage = (message: string) => {
		let parsed = onMessageParseMessage(message, this.state);
		this.setState({
			guildList: parsed.guildList,
		});
		let el = document.getElementById('message-table');
		el.scrollTop = el.scrollHeight;
	};

	onBatchMessage = (messages: string) => {
		this.setState({
			guildList: handleBatchMessage(messages, this.state),
		});
	};

	onSendMessage = (guildID: string, channelID: string, content: string) => {
		this.socket.emit('sendMessage', {
			guild: guildID,
			channel: channelID,
			content: content,
		});
		console.log(`Sent message from ${guildID} guild,
             ${channelID} channel, with content:\n ${content}`);
	};

	onMessageUpdate = (data: string) => {
		this.setState({ guildList: messageUpdate(data, this.state) }, () => {
			//scroll to bottom of MessageList
			let el = document.getElementById('message-table');
			el.scrollTop = el.scrollHeight;
		});
	};

	onRequestMessages = (
		e: MouseEvent,
		channelID: string,
		guildID: string,
		messageID?: string,
		requestFromRender?: boolean
	) => {
		e && e.preventDefault();
		let requestData = {
			channelID: channelID,
			guildID: guildID,
			lastMessage: messageID ? messageID : undefined,
		};
		if (requestFromRender) {
			this.setState(
				{
					requestedMessages: true,
				},
				() => {
					this.socket.emit('requestMessages', JSON.stringify(requestData));
				}
			);
		} else {
			this.socket.emit('requestMessages', JSON.stringify(requestData));
		}
	};

	onError = (error: string) => {
		this.setState({ error: error });
	};

	onUpdateChannelFocusForNotifications = (key: string) => {
		this.socket.emit('channelFocus', key);
	};

	onUpdateNotifications = (key: string) => {
		this.socket.emit('notificationsUpdate', key);
	};

	render() {
		let {
			guildList,
			messageNotifications,
			emojis,
			guildName,
			channelName,
			isReady,
			requestedMessages,
		} = this.state;
		let { guildID, channelID, messages, members, channels } = handleAppRender(
			this.state
		);
		if (Object.values(guildList).length > 0) {
			if (messages.length === 0 && !requestedMessages && channelID && guildID) {
				this.onRequestMessages(undefined, channelID, guildID, undefined, true);
			}
		}

		let sideBarProps = {
			notifications: messageNotifications,
			ready: isReady,
			guildList: guildList,
			guildName: guildName,
			onSwitchGuild: this.onSwitchGuild,
			onSwitchChannel: this.onSwitchChannel,
			guildChannels: channels,
		};

		let messageListProps = {
			socket: this.socket,
			requestMessages: this.onRequestMessages,
			channelName: channelName,
			guildName: guildName,
			messages: messages as TypeMessage[],
			sendFunction: this.onSendMessage,
			channelID: channelID,
			guildID: guildID,
		};

		return (
			<Router>
				<div className="App" style={{ backgroundColor: '#F0F0F0' }}>
					<Nav />
					<div className="row">
						<SideBar {...sideBarProps} />
						<Switch>
							<Route exact path="/">
								<MessageList {...{ ...messageListProps, emojis }} />
								<UserBar members={members} />
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
