/** @format */

import React, { Component } from 'react';
import { TypeMessage } from '../../types/discord-bot-admin-types';
import moment from 'moment';
import { buildDeadPerson } from '../util';
import ErrorBoundary from '../ErrorBoundary';
import Message from './Message';
import {
	MessageGroupsProps,
	MessageGroupProps,
} from '../../types/discord-bot-admin-react-types';

export default class MessageGroups extends Component<MessageGroupsProps, {}> {
	render() {
		let { messages, guildName } = this.props;
		let groups = new Array<Array<TypeMessage>>();
		if (messages && messages.length > 0) {
			messages.sort(
				(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			);
			let idx = 0;
			messages && groups.push(new Array(messages[0]));
			messages.reduce((prev, current) => {
				if (prev.author.id === current.author.id) {
					let timeDifference = Math.abs(
						new Date(prev.createdAt).getTime() - new Date(current.createdAt).getTime()
					);
					if (timeDifference < 120000) {
						groups[idx].push(current);
					} else {
						groups.push(new Array(current));
						idx++;
					}
					return current;
				}
				groups.push(new Array(current));
				idx++;
				return current;
			});
		}
		return (
			<tbody>
				{groups.map((msgGroup, idx) => {
					if (!msgGroup[0].member) {
						msgGroup[0].member = buildDeadPerson(
							msgGroup[0].author,
							msgGroup[0],
							guildName
						);
					}
					return (
						<ErrorBoundary key={`errorboundary-${idx}`}>
							<MessageGroup
								messages={msgGroup}
								key={msgGroup[0].id + '-message-group'}
								handleMessageEditClick={this.props.handleMessageEditClick}
							/>
						</ErrorBoundary>
					);
				})}
			</tbody>
		);
	}
}

class MessageGroup extends Component<MessageGroupProps, {}> {
	render() {
		let { messages } = this.props;

		let time = moment(messages[0].createdAt).format('ddd-MM-YY');
		let today = moment().format('ddd-MM-YY');
		let timeString: string;
		if (time === today) {
			timeString = moment(messages[0].createdAt).format('LT');
		} else {
			timeString = moment(messages[0].createdAt).format('ddd LT');
		}
		let avatarURL = messages[0].author.avatarURL;
		let pfpURL = avatarURL
			? avatarURL
			: `https://discordapp.com/avatars/${messages[0].author.avatar}`;
		return (
			<tr className="media mt-2 px-2 mr-2">
				<td>
					<img
						src={pfpURL}
						style={{ maxHeight: '2.6rem', maxWidth: '2.6rem', borderRadius: '1rem' }}
						className="mt-1 mr-3"
						alt={''}
					/>
				</td>
				<td className="media-body">
					<h5
						style={{
							color: messages[0].member.displayHexColor,
							backgroundColor: 'dark',
						}}>
						{messages[0].member.displayName}
						{messages[0].member.user.bot ? (
							<small className="ml-1 badge badge-secondary">Bot</small>
						) : (
							''
						)}
						<small
							id={messages[0].id + 'time-body'}
							className="text-muted font-weight-light pl-2">
							{timeString}
						</small>
					</h5>
					{messages.map((message: TypeMessage, idx) => (
						<div id={message.id + 'content'} key={`message-${message.id}-${idx}`}>
							<Message
								message={message}
								handleMessageEditClick={this.props.handleMessageEditClick}
							/>
						</div>
					))}
				</td>
			</tr>
		);
	}
}
