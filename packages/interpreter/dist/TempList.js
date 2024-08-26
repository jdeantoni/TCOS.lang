"use strict";
/* The temporary values ​​that concern the execution of forks are stored in an Array of list(TempList).
    Each TempList contains a number of elements that are values ​​returned by subtrees of a fork.

    We use the structure "an array of TempList" to store values ​​that we need during the execution of forks like lists of
    values ​​returned by nodes of a subtree, lists of children of a ForkNode, functions that wait to be executed.

    This structure is like a stack. When we finish visiting a subtree, we pop an element (TempList).
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = void 0;
class Stack {
    capacity;
    storage = [];
    constructor(capacity = Infinity) {
        this.capacity = capacity;
    }
    push(item) {
        if (this.size() === this.capacity) {
            throw Error("Stack has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    }
    pop() {
        let element = this.storage.pop();
        if (element != undefined) {
            return element;
        }
        else {
            throw Error('Error : number of value');
        }
    }
    peek() {
        let element = this.storage[this.size() - 1];
        if (element != undefined) {
            return element;
        }
        else {
            throw Error('Error : number of value');
        }
    }
    size() {
        return this.storage.length;
    }
}
exports.Stack = Stack;
