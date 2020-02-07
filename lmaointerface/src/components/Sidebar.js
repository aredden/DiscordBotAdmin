import React, {Component} from 'react'

export default class Sidebar extends Component {
    render() {
        let loginText;
        if (this.props.ready) {
            loginText = "Logged In"
        } else {
            loginText = "Not Logged In"
        }
        return (
            <nav classname="col-md-2 d-none d-md-block bg-light sidebar">
                <div classname="sidebar-sticky">
                    <ul classname="nav flex-column">
                        <li classname="nav-item">
                            <a href="/" classname="nav-link">
                                <span data-feather="home"></span>
                                {loginText}
                                <span classname="sr-only">(current)</span>
                            </a>
                        </li>
                        <li classname="nav-item">
                            <h6
                                classname="sidebar-heading d-flex justify-content-between
                                        align-items-center px-1 mt-4 mb-1 text-muted">
                                <span>Servers</span>
                            </h6>
                        </li>
                        {
                            this.props.guildList ? Object.values(this.props.guildList).map((guild) => 
                                {
                                return (
                                    <li classname="nav-item" key={guild.id}>
                                        <a href="/" classname="nav-link text-bold" key={guild.id}>
                                            <span data-feather="file" key={guild.id}>
                                                {guild.name}
                                            </span>
                                        </a>
                                    </li>
                                )}
                            ) : ""
                        }
                    </ul>
                    <h6 classname="sidebar-heading d-flex justify-content-between
                            align-items-center px-1 mt-4 mb-1 text-muted">
                        <span>
                            {this.props.guildName ? this.props.guildName : "Waiting..."}
                        </span>
                    </h6>
                    <ul classname="nav flex-column mb-2">
                        {this.props.guildChannels
                            ? Object.values(this.props.guildChannels).map((channel) => {
                                    return <li classname="nav-item" key={channel.id}>
                                        {/* eslint-disable-next-line */}
                                        <a classname="nav-link" href="#"onClick={(e)=>this.props.onSwitchChannel(e,channel.name)} key={channel.id}>
                                            <span data-feather="file-text" key={channel.id}></span>
                                            {channel.name}
                                        </a>
                                    </li>
                                })
                            : ""
                        }
                    </ul>
                </div>
            </nav>
        )
    }
}