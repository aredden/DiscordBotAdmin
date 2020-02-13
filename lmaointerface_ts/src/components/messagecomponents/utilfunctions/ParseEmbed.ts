import React from 'react';
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown';
const matcherText:RegExp = /\[.*\]/g;
const matcherTooltip:RegExp = /'[^]*'/g;
const matcherLink:RegExp = /http\S*/g;


export function parseRichText(str:string){
    const richtext = richTextFromMarkdown(str);
    const components = documentToReactComponents(richtext);
    return components;
}

export function containsLink(str:string){
    let resultsLink:RegExpMatchArray = str.match(matcherLink)
    return resultsLink.length !== 0
}



export function linkMatcher(str:string) {
    let resultsText:RegExpMatchArray = str.match(matcherText)
    let resultsLink:RegExpMatchArray = str.match(matcherLink)
    let resultsTooltip:RegExpMatchArray = str.match(matcherTooltip)
    if (resultsLink === null || resultsLink.length === 0){
        return undefined;
    }
    return ({
        text:resultsText?resultsText[0]:undefined,
        link:resultsLink?resultsLink[0]:undefined,
        tooltip:resultsTooltip?resultsTooltip[0]:undefined
    })
}