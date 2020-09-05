/** @format */

import {
	TypeUser,
	TypeMessage,
	TypeRole,
	TypeGuildMember,
	TypeEmoji,
} from '../types/discord-bot-admin-types';
import { isNullOrUndefined } from 'util';

export const buildDeadPerson = (
	user: TypeUser,
	msg: TypeMessage,
	guildName: string
) => {
	return {
		nickname: msg.author.name,
		id: msg.author.id,
		displayName: msg.author.name,
		displayHexColor: '#01010',
		highestRole: {
			name: 'NONE',
			color: 'red',
			id: '010101010',
			position: 10,
			hexColor: '#01010',
			permissions: 0,
			mentionable: false,
		},
		user: msg.author,
		roles: new Map<string, TypeRole>(),
		presence: {
			status: 'offline',
			game: undefined,
			clientStatus: undefined,
		},
		guildName: guildName,
	} as TypeGuildMember;
};

export function PresenceParse(status: String) {
	switch (status) {
		case 'online':
			return 'success';
		case 'offline':
			return 'warning';
		case 'idle':
			return 'warning';
		case 'dnd':
			return 'error';
		default:
			return 'default';
	}
}

type badgetypes = 'error' | 'default' | 'success' | 'warning' | 'processing';

export function hasMentions(msg: TypeMessage): boolean {
	return msg.mentions ? msg.mentions.length > 0 : false;
}

export function parseMentions(msg: TypeMessage): string {
	let content = msg.content;
	if (msg.mentions.length > 0) {
		msg.mentions.forEach((member: TypeGuildMember) => {
			const id = member.user.id;
			let reg = RegExp('<@!*' + id + '>', 'gm');
			content = content.replace(reg, `**@${member.displayName}**`);
		});
	}
	return content;
}

function _stringSplitter(str: string): Array<string> {
	let wordArray: Array<string> = [];
	let newlines = str.replace('\n', ' \n ');
	newlines = newlines.replace(/<|>/g, ' ');
	wordArray = newlines.split(/ +/g);
	return wordArray;
}

export function getUrlFromId(ids: string): string {
	return `https://cdn.discordapp.com/emojis/${ids}`;
}

export function getEmojiNameFromIdentifier(identifier: string) {
	const pattern = /:\w*-*\w*:/g;
	let emojiNameArray = identifier.match(pattern);
	let name = emojiNameArray[0];
	name = name.substring(1, name.length - 1);
	return name;
}

export function getIdFromEmojiStringAfterConfirmed(emojiString: string) {
	const pattern = /\d{5,}/g;
	const result = emojiString.match(pattern);
	return result[0];
}

export function wordContainsEmoji(emojiString: string): boolean {
	const pattern = /:\w*-*\w*:\d{5,}/g;
	const result = emojiString.match(pattern);
	return !isNullOrUndefined(result);
}

export function hasContent(content: string): boolean {
	return content ? content.length > 0 : false;
}

export function parseContent(
	content: string,
	emojiMap: Map<string, TypeEmoji>
): Array<string> {
	let wordArray: Array<string> = _stringSplitter(content);
	wordArray.forEach((value, idx) => {
		let word = value;
		if (word) {
			wordArray[idx] = word;
		}
	});
	return wordArray.filter((word) => word);
}
