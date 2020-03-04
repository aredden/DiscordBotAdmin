import {Component} from "react";
import React from 'react';
import {Link} from 'react-router-dom';
export default class Nav extends Component {

    render() {
        return (
            <ul className="nav navbar-dark bg-dark fixed-top p-0 shadow">
                <Link to="/" className="navbar-brand pl-3 pr-5 mr-10">LmaoBot.js</Link>
                <li className="nav-item">
                    <Link to="/commands" className="nav-link text-white" >Commands</Link>
                </li>
                <li className="nav-item">
                    <Link to="/admin" className="nav-link text-white" >Admin</Link>
                </li>
                <li className="nav-item">
                    <Link to="/settings" className="nav-link text-white" >Settings</Link>
                </li>
            </ul>
        )
    }
}
