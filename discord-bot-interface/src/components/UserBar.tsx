

import React, { Component } from 'react'
import { TypeGuildMember } from '../types/discord-bot-admin-types'
import moment from 'moment'
import $ from "jquery"

type TypeUserBar = {
    members:MemberMap
}

type MemberMap = Map<string,TypeGuildMember>

const statusStyle = {marginTop:"1rem",marginBottom:"1rem",marginLeft:"2rem"};

export default class UserBar extends Component<TypeUserBar,{selectedUser:TypeGuildMember}> {
    constructor(props:TypeUserBar){
        super(props)
        this.state = {
            selectedUser:undefined
        }
        this.handleSelectUser = this.handleSelectUser.bind(this);
    }

    handleSelectUser(e,user:TypeGuildMember){
        e.preventDefault();
        this.setState({selectedUser:user},()=>
        $("#userModal").modal('show'))
    }

    render() {
        const { members } = this.props;
        let online:TypeGuildMember[] = new Array<TypeGuildMember>();
        let offline:TypeGuildMember[] = new Array<TypeGuildMember>();
        if(members) Object.values(members).forEach((member:TypeGuildMember)=>{
            member.presence.status === "offline" ? offline.push(member) : online.push(member);
        })

        return (
                <div className="col-md-2">
                    <UserModal member={this.state.selectedUser}></UserModal> 
                <nav className="userbar d-md-block bg-light">
                    <div className="userbar-sticky">
                        <ul className="nav flex-column">
                            <h5 style={statusStyle}><strong >Online</strong></h5>
                            {
                                members ? online
                                .sort((
                                    memberA:TypeGuildMember,
                                    memberB:TypeGuildMember) =>
                                    memberB.highestRole.position-memberA.highestRole.position)
                                .map((member:TypeGuildMember) => {
                                    return(Member(member,this.handleSelectUser))
                                }):"Guild has no members"
                            }
                            <h5 style={statusStyle}><strong>Offline</strong></h5>
                            {
                                members ? offline
                                .sort((
                                    memberA:TypeGuildMember,
                                    memberB:TypeGuildMember) =>
                                    memberB.highestRole.position - memberA.highestRole.position)
                                .map((member:TypeGuildMember) => {
                                    return(Member(member,this.handleSelectUser))
                                }):"Guild has no members"
                            }
                        </ul>
                    </div>
                </nav>
                </div>
        )
    }
}

function Member(user:TypeGuildMember,handleUserClick:(e,member:TypeGuildMember)=>any){
    const presence = PresenceParse(user.presence.status)
    return (
        <li className="nav-link d-flex justify-content-start 
            align-items-center btn btn-light"
            data-toggle="modal"
            data-target="#userModal"
            onClick={(e)=>handleUserClick(e,user)}>
            <span className={`badge badge-${presence}`} style={{height:"12px"}}>&nbsp;</span>
            <img className="rounded mx-2" src={user.user.avatarURL} alt={user.user.avatar} style={{maxHeight:"35px"}}></img>
            <strong style={{color:user.displayHexColor}}>
                {user.nickname? user.nickname : user.displayName}
            </strong>

        </li>
    )
}

function PresenceParse(status:String){
    switch(status){
        case "online":
            return "success"
        case "offline":
            return "dark"
        case "idle" :
            return "warning"
        case "dnd":
            return "danger"
        default:
            return "secondary"
    }
}

class UserModal extends Component<{member:TypeGuildMember}>{
    render(){
        const {member} = this.props;
        
        if(member)return(
            <div className="modal fade" 
                 id="userModal" 
                 role="dialog" 
                 aria-labelledby="userModallabel" 
                 tabIndex={-1}
                 aria-hidden="true">
                <div className="modal-dialog" 
                    role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                        <img className="rounded" src={member.user.avatarURL} alt={member.user.avatar} style={{maxHeight:"45px"}}></img>
                            <h5 className="modal-title" 
                                id="userModallabel"
                                style={{marginLeft:".5rem"}}>
                                    {member.displayName}'s User Info
                            </h5>
                            <button type="button" 
                                    className="close" 
                                    data-dismiss="modal" 
                                    aria-label="Close">
                                    <span aria-hidden="true">
                                        &times;
                                    </span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>
                                Status: { member.presence.status}
                            </p>
                            <p>
                                ID: { member.id}
                            </p>
                            <p>
                                Highest Role: { member.highestRole.name}
                            </p>
                            <p>
                                {`Mention: <@!${ member.user.id}>`}
                            </p>
                            <p>
                                {`Current Game: ${member.presence.game?member.presence.game.name:"None"}`}
                            </p>
                            <p>
                                {`Discord Birthday: ${moment(member.user.createdAt)}`}
                            </p>
                            <p>
                                {member.presence.clientStatus?`ClientStatus: \n
                                    ${member.presence.clientStatus.desktop? "   Desktop -- "+member.presence.clientStatus.desktop+"\n":""}
                                    ${member.presence.clientStatus.mobile? "    Mobile -- "+member.presence.clientStatus.mobile+"\n":""}
                                    ${member.presence.clientStatus.web? "   Web -- "+member.presence.clientStatus.web+"\n":""}
                                `:""}
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" 
                                    className="btn btn-secondary" 
                                    data-dismiss="modal">
                                    Close
                            </button>
                            <button type="button" 
                                    className="btn btn-primary">
                                    Save changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )
            return<div/>
    }
}

