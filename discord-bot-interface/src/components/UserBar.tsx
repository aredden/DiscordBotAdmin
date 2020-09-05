/** @format */

import React, { Component } from 'react';
import { TypeGuildMember } from '../types/discord-bot-admin-types';
import moment from 'moment';
import $ from 'jquery';
import { UserBarProps } from '../types/discord-bot-admin-react-types';
import { PresenceParse } from './util';
import { Badge, Avatar } from 'antd';
import 'bootstrap';
export default class UserBar extends Component<
	UserBarProps,
	{ selectedUser: TypeGuildMember }
> {
	constructor(props: UserBarProps) {
		super(props);
		this.state = {
			selectedUser: undefined,
		};
		this.handleSelectUser = this.handleSelectUser.bind(this);
	}

	handleSelectUser(e, user: TypeGuildMember) {
		e.preventDefault();
		this.setState({ selectedUser: user }, () => $('#userModal').modal('show'));
	}

	render() {
		const { members } = this.props;
		const { selectedUser } = this.state;
		let online: TypeGuildMember[] = new Array<TypeGuildMember>();
		let offline: TypeGuildMember[] = new Array<TypeGuildMember>();
		if (members)
			Object.values(members).forEach((member: TypeGuildMember) => {
				member.presence.status === 'offline'
					? offline.push(member)
					: online.push(member);
			});

		return (
			<div className="col-md-2" key="userbar-bar">
				{selectedUser && <UserModal member={selectedUser}></UserModal>}
				<nav
					className="userbar d-md-block"
					style={{
						borderLeft: '1px solid rgb(0,0,0,.1)',
						backgroundColor: '#E7E7E7',
					}}>
					<div className="userbar-sticky">
						<ul className="nav flex-column">
							<li>
								<div
									style={{
										paddingTop: '.5rem',
										paddingLeft: '3rem',
										fontWeight: 'bold',
									}}>
									Online
								</div>
								<hr />
							</li>
							{members
								? online
										.sort(
											(memberA: TypeGuildMember, memberB: TypeGuildMember) =>
												memberB.highestRole.position - memberA.highestRole.position
										)
										.map((member: TypeGuildMember) => {
											return Member(member, this.handleSelectUser);
										})
								: 'Guild has no members'}
							<li>
								<hr />
								<div
									style={{
										paddingTop: '.5rem',
										paddingLeft: '3rem',
										fontWeight: 'bold',
									}}>
									Offline
								</div>
								<hr />
							</li>
							{members
								? offline.map((member: TypeGuildMember) => {
										return Member(member, this.handleSelectUser);
								  })
								: 'Guild has no members'}
						</ul>
					</div>
				</nav>
			</div>
		);
	}
}

function Member(
	user: TypeGuildMember,
	handleUserClick: (e, member: TypeGuildMember) => any
) {
	const presenceStyle = PresenceParse(user.presence.status);
	const { game } = user.presence;
	const { avatarURL } = user.user;
	let pfpURL = avatarURL ? avatarURL : `./defaultUserIcon.png`;
	return (
		<li
			className="nav-link clearfix btn ml-1 userbar-user"
			key={`${user.displayName}-user-${user.id}`}
			data-toggle="modal"
			data-target="#userModal"
			style={{ textAlign: 'start' }}
			onClick={(e) => handleUserClick(e, user)}>
			<Badge
				count={0}
				status={presenceStyle}
				showZero={false}
				style={{ marginLeft: '.1rem', height: '12px', width: '12px' }}>
				{/* <span className={`badge badge-${presenceStyle}`} style={{ height: '12px' }}>
					&nbsp;
				</span> */}
				<Avatar
					shape="square"
					style={{ borderRadius: '.3rem' }}
					gap={1}
					src={pfpURL}
				/>
			</Badge>
			{/* <img
				className="rounded mx-2"
				src={pfpURL}
				alt={''}
				style={{ maxHeight: '35px' }}></img> */}
			<strong style={{ color: user.displayHexColor, marginLeft: '.5rem' }}>
				{user.nickname ? user.nickname : user.displayName}
			</strong>
			{game && game.length > 0 ? (
				<small className="d-flex">
					<div className="ml-3 pr-1" style={{ fontWeight: 'bold' }}>
						{`Playing`}
					</div>
					{game[0].name}
				</small>
			) : (
				''
			)}
		</li>
	);
}

class UserModal extends Component<{ member: TypeGuildMember }> {
	render() {
		const { member } = this.props;
		const { displayName, presence, user, highestRole } = member;
		const { avatarURL, avatar, id, createdAt } = user;
		const { clientStatus, status } = presence;
		const games = presence.game;
		return (
			<div
				className="modal fade"
				id="userModal"
				role="dialog"
				aria-labelledby="userModallabel"
				tabIndex={-1}
				aria-hidden="true">
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<img
								className="rounded"
								src={avatarURL}
								alt={avatar}
								style={{ maxHeight: '45px' }}></img>
							<h5
								className="modal-title"
								id="userModallabel"
								style={{ marginLeft: '.5rem' }}>
								{displayName}'s User Info
							</h5>
							<button
								type="button"
								className="close"
								data-dismiss="modal"
								aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body">
							<p>Status: {status}</p>
							<p>ID: {id}</p>
							<p>Highest Role: {highestRole.name}</p>
							<p>{`Mention: <@!${user.id}>`}</p>

							{games.map((game) => {
								return (
									<div key={`gameslist-${game.applicationID}`}>
										{game.name}
										<br />
										{game.applicationID
											? [`ApplicationID: ${game.applicationID}`, <br key="usrmodal-aid" />]
											: ''}
										{game.assets ? (
											<div>
												Assets:{' '}
												{Object.entries(game.assets).map((entry) => {
													let key = entry[0];
													let val = entry[1];
													if (key && val && key.length > 0) {
														return [
															<div style={{ marginLeft: '1rem' }} key={`usrmodal-${key}`}>
																{key}: {val}
															</div>,
															<br key={`usrmodal-asset-${key}`} />,
														];
													} else return '';
												})}
											</div>
										) : (
											''
										)}
										{game.details
											? [`Details: ${game.details}`, <br key="usrmodal-details" />]
											: ''}
										{game.state
											? [`State: ${game.state}`, <br key="usrmodal-state" />]
											: ''}
										{game.timestamps
											? [
													`Start Time: ${game.timestamps.start}`,
													<br key="usrmodal-stime" />,
											  ]
											: ''}
										{game.type
											? [`Game Type: ${game.type}`, <br key="usrmodal-type" />]
											: ''}
										{game.url ? [`Game URL: ${game.url}`, <br key="usrmodal-url" />] : ''}
										<br />
									</div>
								);
							})}
							<p>{`Discord Birthday: ${moment(createdAt)}`}</p>
							<p>
								{clientStatus
									? `ClientStatus: \n
									${clientStatus.desktop ? '   Desktop -- ' + clientStatus.desktop + '\n' : ''}
									${clientStatus.mobile ? '    Mobile -- ' + clientStatus.mobile + '\n' : ''}
									${clientStatus.web ? '   Web -- ' + clientStatus.web + '\n' : ''}
                                `
									: ''}
							</p>
							<p>{avatar ? `Avatar ID: ${avatar}` : ''}</p>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-dismiss="modal">
								Close
							</button>
							<button type="button" className="btn btn-primary">
								Save changes
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
