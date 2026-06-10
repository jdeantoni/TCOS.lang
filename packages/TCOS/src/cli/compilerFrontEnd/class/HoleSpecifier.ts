import { TypedElement } from "./TypeElement.js";

export class HoleSpecifier{

    startingParticipants: TypedElement[] = [];
    terminatingParticipants: TypedElement[] | undefined = []; //if undefined -> semi hole

    constructor(startingParticipants: TypedElement[], terminatingParticipants: TypedElement[] | undefined) {
        this.startingParticipants = startingParticipants;
        this.terminatingParticipants = terminatingParticipants;
    }
   
}

export class CollectionHoleSpecifier extends HoleSpecifier{

    constructor(startingParticipants: TypedElement[], terminatingParticipants: TypedElement[] | undefined) {
        super(startingParticipants, terminatingParticipants);
    }

    isSequential: boolean = true;
    parallelSyncPolicy: string = "lastOF";
    
}