import React, {Component} from 'react'
import Message from './Message';

export default class MessageList extends Component {
    render() {
        return (
            <div className="messagelist-spacing col-md-8">
                {/* TODO: fix inline box */}
                <div className="d-inline-flex align-items-end p-2">
                    <h2>{this.props.guildName}</h2>
                    <h4>&nbsp;&nbsp;#{this.props.channelName}</h4>
                </div>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <tbody>
                            {
                            this.props.messages ? 
                            this.props.messages.map((msg, index) => 
                                <Message message={msg} emojis={this.props.emojis} key={msg.id}/>)
                            :""
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}
