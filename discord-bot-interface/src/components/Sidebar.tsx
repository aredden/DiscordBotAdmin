import React, {Component} from 'react'
import { TypeGuild, TypeTextChannel } from '../types/discord-bot-admin-types';

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
            <nav className="col-md-2 pr-0 shadow-lg navbar-default navbar-dark bg-dark sidebar">
                <div className="sidebar-sticky pr-0 mr-0">
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <div className={`nav-link text-${ready?"warning":"danger"}`}>
                                <span data-feather="home"></span>
                                {loginText}
                                <span className="sr-only">(current)</span>
                            </div>
                            <hr/>
                        </li>
                        <li className="nav-item">
                            <h5
                                className="sidebar-heading d-flex 
                                    justify-content-between
                                    align-items-center px-4 mt-1 mb-1"  
                                    style={headingColor}>
                                <span>Servers</span>
                            </h5>
                            <hr/>
                        </li>
                        { guildList ? Object.values(guildList).map((guild) => {
                            return (
                                <li className="nav-item btn btn-dark d-flex justify-content-start py-0" 
                                    onClick={(e)=>onSwitchGuild(e,guild.name)} key={guild.id}>
                                    <div className="nav-link " key={guild.id}>
                                        <span data-feather="file" 
                                              key={guild.id}>
                                            <div className="display-block m-1 text-truncate text-white">
                                                {guild.name}
                                            </div>
                                        </span>
                                    </div>
                                </li>
                            )}) : ""
                        }
                    </ul>
                    <li>
                        <hr/>
                        <h5 className="sidebar-heading d-flex justify-content-between
                                align-items-center px-4 mt-3 mb-1" style={headingColor}>
                            <span>
                                {guildName ? guildName : "Waiting..."}
                            </span>
                        </h5>
                        <hr/>
                    </li>
                    <ul className="nav flex-column mb-2">
                        { guildChannels ? Object.values(guildChannels).map((channel) => {
                            let num = notifications[guildName+channel.name]
                                return (
                                    <li className="nav-item d-flex justify-content-start btn btn-dark py-0" 
                                        onClick={(e)=>onSwitchChannel(e,channel.name)} key={channel.id}>
                                        <div className="nav-link"
                                            key={channel.id}>
                                            <div className="d-flex display-inline">
                                                <div className="text-truncate text-white" style={{fontSize:16 ,maxWidth:"9rem"}}>
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
                                )
                            }): ""
                        }
                    </ul>
                </div>
            </nav>
        )
    }
}

const headingColor = {
    color:'#aafaaf'
}


