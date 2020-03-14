import { TypeMessageAttachment, TypeMessage } from "../../../types/discord-bot-admin-types";
import React from 'react';


const Video = (video:TypeMessageAttachment) => {
    const height = video.height<300 ? video.height : 300
    return(
        <iframe title={video.filename} src={video.proxyURL} width={450} height={height}></iframe>
    )
}

const Image = (image:TypeMessageAttachment) => {
    const height = image.height<300 ? image.height : 300
    return (
        <img src={image.url?image.url:image.proxyURL} alt={image.filename} style={{height:height}}></img>
    )
}

const Attachment = (attachment:TypeMessageAttachment) => {
    const name = attachment.filename;
    const imageRegex = /\.jpg|\.png|\.jpeg|\.gif/g
    const videoRegex = /\.mov|\.mp4|\.ts|\.wmv|\.flv/g
    const imageArr = name.match(imageRegex);
    const videoArr = name.match(videoRegex);
    if(imageArr !== null){
        return(<Image {...attachment}/>)
    } else if(videoArr !== null ){
        return(<Video {...attachment}/>)
    } else {
    return(<a href={attachment.filename}>{attachment.filename}</a>)
    }
}

const Attachments = (attachments:Array<TypeMessageAttachment>) => {
    let attArray = new Array<JSX.Element>();
    attachments.forEach((attachment)=>{
    attArray.push(<Attachment key={`attachment-${attachment.id}`} {...attachment}/>);
    })
    return attArray;
}

export function hasAttachment(message: TypeMessage){
    if(message.attachments.length>0){
        return true;
    }
    return false;
}

export default Attachments;