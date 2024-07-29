/* The temporary values ​​that concern the execution of forks are stored in an Array of list(TempList). 
    Each TempList contains a number of elements that are values ​​returned by subtrees of a fork.

    We use the structure "an array of TempList" to store values ​​that we need during the execution of forks like lists of 
    values ​​returned by nodes of a subtree, lists of children of a ForkNode, functions that wait to be executed.

    This structure is like a stack. When we finish visiting a subtree, we pop an element (TempList).
*/


//a list contains data
export class TempList<DataType> {
    protected list : Array<DataType>;
    //protected length : number;

    constructor() {//number n is to fix the max number of the elements in the list
        this.list = new Array<DataType>();
        //this.length = n;
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
    addValue(n:DataType):void{
        let l:Array<DataType> = this.getList();
        l.push(n);
    }

    /*
    isWaiting():boolean{
        let n:number = this.getList().length;//the len of the list of the last TempValue
        let numberRequired:number = this.getLength();
        if( n < numberRequired){
            return true;
        }else{
            return false;
        }
    }*/
}

/*
export class TempValueList<DataType>{
    protected list : Array<TempValue<DataType>>;

    constructor(){
        this.list = new Array<TempValue<DataType>>;
    }

    last():TempValue<DataType>{
        let n = this.list.length;
        return this.list[n-1];
    }

    getList():TempValue<DataType>[]{
        return this.list;
    }

    //create a new TempValue for a subtree in the TempValueList
    reserveTempList(n:number):void{
        let c:TempValue<DataType> = new TempValue<DataType>(n);
        this.list.push(c);
    }

    //the list of the last element(TempValue) of the TempValueList
    getlastList():DataType[]{
        return this.last().getList();
    }

    //add a DataType value in the list of the last TempValue of the TempValueList
    addValueAtLastTempList(n:DataType):void{
        let l:Array<DataType> = this.getlastList();
        l.push(n);
    }

    //pop the last TempValue of the TempValueList
    reduce():void{
        this.list.pop();
    }
    
    //check if the number of the elements in a TempValue is less than the number we required
    isWaiting():boolean{
        let n:number = this.getlastList().length;//the len of the list of the last TempValue
        let numberRequired:number = this.last().getLength();
        if( n < numberRequired){
            return true;
        }else{
            return false;
        }
    }
}*/