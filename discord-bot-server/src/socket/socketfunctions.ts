/** @format */

import {
	Message,
	MessageAttachment,
	MessageEmbed,
	TextChannel,
	Guild,
	Channel,
	ChannelLogsQueryOptions,
	User,
	GuildMember,
	MessageReaction,
	GuildManager,
	PartialMessage,
	GuildEmoji,
} from 'discord.js';
import { Socket } from 'socket.io';
import {
	parseMessage,
	parseNewMessage,
	parseMessages,
	parseTextChannel,
	convertDiscEmojiToTypeEmoji,
	parseMessageReaction,
} from '../discordbot/typeparserfunctions';
import {
	TypeMessageData,
	TypeMessage,
	EmojiMap,
	TypeEmoji,
	UpdateGuildArguments,
	UpdateGuildResult,
	UpdateChannelArguments,
	UpdateChannelResult,
	UpdateMemberResult,
	UpdateMemberArguments,
	UpdateMessageArguments,
	UpdateMessageResult,
} from '../types/discord-bot-admin-types';
import getLogger from '../logger';
import {
	updateChannelNotifications,
	getFocusKey,
	getGuildData,
	updateEmojiMap,
} from '../index';
import bot from '../index';
const logger = getLogger('socketfunctions');

let clientGuilds: GuildManager;

export function buildSocketFunctions() {
	clientGuilds = bot.client.guilds;
}

export async function handleMessage(
	msg: Message | PartialMessage,
	socket: Socket
) {
	const message = msg.partial ? await msg.fetch() : (msg as Message);
	const parsed = await parseMessage(message);
	socket.emit('discordmessage', JSON.stringify(parsed));
}

export async function handleMessageUpdate(
	oldMsg: Message | PartialMessage,
	newMsg: Message | PartialMessage,
	socket: Socket,
	_startDate?: number
) {
	const newmessage = newMsg.partial ? await newMsg.fetch() : (newMsg as Message);
	const oldmessage = oldMsg.partial ? await oldMsg.fetch() : (oldMsg as Message);
	const messageUpdateData = {
		old: await parseMessage(oldmessage),
		new: await parseNewMessage(newmessage),
	};
	socket.emit('messageUpdate', JSON.stringify(messageUpdateData));
}

export function handleNotificationsUpdate(key: string) {
	updateChannelNotifications(key, undefined, true);
}

export async function handleMessagesRequest(
	guildID: string,
	channelID: string,
	lastMessage: string,
	sock: Socket
) {
	let queryOpts: ChannelLogsQueryOptions = {
		before: lastMessage ? lastMessage : undefined,
		limit: 30,
	};

	((clientGuilds.cache.get(guildID) as Guild).channels.cache.get(
		channelID
	) as TextChannel).messages
		.fetch(queryOpts)
		.then(
			async (messages) => {
				return await parseMessages(messages);
			},
			(_fail) => {
				logger.error(`Failed to update messages: ${_fail}`);
			}
		)
		.then((parsedMessages: TypeMessage[]) => {
			sock.emit('batchMessages', JSON.stringify(parsedMessages));
		});
}

let lastFoundTyping = new Map<string, Date>();

export function handleTypingStart(
	channel: Channel,
	user: User,
	socket: Socket
) {
	if (channel.type === 'text') {
		let txtChannel = channel as TextChannel;
		if (getFocusKey() === txtChannel.guild.name + txtChannel.name) {
			socket.emit(
				'typingStart',
				JSON.stringify({
					user: user.username,
					id: user.id,
					discriminator: user.discriminator,
				})
			);
			lastFoundTyping[user.id] = Date.now();
			waitUntilStop(user, channel, socket);
		}
	}
}

const sendTypingStop = (user: User, socket: Socket) => {
	socket.emit(
		'typingStop',
		JSON.stringify({
			user: user.username,
			id: user.id,
			discriminator: user.discriminator,
		})
	);
};

const waitUntilStop = (user: User, channel: Channel, socket: Socket) => {
	setTimeout(() => {
		if (Date.now() - lastFoundTyping[user.id] >= 8000) {
			sendTypingStop(user, socket);
		} else {
			waitUntilStop(user, channel, socket);
		}
	}, 400);
};

