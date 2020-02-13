import React from 'react'
import {DISC_EMOJI_CDN_URL} from '../../constants';
import { TypeEmoji } from '../../types/lmaotypes'
function Emoji(emoji:TypeEmoji) {
    const {
        name,
        id,
        url
    } = emoji

    return (
        <img src={url}
             alt={id} 
             key={`${id}-${name}`} 
             style={{height:"1.7rem"}} 
             data-toggle="tooltip" 
             data-placement="top" 
             title={name}/>
    )
}
export default Emoji

