import React, { Component } from 'react'
import { TypeEmbed, TypeMessageEmbedField, TypeEmoji } from '../../types/lmaotypes'
import '../../css/Callout.css';
import { parseContent } from './utilfunctions/ParseContent';
const inlineCSS:string = "list-inline-item";

export default class Embed extends Component <{embed:TypeEmbed, emojiMap:Map<string,TypeEmoji>},{}>{


    constructor(props:{embed:TypeEmbed, emojiMap:Map<string,TypeEmoji>}) {
        super(props)
        this.linkMatcher = this.linkMatcher.bind(this);
        this.parseTypeRich = this.parseTypeRich.bind(this);
    }

    linkMatcher(str:string){
        const matcherText:RegExp = /\[.*\]/g;
        const matcherTooltip:RegExp = /'[^]*'/g;
        const matcherLink:RegExp = /http\S*/g;
        let resultsText:RegExpMatchArray = str.match(matcherText)
        let resultsLink:RegExpMatchArray = str.match(matcherLink)
        let resultsTooltip:RegExpMatchArray = str.match(matcherTooltip)
        if (resultsLink === null || resultsLink.length === 0){
            return "";
        }
        if (resultsText.length !== 0){
            if(resultsTooltip.length !== 0){
            return <a href={resultsLink[0]} 
                      data-toggle="tooltip"
                      data-placement="top"
                      title={resultsTooltip[0]}>
                        {resultsText[0]}
                    </a>
            }
            return <a href={resultsLink[0]}>{resultsText[0]}</a>
        }
        return <a href={resultsLink[0]} ></a>
    }

    parseTypeRich():Array<JSX.Element> {
        let {fields} = this.props.embed;
        let {emojiMap} = this.props;
        let fieldArray:Array<JSX.Element> = [];
        fields.forEach((field)=>{
            let {inline, name, value} = field;
                value = value.replace("\n"," \n ")
                let valArray:Array<string>=parseContent(value,emojiMap);
                valArray = valArray.filter(i=>i!==""&&i!==" ")
                const result = valArray.join(" ")
                fieldArray.push(
                    <li className={inline ? inlineCSS +"p-1" : "p-1"}>
                        {name ?<h5>{name}</h5>:""}
                        {value ? result :""}
                    </li>
                )
        })
        return fieldArray
    }

    render() {
        const {
            type,
            hexColor,
            title,
            description
        } = this.props.embed;

        console.log(this.props)
        const calloutStyle = hexColor?{borderLeftColor:hexColor}:{};
        const lead = description ? <i className="text-muted">{description}</i>:"";
        if(type ==='rich'){
            return (
                <ul className="list-inline bd-callout" >
                {title ? <h4>{title}</h4>:""}
                {lead}
                    {this.parseTypeRich()}
                </ul>
            )
        }
        return <ul></ul>
    }
}