import { HoleSpecifier } from "../class/HoleSpecifier.js";
import { TypedElement } from "../class/TypeElement.js";

export function isReferenceBased(participants: TypedElement[]): boolean {
    return participants.some(p => p.type != undefined && p.type[0] == "[")
}

export function isBroadcastReceptionParticipants(participants: TypedElement[]): boolean {
    return participants.length > 1 && participants.some(p => p.isBroadcast === true);
}

export function isParticipantCollectionBased(participant: TypedElement[]): boolean {
    for (const p of participant) {
        if (p.isCollection) {
            return true;
        }
    }
    return false;
}

/**
 * determines if the participant (TypedElement[]) is a Collection or not
 * @param p a list of typed elements
 * @returns 
 */
export function isACollectionHole(h: HoleSpecifier): boolean {
    return isParticipantCollectionBased(h.startingParticipants);
}

/**
 * determines if the participant (TypedElement[]) is a Timer or not
 * @param p a list of typed elements
 * @returns 
 */
export function isATimerHole(p: TypedElement[]): boolean {
    for (const element of p) {
        if (element.type === "Timer") {
            return true;
        }
    }
    return false;
}

export function areParticipantsEquals(p1: TypedElement[], p2: TypedElement[]): boolean {
    if(p1.length != p2.length){
        return false
    }
    for(let i = 0; i < p1.length; i++){
        if(p1[i].name != p2[i].name || p1[i].type != p2[i].type){
            return false
        }
    }
    return true
}

export function areParticipantsEqualsOrCoupled(p1: TypedElement[], p2: TypedElement[]): boolean {
    if(p1.length != p2.length){
        return false
    }
    for(let i = 0; i < p1.length-1; i++){
        if(p1[i].name != p2[i].name || p1[i].type != p2[i].type){
            return false
        }
    }
    
    if(p1[p1.length-1].type == "event" &&  p2[p2.length-1].type == "event"){
        if (p1.length == 1) {
            return p1[0].name == p2[0].name && p1[0].type == p2[0].type;
        }
        return true
    }

    return false
 
}

export function areParticipantsCoupled(p1: TypedElement[], p2: TypedElement[]): boolean {
    
    if(isParticipantCollectionBased(p1) && isParticipantCollectionBased(p2)){
        //sanitize collection based participants
        const p1Copy = []
        for(const p of p1){
            if(p.isCollection){
                p1Copy.push(p)
                break
            }
            p1Copy.push(p)
        }
        p1Copy.push(p1[p1.length-1])
        p1= p1Copy
        const p2Copy = []
        for(const p of p2){
            if(p.isCollection){
                p2Copy.push(p)
                break
            }
            p2Copy.push(p)
        }
        p2Copy.push(p2[p2.length-1])
        p2 = p2Copy
    }


    if(p1.length != p2.length){
        return false
    }
    for(let i = 0; i < p1.length-1; i++){
        if(p1[i].name != p2[i].name || p1[i].type != p2[i].type){
            return false
        }
    }
    if( p1.length > 1 &&
        ((p1[p1.length-1].name == "starts" &&  p2[p2.length-1].name == "terminates")
        ||
        (p1[p1.length-1].name == "terminates" &&  p2[p2.length-1].name == "starts"))
    ){
        return true
    }else{
        return false
    }
}