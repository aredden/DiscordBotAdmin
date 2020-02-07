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
            <nav className="col-md-2 d-none d-md-block bg-light sidebar">
                <div className="sidebar-sticky">
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <a href="/" className="nav-link">
                                <span data-feather="home"></span>
                                {loginText}
                                <span className="sr-only">(current)</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <h6
                                className="sidebar-heading d-flex justify-content-between
                                        align-items-center px-1 mt-4 mb-1 text-muted">
                                <span>Servers</span>
                            </h6>
                        </li>
                        {
                            this.props.guildList ? Object.values(this.props.guildList).map((guild) => 
                                {
                                return (
                                    <li className="nav-item" key={guild.id}>
                                        <a href="/" className="nav-link text-bold" key={guild.id}>
                                            <span data-feather="file" key={guild.id}>
                                                {guild.name}
                                            </span>
                                        </a>
                                    </li>
                                )}
                            ) : ""
                        }
                    </ul>
                    <h6 className="sidebar-heading d-flex justify-content-between
                            align-items-center px-1 mt-4 mb-1 text-muted">
                        <span>
                            {this.props.guildName ? this.props.guildName : "Waiting..."}
                        </span>
                    </h6>
                    <ul className="nav flex-column mb-2">
                        {this.props.guildChannels
                            ? Object.values(this.props.guildChannels).map((channel) => {
                                    return <li className="nav-item" key={channel.id}>
                                        <a className="nav-link" href="#"onClick={(e)=>this.props.onSwitchChannel(e,channel.name)} key={channel.id}>
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