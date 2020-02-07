import React, {Component} from 'react'
import { TypeGuild, TypeTextChannel } from '../types/lmaotypes';

type TypeSidebar = {
    ready:boolean,
    guildList:Map<string,TypeGuild>,
    guildName:string
    guildChannels:Map<string,TypeTextChannel>,
    onSwitchChannel:(e:React.MouseEvent,newChannelName:string)=>any,
}

export default class Sidebar extends Component<TypeSidebar,{}> {
    render() {
        let loginText:string;
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
                            <div className="nav-link">
                                <span data-feather="home"></span>
                                {loginText}
                                <span className="sr-only">(current)</span>
                            </div>
                        </li>
                        <li className="nav-item">
                            <h6
                                className="sidebar-heading d-flex justify-content-between justify-content-center
                                        align-items-center px-1 mt-4 mb-1 text-muted">
                                <span>Servers</span>
                            </h6>
                        </li>
                        {
                            this.props.guildList ? Object.values(this.props.guildList).map((guild) => 
                                {
                                return (
                                    <li className="nav-item d-flex justify-content-start btn btn-light" key={guild.id}>
                                        <div className="nav-link text-bold" key={guild.id}>
                                            <span data-feather="file" key={guild.id}>
                                                {guild.name}
                                            </span>
                                        </div>
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
                                    return <li className="nav-item d-flex justify-content-start btn btn-light" key={channel.id}>
                                        <div className="nav-link " onClick={(e)=>this.props.onSwitchChannel(e,channel.name)} key={channel.id}>
                                            <span data-feather="file-text" key={channel.id}></span>
                                            {channel.name}
                                        </div>
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