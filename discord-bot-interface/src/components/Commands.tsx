import React, { Component } from 'react'
import Axios from 'axios'
import { CommandsState } from '../types/discord-bot-admin-react-types'


export default class Commands extends Component<{},CommandsState> {

    constructor(props){
        super(props)
        this.state = {
            mention:undefined,
            contains:undefined,
            startsWith:undefined,
            origin:"http://localhost:3001"
        }
    }
    
    componentDidMount(){
        Axios.get(this.state.origin+'/botcommands')
            .then((response)=>{
                return response.data
            })
            .then(({mention,startsWith,contains})=>{
                this.setState({
                    mention:mention,
                    startsWith:startsWith,
                    contains:contains
                })
            })
    }

    render() {
        return (
            <div className=" col-md-8 pt-5 mt-5">
                {this.state.contains ? Object.values(this.state.contains).join("\n") : ""}
            </div>
        )
    }
}
