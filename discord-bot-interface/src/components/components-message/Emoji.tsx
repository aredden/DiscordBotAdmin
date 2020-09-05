/** @format */

import React from 'react';
import { TypeEmoji } from '../../types/discord-bot-admin-types';
function Emoji(emoji: TypeEmoji) {
	const { name, id, url } = emoji;

	return (
		<img
			src={url}
			alt={id}
			key={`${id}-${name}`}
			style={{ height: '1.7rem' }}
			data-toggle="tooltip"
			data-placement="top"
			title={name}
		/>
	);
}
export default Emoji;
