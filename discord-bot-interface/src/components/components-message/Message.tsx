/** @format */

import React, { Component } from 'react';
import Embed from './embed/embed';
import { parseAllowLinks } from './markdown';
import moment from 'moment';
import Attatchments, { hasAttachment } from './attatchment/attatchment';
import {
	MessageProps,
	RowProps,
} from '../../types/discord-bot-admin-react-types';
import { parseForNewline } from './regexfuncs';
import { hasMentions, parseMentions, hasContent } from '../util';
import Emoji from './Emoji';

/**
 * @class Message - instance of message for MessageList box.
 * @returns Parsed message.
 */
export default class Message extends Component<MessageProps, {}> {
	render() {
		let { content, createdAt, attachments, embeds } = this.props.message;
		let { message } = this.props;

		content = hasMentions(message) ? parseMentions(message) : content;
		message.content = content;
		let contentArray: JSX.Element[],
			embedArray: JSX.Element[],
			attachmentArray: JSX.Element[];

		let time = moment(createdAt).format('ddd-MM-YY');
		let today = moment().format('ddd-MM-YY');
		let timeString: string;
		if (time === today) {
			timeString = moment(createdAt).format('LT');
		} else {
			timeString = moment(createdAt).format('ddd LT');
		}

		contentArray = hasContent(content)
			? parseAllowLinks(parseForNewline(content))
			: [];
		embedArray = embeds.map((embed) => (
			<Embed key={`embed-${embed.timestamp}`} {...embed} />
		));
		attachmentArray = hasAttachment(message) ? Attatchments(attachments) : [];
		let messageArray = contentArray.concat(embedArray).concat(attachmentArray);

		let rowProps = {
			message: message,
			arrays: messageArray,
			time: timeString,
			handleMessageEditClick: this.props.handleMessageEditClick,
		};

		return <Row {...rowProps} />;
	}
}

/**
 *
 * @param type RowProps
 * @returns Message Row <JSX.Element>
 */
const Row = ({ message, arrays, time, handleMessageEditClick }: RowProps) => {
	function handleMouseEnter(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		let time = document.getElementById(`${message.id}time`);
		time.classList.remove('invisible');
	}

	function handleMouseLeave(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		let time = document.getElementById(`${message.id}time`);
		time.classList.add('invisible');
	}

	let editText: JSX.Element;
	if (message.editedAt) {
		editText = (
			<small
				className="text-muted pl-1"
				style={{ fontSize: '9', fontWeight: 'lighter' }}>
				{`edited on ${moment(message.editedAt).format('ddd LT')}`}
			</small>
		);
	}
	let { reactions } = message;
	return (
		<div
			className="messagelist-message p-1 btn"
			style={{ textAlign: 'start' }}
			onMouseEnter={(e) => handleMouseEnter(e)}
			onMouseLeave={(e) => handleMouseLeave(e)}
			onClick={(e) => handleMessageEditClick(e, message.id)}>
			<div id={message.id + 'content'}>
				{arrays}
				{editText}
				{message.deleted ? (
					<div color="red" style={{ fontWeight: 'bold' }}>
						Deleted
					</div>
				) : (
					''
				)}
				<small
					id={message.id + 'time'}
					className="text-muted font-weight-light pl-2 invisible">
					{time}
				</small>
			</div>
			{reactions && reactions.length > 0 ? (
				<div className="d-flex pl-3">
					{reactions.map((reaction, idx) => {
						if (!reaction.emoji.url) {
							return (
								<div
									className="badge badge-secondary pt-1"
									key={`reactionBadge-${reaction.messageID}-${idx}`}>
									<text fontSize="20">{reaction.emoji.name}</text>
								</div>
							);
						}
						return (
							<div
								className="badge badge-secondary"
								key={`reactionBadge-${reaction.messageID}-${idx}`}>
								{Emoji(reaction.emoji)}
							</div>
						);
					})}
				</div>
			) : (
				''
			)}
		</div>
	);
};
