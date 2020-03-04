
export function parseForNewline(text:string){
    let regex = new RegExp(/`/g)
    let inlineCodeRegex = new RegExp(/```/g)
    let textArray = text.split(/\n/)
    let result = textArray.reduce((prev,current)=>{
        let final = "";
        if(prev){
            let tripleArray = prev.match(inlineCodeRegex);
            let singlesArray = prev.match(regex)
            if(tripleArray && tripleArray.length%2!==0){
                final = prev+"\n"+current;
            }else if(singlesArray && singlesArray.length%2!==0){
                final = prev+" `++NEWLINE++` "+current;
            }else{
                final = prev+" ++NEWLINE++ "+current;
            }
        }else{
            final = current;
        }
        return final
    })
    return result;
}