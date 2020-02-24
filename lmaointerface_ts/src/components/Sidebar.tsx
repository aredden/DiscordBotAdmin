import React, {Component} from 'react'
import { TypeGuild, TypeTextChannel } from '../types/lmaotypes';

type TypeSidebar = {
    notifications:Map<string,number>,
    ready:boolean,
    guildList:Map<string,TypeGuild>,
    guildName:string,
    guildChannels:Map<string,TypeTextChannel>,
    onSwitchChannel:(e:React.MouseEvent,newChannelName:string)=>any,
    onSwitchGuild:(e:React.MouseEvent,newGuild:string)=>any
}

export default class Sidebar extends Component<TypeSidebar,{}> {
    render() {
        let { notifications, guildName, guildList, 
              guildChannels, onSwitchChannel, onSwitchGuild, 
              ready } = this.props;

        let loginText:string;
        if (ready) {
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
                            <h5
                                className="sidebar-heading d-flex 
                                    justify-content-between justify-content-center
                                    align-items-center px-4 mt-4 mb-1 text-muted">
                                <span>Servers</span>
                            </h5>
                        </li>
                        { guildList ? Object.values(guildList).map((guild) => {
                            return (
                                <li className="nav-item d-flex justify-content-start btn btn-light" 
                                    key={guild.id}>
                                    <div className="nav-link text-bold" key={guild.id}>
                                        <span data-feather="file" 
                                              onClick={(e)=>onSwitchGuild(e,guild.name)} 
                                              key={guild.id}>
                                            <div className="display-block m-1 text-truncate">
                                                {guild.name}
                                            </div>
                                        </span>
                                    </div>
                                </li>
                            )}) : ""
                        }
                    </ul>
                    <h5 className="sidebar-heading d-flex justify-content-between
                            align-items-center px-4 mt-4 mb-1 text-muted">
                        <span>
                            {guildName ? guildName : "Waiting..."}
                        </span>
                    </h5>
                    <ul className="nav flex-column mb-2">
                        { guildChannels ? Object.values(guildChannels).map((channel) => {
                            let num = notifications[guildName+channel.name]
                                return <li className="nav-item d-flex justify-content-start btn btn-light" 
                                           key={channel.id}>
                                    <div className="nav-link"
                                         onClick={(e)=>onSwitchChannel(e,channel.name)}
                                         key={channel.id}>
                                        <div className="d-flex display-inline">
                                            <div className="text-truncate" style={{maxWidth:"9rem"}}>
                                                { channel.name }
                                            </div>
                                            &nbsp;
                                            { num>0 ? <span 
                                                className="badge badge-secondary text-center" 
                                                style={{paddingTop:"5px"}}>{num}</span>
                                                :""
                                            }
                                        </div>
                                    </div>
                                </li>
                            }): ""
                        }
                    </ul>
                </div>
            </nav>
        )
    }
}