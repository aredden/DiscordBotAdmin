import { TypeMessageAttachment, TypeMessage } from "../../types/lmaotypes";

export function parseattachments(attachments:TypeMessageAttachment[]):HTMLElement[]{
return
}

export function hasattachment(message: TypeMessage){
    if(message.attachments.length>0){
        return true;
    }
    return false;
}