export async function handleChannelUpdate(channel: Channel, sock: Socket) {
	const channelFetched = await channel.fetch();

	if (channelFetched.type === 'text' && !channelFetched.deleted) {
		let txtChannel = channelFetched as TextChannel;
		let parsedTextChannel = await parseTextChannel(txtChannel);
		sock.emit(
			'channelUpdate',
			JSON.stringify({
				channel: parsedTextChannel,
				guild: txtChannel.guild.name,
				id: txtChannel.id,
			})
		);
	}
}

export async function handleChannelDelete(channel: Channel, sock: Socket) {
	const channelFetched = await channel.fetch();

	if (channelFetched.type === 'text') {
		let txtChannel = channelFetched as TextChannel;
		sock.emit(
			'channelDelete',
			JSON.stringify({
				guild: txtChannel.guild.name,
				id: txtChannel.id,
			})
		);
	}
}

export async function handleMemberUpdate(member: GuildMember, sock: Socket) {
	let name = member.guild.name;
	if (name) {
		await getGuildData().then((guildParsed) => {
			let newUsers = guildParsed[name].users;
			sock.emit(
				'memberUpdate',
				JSON.stringify({
					guild: name,
					members: newUsers,
				})
			);
		});
	} else {
		logger.error(
			`{handleMemberUpdate(member,sock)} @member guild name is undefined. ${member.toString()}`
		);
	}
}

export function handleEmojiUpdate(
	newEmoji: GuildEmoji,
	oldEmoji: GuildEmoji,
	sock: Socket
) {
	let mojiMap: EmojiMap = new Map<string, TypeEmoji>();
	let toRemove: EmojiMap = new Map<string, TypeEmoji>();
	if (newEmoji.deleted) {
		toRemove[oldEmoji.name] = convertDiscEmojiToTypeEmoji(oldEmoji);
		mojiMap = updateEmojiMap(mojiMap, toRemove);
	} else {
		toRemove[oldEmoji.name] = convertDiscEmojiToTypeEmoji(oldEmoji);
		mojiMap[newEmoji.name] = convertDiscEmojiToTypeEmoji(newEmoji);
		mojiMap = updateEmojiMap(mojiMap, toRemove);
	}
	sock.emit('emojiUpdate', JSON.stringify(mojiMap));
}

export function handleEmojiCreate(emoji: GuildEmoji, sock: Socket) {
	let mojiMap: EmojiMap = new Map<string, TypeEmoji>();
	mojiMap[emoji.name] = convertDiscEmojiToTypeEmoji(emoji);
	mojiMap = updateEmojiMap(mojiMap);
	sock.emit('emojiUpdate', JSON.stringify(mojiMap));
}

export const handleMessageReactionAdd = async (
	react: MessageReaction,
	sock: Socket
) => {
	let reaction = react.partial
		? await react.fetch()
		: (react as MessageReaction);
	let tReaction = await parseMessageReaction(reaction);
	sock.emit('msgReactionAdd', JSON.stringify(tReaction));
};

export const handleMessageReactionRemove = async (
	react: MessageReaction,
	sock: Socket
) => {
	let reaction = react.partial
		? await react.fetch()
		: (react as MessageReaction);
	let tReaction = await parseMessageReaction(reaction);
	sock.emit('msgReactionRemove', JSON.stringify(tReaction));
};

///////////////////////////////
//      Socket listeners     //
///////////////////////////////

export const handleSendMessage = (
	messageData: TypeMessageData,
	_attatchments?: MessageAttachment[],
	_embeds?: MessageEmbed[]
) => {
	let { guild, channel, content } = messageData;

	const targetGuild = clientGuilds.cache.get(messageData.guild);
	if (!guild) {
		logger.error(`guild w/ id: ${guild} does not exist!`);
		return;
	}
	const targetChannel = targetGuild.channels.cache.get(channel) as TextChannel;
	if (!channel) {
		logger.error(`guild w/ id: ${channel} does not exist!`);
		return;
	}
	logger.info(
		`Sending message to ${targetChannel.name} in ${targetChannel.guild.name} content:\n${messageData.content}`
	);
	targetChannel.send(content).then(
		(_success) => {
			logger.info(`Successfully sent message to ${targetChannel.name}!`);
		},
		(_fail) => {
			logger.error(`Failed to send message to ${targetChannel.name}!`);
		}
	);
};

