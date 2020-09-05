/** @format */

import { Component } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';
export default class Nav extends Component {
	render() {
		return (
			<ul
				style={{ backgroundColor: '#202225 !important;' }}
				className="nav navbar-dark bg-dark d-flex fixed-top shadow navcolor">
				<Link
					to="/"
					className="navbar-brand col-md-2 pl-4 mr-0"
					style={{ backgroundColor: '#202225 !important' }}>
					LmaoBot.js
				</Link>
				<li className="nav-item" style={{ backgroundColor: '#202225 !important' }}>
					<Link
						to="/commands"
						className="nav-link text-white"
						style={{ backgroundColor: '#202225 !important' }}>
						Commands
					</Link>
				</li>
				<li className="nav-item" style={{ backgroundColor: '#202225 !important' }}>
					<Link to="/admin" className="nav-link text-white">
						Admin
					</Link>
				</li>
				<li className="nav-item">
					<Link to="/settings" className="nav-link text-white">
						Settings
					</Link>
				</li>
			</ul>
		);
	}
}
