/** @format */

export type TypeMessage = {
	message: string;
	author: TypeUser;
	content: string;
	mentions: TypeGuildMember[];
	channel: string;
	guild: string;
	createdAt: Date;
	member: TypeGuildMember;
	id: string;
	embeds: TypeEmbed[];
	attachments: TypeMessageAttachment[];
	newEmojis: Map<string, TypeEmoji>;
	editedAt: Date;
	edits: TypeMessage[];
	deleted: boolean;
	reference: {
		guildID: string;
		channelID: string;
		messageID: string;
	};
	editable: boolean;
	reactions: TypeMessageReaction[];
};

export type TypeMessageReaction = {
	count: number;
	messageID: string;
	emoji: TypeEmoji;
	users: TypeUser[];
	me: boolean;
	channelName: string;
	channelID: string;
	guildName: string;
	guildID: string;
};

export type TypingData = {
	user: string;
	id: string;
	discriminator: string;
};

export type MemberMap = Map<string, TypeGuildMember>;

export type TypeEmoji = {
	id: string;
	name: string;
	identifier: string;
	url: string;
	requiresColons: boolean;
};

export type EmojiMap = Map<string, TypeEmoji>;
export type ChannelMap = Map<string, TypeTextChannel>;
export type NotificationMap = Map<string, number>;
export type GuildMap = Map<string, TypeGuild>;

export type TypeTextChannel = {
	name: string;
	type: string;
	messages: Array<TypeMessage>;
	guild: string;
	id: string;
	nsfw: boolean;
};

export type TypeGuildMember = {
	nickname: string;
	id: string;
	user: TypeUser;
	roles: Map<string, TypeRole>;
	displayName: string;
	displayHexColor: string;
	highestRole: TypeRole;
	presence: TypePresence;
	guildName: string;
};

export type TypePresence = {
	game: {
		applicationID: string;
		assets: {
			largeImage: string;
			largeText: string;
			smallImage: string;
			smallText: string;
			smallImageURL: string;
			largeImageURL: string;
		};
		state: string;
		timestamps: {
			start: Date;
			end: Date;
		};
		type: string;
		url: string;
		details: string;
		name: string;
	}[];
	clientStatus: {
		web?: UserStatus;
		mobile?: UserStatus;
		desktop?: UserStatus;
	};
	status: UserStatus;
};

export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline' | 'invisible';

export type TypeUser = {
	name: string;
	username: string;
	id: string;
	tag: string;
	createdAt: Date;
	bot: boolean;
	avatarURL: string;
	avatar: string;
};

export type TypeRole = {
	name: string;
	color: string;
	id: string;
	permissions: number;
	position: number;
	mentionable: boolean;
	hexColor: string;
};

export type TypeGuild = {
	name: string;
	channels: Map<string, TypeTextChannel>;
	users: Map<string, TypeGuildMember>;
	emojis: Map<string, TypeEmoji>;
	roles: Map<string, TypeRole>;
	id: string;
	owner: TypeGuildMember;
	ownerID: string;
	createdAt: Date;
	iconURL: string;
	icon: string;
	available: boolean;
	memberCount: number;
	me: TypeGuildMember;
	joinedAt: Date;
};

export type TypeMessageEmbedField = {
	inline: boolean;
	name: string;
	value: string;
};

export type TypeEmbed = {
	type: string;
	video: {
		height: number;
		width: number;
		url: string;
	};
	color: string;
	createdAt: Date;
	description: string;
	hexColor: string;
	fields: TypeMessageEmbedField[];
	footer: {
		iconURL: string;
		proxyIconURL: string;
		text: string;
	};
	image: {
		height: number;
		width: number;
		url: string;
		proxyURL: string;
	};
	provider: {
		name: string;
		url: string;
	};
	thumbnail: {
		width: number;
		height: number;
		url: string;
		proxyURL: string;
	};
	title: string;
	url: string;
	timestamp: string;
	author: TypeUser;
};

export type TypeMessageAttachment = {
	filename: string;
	filesize: number;
	height: number;
	width: number;
	url: string;
	proxyURL: string;
	id: string;
};

export type TypeMessageUpdateData = {
	old: TypeMessage;
	new: TypeMessage;
};
