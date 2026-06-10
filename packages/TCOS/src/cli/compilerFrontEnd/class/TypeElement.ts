import { AstNode } from "langium";

/**
 * a class representing a typed element
 * @param astNode the ast node of the element
 * @param name the name of the element
 * @param type the type of the element
 * @param isCollection a boolean indicating if the element is a collection
 * @function toJSON returns the element in json format
 * @function equals returns true if the element is equal to another element
 */
export class TypedElement {
    astNode: AstNode | undefined;
    name: (string | undefined);
    type: (string | undefined);
    isCollection: boolean;
    isBroadcast: boolean = false;

    constructor(astNode: AstNode | undefined, name: string | undefined, type: string | undefined, isCollection: boolean = false, isBroadcast: boolean = false) {
        this.astNode = astNode;
        this.name = name;
        this.type = type;
        this.isCollection = isCollection;
        this.isBroadcast = isBroadcast;
    }

    equals(other: TypedElement): boolean {
        return this.name == other.name && this.type == other.type;
    }

    toJSON() {
        return `{ "name": "${this.name}", "type": "${this.type}"}`;
    }
}
