import { TypeMessageAttachment, TypeMessage } from "../../../types/lmaotypes";
import React from 'react';

type TypeImage = {
    height:number,
    width:number,
    url:string,
    proxyURL:string,
    filename:string
    filesize:number
}

const Video = (video:TypeMessageAttachment) => {
    const height = video.height<400 ? video.height : 400
    return(
        <embed src={video.proxyURL} width="540" height="450"></embed>
    )
}

const Image = (image:TypeMessageAttachment) => {
    const height = image.height<400 ? image.height : 400
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
        return(<a href={attachment.filename}/>)
    }
}

const Attatchments = (attachments:Array<TypeMessageAttachment>) => {
    let attArray = new Array<JSX.Element>();
    attachments.forEach((attachment)=>{
    attArray.push(<Attachment {...attachment}/>);
    })
    return attArray;
}

export function hasAttachment(message: TypeMessage){
    if(message.attachments.length>0){
        return true;
    }
    return false;
}

export default Attatchments;