import React, { Component } from 'react'
import $ from 'jquery';
// function recursiveEmojiParser(emojis,strArray){
//     var done = false;
//     var checkString = strArray[strArray.length-1];
//     Object.values(emojis).forEach((emoji) => {
//         if(checkString.indexOf("<:"+emoji.identifier+">") !== -1){
//             checkstring = checkString.replace("<:"+emoji.identifier+">",`&&splithere&&url=${emoji.url}&&splithere&&`)
//             splitString = content.split("&&splithere&&")
//             return strArray.concat();

//         }
//     })
// }

export default class Message extends Component {

    render(){
        let {
            author,
            content,
            createdAt,
            member,
        } = this.props.message;
        const emojis = this.props.emojis;
        const dateString = Date(createdAt);
        var contentArray= [content];
        if(content.indexOf(":")!==-1){
            let foundEmoji = false;
            Object.values(emojis).forEach((emoji) => {
                if(content.indexOf("<:"+emoji.identifier+">")!==-1){
                    if(!foundEmoji){
                        contentArray = [];
                        foundEmoji=true;
                    }
                    content = content.replace("<:"+emoji.identifier+">",`&&splithere&&url=${emoji.url}&&splithere&&`);
                    content = content.substring(content.indexOf("<:"+emoji.identifier+">"),content.length)
                    content = content.replace("<:"+emoji.identifier+">","");
                    contentArray = content.split("&&splithere&&");
                    console.log(contentArray)
                }
            });
        }
        return (
            <tr className="shadow-sm">
                <td className="text-capitalize">{dateString.replace("GMT-0500 (Eastern Standard Time)","")}</td>
                <td style={{color:member.displayHexColor}}>{author.name}</td>
                <td id={this.props.message.id}>{

                    contentArray.map((element)=>{
                        console.log("element in array:"+element
                        +" index of url"+element.indexOf('url')
                        )
                        if(element.indexOf('url=') !== -1){
                            console.log("wtf is going on"+element)
                            element = element.replace("url=","");
                            return(<img src={element} style={{height:"1.7rem"}}/>)
                        }else{
                            return element;
                        }
                    })
                }</td>
            </tr>
        )
    }
}