export const handleMessageEditRequest = (
	jsonParams: string,
	sock: Socket,
	startDate: number
) => {
	let { guildID, channelID, messageID, content } = JSON.parse(jsonParams);
	let guild: Guild = clientGuilds.cache.get(guildID);
	let targetChannel: TextChannel = guild.channels.cache.get(
		channelID
	) as TextChannel;
	let targetMessage = targetChannel.messages.cache.get(messageID) as Message;
	targetMessage.edit(content).then(
		(_success) => {
			logger.info(
				`Succeeded in editting message from channel ${targetChannel.name}`
			);
			let newMessage = targetChannel.messages.cache.get(messageID);
			handleMessageUpdate(targetMessage, newMessage, sock, startDate);
		},
		(_fail) =>
			logger.error(
				`Failed to send message to ${
					targetChannel.name
				}.. \n Error: ${_fail.toString()}`
			)
	);
};

/**
 * Only accepts a single UpdateGuildArgument arg at a time.
 * @param updateArguments UpdateGuildArguments
 * @param socket SocketIO.Socket
 */
export const handleUpdateGuildRequest = async (
	updateArguments: UpdateGuildArguments,
	socket: Socket
) => {
	let { guildID, options } = updateArguments;
	let targetGuild = bot.client.guilds.resolve(guildID);
	let {
		setAFKChannel,
		setAFKTimeout,
		setName,
		setOwner,
		setRegion,
		setSystemChannel,
		setVerificationLevel,
	} = options;
	let result: UpdateGuildResult;
	switch (true) {
		case setAFKChannel !== undefined:
			const { channelID } = setAFKChannel;
			await targetGuild.setAFKChannel(channelID, setAFKChannel.reason).then(
				(_success) => (result = { setAFKChannel: true }),
				(_fail) => (result = { setAFKChannel: false })
			);
			break;
		case setAFKTimeout !== undefined:
			let { time } = setAFKTimeout;
			await targetGuild.setAFKTimeout(time, setAFKChannel.reason).then(
				(_success) => (result = { setAFKTimeout: true }),
				(_fail) => (result = { setAFKTimeout: false })
			);
			break;
		case setName !== undefined:
			let { name } = setName;
			await targetGuild.setName(name, setName.reason).then(
				(_success) => (result = { setName: true }),
				(_fail) => (result = { setName: false })
			);
			break;
		case setOwner !== undefined:
			await targetGuild.setOwner(setOwner.memberID, setOwner.reason).then(
				(_success) => (result = { setOwner: true }),
				(_fail) => (result = { setOwner: false })
			);
			break;
		case setRegion !== undefined:
			let { region } = setRegion;
			await targetGuild.setRegion(region, setRegion.reason).then(
				(_success) => (result = { setRegion: true }),
				(_fail) => (result = { setRegion: false })
			);
			break;
		case setSystemChannel !== undefined:
			await targetGuild
				.setSystemChannel(setSystemChannel.channelID, setSystemChannel.reason)
				.then(
					(_success) => (result = { setOwner: true }),
					(_fail) => (result = { setOwner: false })
				);
			break;
		case setVerificationLevel !== undefined:
			await targetGuild
				.setVerificationLevel(setVerificationLevel.level, setOwner.reason)
				.then(
					(_success) => (result = { setOwner: true }),
					(_fail) => (result = { setOwner: false })
				);
			break;
		default:
			break;
	}
	socket.emit('updateGuildResult', JSON.stringify(result));
};

/**
 * Only accepts a single UpdateChannelArgument arg at a time.
 * @param updateArguments: UpdateChannelArguments
 * @param socket: SocketIO.Socket
 */
