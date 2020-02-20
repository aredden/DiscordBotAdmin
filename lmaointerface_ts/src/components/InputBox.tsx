import React, { Component, ChangeEvent, FormEvent, MouseEvent, createRef } from 'react'
import { EmojiMap, TypeEmoji } from '../types/lmaotypes';
import 'popper.js';
import { TypeInputBox } from '../types/lmao-react-types';
import { Fade, Popper} from '@material-ui/core';

export default class InputBox extends Component<TypeInputBox,{content:string}> {
    constructor(props:TypeInputBox){
        super(props)
        this.state = {
            content:""
        }
        this.handleEmojiChoose = this.handleEmojiChoose.bind(this);
    }

    handleEmojiChoose(e,emojiTag:string){
        e.preventDefault()
        this.setState({content:this.state.content+emojiTag+" "})
    }

    handleChange = (event:ChangeEvent<HTMLInputElement>) => {
        this.setState({content:event.target.value})
    }

    handleSubmit = (event:FormEvent) => {
        event.preventDefault();
        const {sendFunction, guildID, channelID } = this.props;
        const { content } = this.state;
        sendFunction(guildID,channelID,content);
        this.setState({content:""})
    }

    render() {
        const {emojis} = this.props
        if(emojis){
            let popoverData = {
                emojis:emojis,
                onChoose:this.handleEmojiChoose
            }
        return (
                <form className="input-group mb-3" onSubmit={(e)=>this.handleSubmit(e)}>
                    <input type="text" 
                        className="form-control" 
                        placeholder="Message" 
                        aria-label="Message"
                        aria-describedby="basic-addon1"
                        value={this.state.content} 
                        onChange={this.handleChange}/>
                    <EmojiChooser {...popoverData}/>
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="submit" >Send</button>
                    </div>
                </form>
        )}
        return(<div></div>)
    }
}


function EmojiChooser({emojis,onChoose}) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleClick = event => {
      event.preventDefault();
      setAnchorEl(anchorEl ? null : event.currentTarget);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'transitions-popper' : undefined;
    return (
      <div className="input-group-append">
        <button className="btn btn-outline-info" aria-describedby={id} type="button" onClick={handleClick}>
          Emojis
        </button>
        <Popper className="row-sm-1 card bg-light p-3" id={id} open={open} anchorEl={anchorEl} placement="top" transition>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              {EmojiWindow(emojis,onChoose)}
            </Fade>
          )}
        </Popper>
      </div>
    );
  }


const EmojiWindow = (emojis:EmojiMap,emojiChooser:(e,emojiTag:string)=>void) => {
    return(
        <div>
            {Object.values(emojis).map((emoji,idx)=>{
                let returnElement:JSX.Element = EmojiIcon(emoji.id,emoji,emojiChooser);
                let breakElement:JSX.Element=<br/>;
                if((idx+1)%4===0 && idx!==0){
                    return([returnElement,breakElement])
                }
                return(returnElement)
            })}
        </div>
    )
}

function EmojiIcon(id:string, emoji:TypeEmoji,emojiChooser:(e,emojiTag:string)=>any){
    return(
        <button className="btn btn-light"onClick={(e)=>emojiChooser(e,`<:${emoji.name}:${emoji.id}>`)}>
            <img
                draggable={false}
                style={{height:"25px",width:"25px"}}
                alt={`<:${emoji.name}:${emoji.id}>`}
                title={emoji.name}
                src={`http://cdn.discordapp.com/emojis/${emoji.id}`}
                key={`emoji-${id}-${Date.now()}`}
            />
        </button>
    )
}