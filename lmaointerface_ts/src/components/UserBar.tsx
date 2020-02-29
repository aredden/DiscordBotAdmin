

import React, { Component } from 'react'
import { TypeGuildMember } from '../types/lmaotypes'
import moment from 'moment'


type TypeUserBar = {
    members:MemberMap
}

type MemberMap = Map<string,TypeGuildMember>

export default class UserBar extends Component<TypeUserBar,{selectedUser:TypeGuildMember}> {
    constructor(props:TypeUserBar){
        super(props)
        this.state = {
            selectedUser:undefined
        }
        this.handleSelectUser = this.handleSelectUser.bind(this);
    }

    handleSelectUser(e,user:TypeGuildMember){
        this.setState({selectedUser:user});
    }

    render() {
        const { members } = this.props;
        return (
                <div className="col-md-2  d-none d-md-block bg-light">
                    <UserModal member={this.state.selectedUser}></UserModal> 
 
                <nav className="userbar">
                    
                    <div className="userbar-sticky">
                        <ul className="nav flex-column">
                            {
                                members ? Object.values(members)
                                .filter(member=>member.presence.status!=="offline")
                                .sort((
                                    memberA:TypeGuildMember,
                                    memberB:TypeGuildMember)=>
                                    memberB.highestRole.position-memberA.highestRole.position)
                                .map((member:TypeGuildMember)=>{
                                    return(Member(member,this.handleSelectUser))
                                }):"Guild has no members"
                            }
                            <p>Offline</p>
                            {
                                members ? Object.values(members)
                                .filter(member=>member.presence.status==="offline")
                                .sort((
                                    memberA:TypeGuildMember,
                                    memberB:TypeGuildMember)=>
                                    memberB.highestRole.position-memberA.highestRole.position)
                                .map((member:TypeGuildMember)=>{
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
            &nbsp;
            <img className="rounded" src={user.user.avatarURL} alt={user.user.avatar} style={{maxHeight:"35px"}}></img>
            &nbsp;
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
            return<div></div>
    }
}

