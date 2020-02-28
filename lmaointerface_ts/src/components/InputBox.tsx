import React, { Component, ChangeEvent, FormEvent, MouseEvent } from 'react'
import { EmojiMap, TypeEmoji } from '../types/lmaotypes';
import { TypeInputBox } from '../types/lmao-react-types';
import { Fade, Popper} from '@material-ui/core';
import { isNullOrUndefined } from 'util';

export default class InputBox extends Component<TypeInputBox,{content:string, colonMatch:string}> {

    constructor(props:TypeInputBox){
        super(props)
        this.state = {
            content:"",
            colonMatch:null
        }
        this.handleEmojiChoose = this.handleEmojiChoose.bind(this);
        this.handleEmojiChooseNoEvent = this.handleEmojiChooseNoEvent.bind(this);
        this.destroyAutoCompletePopper = this.destroyAutoCompletePopper.bind(this);
    }

    handleEmojiChooseNoEvent(emojiTag:string){
        const {colonMatch, content} = this.state
        this.setState({
            content:content.replace(colonMatch,"")+emojiTag+" ",
            colonMatch:null
        })
        document.getElementById("input-text-box").focus()
    }

    destroyAutoCompletePopper(){
        this.setState({colonMatch:null});
    }

    handleUpPress(e){
        if((e.key==="ArrowUp" || e.key==="Tab")&&!isNullOrUndefined(document.getElementById('transitions-popper-autocomplete'))){
            document.getElementById('emojiautocomplete-0').focus();
        }
    }

    handleEmojiChoose(e:MouseEvent,emojiTag:string){
        document.getElementById("input-text-box").focus();
        if(e){e.preventDefault();}
        this.setState({content:this.state.content+emojiTag+" "})
    }

    handleChange = (event:ChangeEvent<HTMLInputElement>) => {
        const colonMatch = event.target.value.match(/:\w{1,}$/g);
        this.setState({
            content:event.target.value,
            colonMatch:colonMatch?colonMatch[0]:null
        })
    }

    handleSubmit = (event:FormEvent) => {
        event.preventDefault();
        const {sendFunction, guildID, channelID } = this.props;
        const { content } = this.state;
        
        sendFunction(guildID,channelID,content);
        this.setState({content:""})
    }

    render() {
        const {emojis} = this.props;
        const {colonMatch} = this.state;
        if(emojis){
            let popoverData = {
                emojis:emojis,
                onChoose:this.handleEmojiChoose,
            }
            let regex = colonMatch ? new RegExp(`^${colonMatch.replace(":","")}`,"g") : /^noword/;
            let autoCompleteData = {
                emojis:Object.values(emojis)
                    .filter((emoji:TypeEmoji)=>
                        emoji.name.match(regex)!==null
                    ),
                onChoose:this.handleEmojiChooseNoEvent,
                colonMatch:this.state.colonMatch,
                destroyPopper:this.destroyAutoCompletePopper
            }
        return (
                <form className="input-group mb-3" onSubmit={(e)=>this.handleSubmit(e)}>
                    <input type="text" 
                        className="form-control" 
                        placeholder="Message" 
                        aria-label="Message"
                        id="input-text-box"
                        aria-describedby="basic-addon1"
                        value={this.state.content}
                        onKeyDown={this.handleUpPress}
                        onChange={this.handleChange}/>
                    <EmojiAutoComplete {...autoCompleteData}/>
                    <EmojiChooser {...popoverData}/>
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="submit" >Send</button>
                    </div>
                </form>
        )}
        return(<div></div>)
    }
}

type EmojiAutoCompleteProps={
    emojis:TypeEmoji[],
    onChoose:(emojiTag:string)=>any,
    colonMatch:string,
    destroyPopper:()=>any,
}

class EmojiAutoComplete extends Component<EmojiAutoCompleteProps,{index:number}>{

    constructor(props){
        super(props)
        this.state = {
            index:null
        }
        this.handleKeyboardEvent = this.handleKeyboardEvent.bind(this);
    }

    handleKeyboardEvent = (event, idx) => {
        let {emojis, onChoose} = this.props;
        let {index} = this.state;
        switch(event.key){
            case "ArrowUp":
                event.preventDefault();
                if(idx+1<emojis.length){
                    document.getElementById(`emojiautocomplete-${idx+1}`).focus()
                }else document.getElementById(`emojiautocomplete-${0}`).focus();
                break;
            case "ArrowDown":
                event.preventDefault();
                if(idx-1>=0){
                    document.getElementById(`emojiautocomplete-${idx-1}`).focus()
                }else document.getElementById(`emojiautocomplete-${emojis.length-1}`).focus()
                break;
            case "Enter":
                event.preventDefault();
                onChoose(`<:${emojis[idx].name}:${emojis[idx].id}>`)
                break;
            case "Escape":
                event.preventDefault();
                this.props.destroyPopper();
                break;
            case "Backspace":
                event.preventDefault();
                this.props.destroyPopper();
                break;
            default:
                break;
        }
    }

    render(){
    const open = Boolean(this.props.emojis.length>0);

    const id = open ? 'transitions-popper-autocomplete' : undefined;
    return(
            <Popper className="container col-md-3 card bg-light p-3" id={id} open={open} 
                    anchorEl={document.getElementById('input-text-box')} 
                    placement="top-start" transition>
            {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                {EmojiNames(this.props.emojis,this.handleKeyboardEvent)}
                </Fade>
            )}
            </Popper>
        )
    }
}

const EmojiNames = (emojis:TypeEmoji[], handleKeyboardEvent:(event, index:number)=>void) => {
    return(
        <form className="form-control col" onSubmit={e=>{e.stopPropagation();e.preventDefault()}}>
            <div className="card-title text-bold"><strong>Emojis</strong></div>
            {emojis.map((emoji,idx)=>{
                return <button onKeyDown={e=>handleKeyboardEvent(e,idx)} 
                               className="form-control btn btn-light d-flex justify-content-start" 
                               key={`emojiautocomplete-${idx}`}
                               tabIndex={idx+1}
                               id={`emojiautocomplete-${idx}`}>
                                   &nbsp;{Icon(`emojiautocomplete-icon-${idx}`,emoji)}&nbsp;{emoji.name}
                        </button>
            }).reverse()}
        </form>
    )
}


function EmojiChooser({emojis,onChoose}) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event:MouseEvent<any,any>) => {
      document.getElementById("input-text-box").focus();
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
              {EmojiWindow(emojis,onChoose,4)}
            </Fade>
          )}
        </Popper>

      </div>
    );
  }




const EmojiWindow = (emojis:EmojiMap,emojiChooser:(e:MouseEvent,emojiTag:string)=>void,columns:number) => {
    return(
        <div>
            {Object.values(emojis).map((emoji,idx)=>{
                let returnElement:JSX.Element = EmojiIcon(emoji.id,emoji,emojiChooser);
                let breakElement:JSX.Element=<br/>;
                if((idx+1)%columns===0 && idx!==0){
                    return([returnElement,breakElement])
                }
                return(returnElement)
            })}
        </div>
    )
}

function EmojiIcon(id:string, emoji:TypeEmoji,emojiChooser:(e:MouseEvent,emojiTag:string)=>any){
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

function Icon(id, emoji){
    return(
        <img
        draggable={false}
        style={{height:"25px",width:"25px"}}
        alt={`<:${emoji.name}:${emoji.id}>`}
        title={emoji.name}
        src={`http://cdn.discordapp.com/emojis/${emoji.id}`}
        key={`emoji-${id}-${Date.now()}`}
    />
    )
}