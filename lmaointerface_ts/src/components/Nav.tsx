import {Component} from "react";
import React from 'react';
export default class Nav extends Component {
    
    // TODO
    handleSettingsClick = () => {

    }

    render() {
        return (
            <nav className="navbar navbar-dark fixed-top bg-dark p-0 shadow">
                <div className="navbar-brand col-sm-3 col-md-2 mr-0">LmaoBot.js</div>
                <ul className="navbar-nav px-3">
                    <li className="nav-item">
                        <div className="btn-group dropdown" >
                            <button type="button" tabIndex={-1} className="btn btn-light dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Settings
                            </button>
                            <div className="dropdown-menu" style={{overflow:"visible"}}>
                                <button className="dropdown-item" type="button">Action</button>
                                <button className="dropdown-item" type="button">Another action</button>
                                <button className="dropdown-item" type="button">Something else here</button>
                            </div>
                        </div>
                    </li>
                </ul>
            </nav>
        )
    }
}
