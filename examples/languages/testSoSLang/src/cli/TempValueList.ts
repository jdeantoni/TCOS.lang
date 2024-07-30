/* The temporary values ​​that concern the execution of forks are stored in an Array of list(TempList). 
    Each TempList contains a number of elements that are values ​​returned by subtrees of a fork.

    We use the structure "an array of TempList" to store values ​​that we need during the execution of forks like lists of 
    values ​​returned by nodes of a subtree, lists of children of a ForkNode, functions that wait to be executed.

    This structure is like a stack. When we finish visiting a subtree, we pop an element (TempList).
*/

//a list contains data
export class TempList<DataType> {
    protected list : Array<DataType>;

    constructor() {//number n is to fix the max number of the elements in the list
        this.list = new Array<DataType>();
    }

    last():DataType{
        let n = this.list.length;
        return this.list[n-1];
    }

    getList():Array<DataType>{
        return this.list;
    }

    getLength():number{
        return this.getList().length;
    }
    addElement(n:DataType):void{
        let l:Array<DataType> = this.getList();
        l.push(n);
    }
}