export const handleUpdateChannelRequest = async (
	updateArguments: UpdateChannelArguments,
	socket: Socket
) => {
	let { channelID, options } = updateArguments;
	let {
		setNSFW,
		setName,
		setParent,
		setPosition,
		setRateLimitPerUser,
	} = options;
	let channel = await bot.client.channels.fetch(channelID, true);
	let result: UpdateChannelResult;
	if (channel.type === 'text') {
		let txtChannel = channel as TextChannel;
		switch (true) {
			case setNSFW !== undefined:
				await txtChannel.setNSFW(setNSFW.value).then(
					(_success) => (result = { setNSFW: true }),
					(_fail) => (result = { setNSFW: false })
				);
				break;
			case setName !== undefined:
				await txtChannel.setName(setName.name, setName.reason).then(
					(_success) => (result = { setName: true }),
					(_fail) => (result = { setName: false })
				);
				break;
			case setParent !== undefined:
				await txtChannel.setParent(setParent.channel, setParent.options).then(
					(_success) => (result = { setParent: true }),
					(_fail) => (result = { setParent: false })
				);
				break;
			case setPosition !== undefined:
				await txtChannel
					.setPosition(setPosition.position, setPosition.options)
					.then(
						(_success) => (result = { setPosition: true }),
						(_fail) => (result = { setPosition: false })
					);
				break;
			case setRateLimitPerUser !== undefined:
				await txtChannel
					.setRateLimitPerUser(setRateLimitPerUser.limit, setRateLimitPerUser.reason)
					.then(
						(_success) => (result = { setRateLimitPerUser: true }),
						(_fail) => (result = { setRateLimitPerUser: false })
					);
				break;
			default:
				break;
		}
		socket.emit('updateChannelResult', JSON.stringify(result));
	}
};

/**
 * Only accepts a single UpdateMemberArgument arg at a time.
 * @param updateArguments: UpdateMemberArguments
 * @param socket: SocketIO.Socket
 */
export const handleUpdateMemberRequest = async (
	updateArguments: UpdateMemberArguments,
	socket: Socket
) => {
	let { guildID, memberID, options } = updateArguments;
	let { ban, kick, giveRole, removeRole, nickName } = options;
	let guild: Guild = bot.client.guilds.cache.get(guildID);
	let member: GuildMember = guild.members.cache.get(memberID);
	let result: UpdateMemberResult;

	if (!member.manageable) {
		socket.emit('updateMemberResult', JSON.stringify({ manageable: false }));
		return;
	}

	switch (true) {
		case ban !== undefined:
			await member.ban(ban).then(
				(_success) => (result = { banned: true }),
				(_fail) => (result = { banned: false })
			);
			break;
		case kick !== undefined:
			await member.kick(kick.reason).then(
				(_success) => (result = { kicked: true }),
				(_fail) => (result = { kicked: false })
			);
			break;
		case giveRole !== undefined:
			await member.roles.add(giveRole.roleID).then(
				(_success) => (result = { gaveRole: true }),
				(_fail) => (result = { gaveRole: false })
			);
			break;
		case removeRole !== undefined:
			await member.roles.remove(removeRole.roleID).then(
				(_success) => (result = { removedRole: true }),
				(_fail) => (result = { removedRole: false })
			);
			break;
		case nickName !== undefined:
			await member.setNickname(nickName).then(
				(_success) => (result = { nickname: true }),
				(_fail) => (result = { nickname: false })
			);
			break;
		default:
			break;
	}
	socket.emit('updateMemberResult', JSON.stringify(result));
};

export const handleUpdateMessageRequest = async (
	updateArguments: UpdateMessageArguments,
	socket: Socket
) => {
	let { messageID, channelID, options } = updateArguments;
	let targetChannel = await bot.client.channels.fetch(channelID);

	let { pin, mdelete, react, suppressEmbeds } = options;
	if (targetChannel.type === 'text') {
		let targetTextChannel = targetChannel as TextChannel;
		let targetMessage = await targetTextChannel.messages.fetch(messageID);
		let result: UpdateMessageResult;
		switch (true) {
			case pin !== undefined:
				if (pin) {
					await targetMessage.pin().then(
						(_success) => (result = { pin: true }),
						(_fail) => (result = { pin: false })
					);
				} else {
					await targetMessage.unpin().then(
						(_success) => (result = { unpin: true }),
						(_fail) => (result = { unpin: false })
					);
				}
				break;
			case mdelete !== undefined:
				await targetMessage.delete(mdelete.options).then(
					(_success) => (result = { mdelete: true }),
					(_fail) => (result = { mdelete: false })
				);
				break;
			case react !== undefined:
				await targetMessage.react(react.emojiID).then(
					(_success) => (result = { react: true }),
					(_fail) => (result = { react: false })
				);
				break;
			case suppressEmbeds !== undefined:
				await targetMessage.suppressEmbeds(suppressEmbeds).then(
					(_success) => (result = { suppressEmbeds: true }),
					(_fail) => (result = { suppressEmbeds: false })
				);
			default:
				throw new Error('UPDATE MESSAGE AINT WORKIN');
		}
		socket.emit('updateMessageResult', result);
	}
};
