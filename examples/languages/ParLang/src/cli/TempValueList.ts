//type DataType = number | (() => Promise<void>);

export class TempValue<DataType> {
    list : Array<DataType>;
    length : number;

    constructor(n:number) {
        this.list = [];
        this.length = n;
    }

    last():DataType{
        let n = this.list.length;
        return this.list[n-1];
    }
}

export class TempValueList<DataType>{
    protected list : TempValue<DataType>[];
    protected length : number;

    constructor(){
        this.list = [];
        this.length = this.list.length;
    }

    last():TempValue<DataType>{
        return this.list[this.length-1];
    }

    getLength():number{
        return this.length;
    }

    getList():TempValue<DataType>[]{
        return this.list;
    }

    addTempValue(n:number):void{
        let c:TempValue<DataType> = new TempValue<DataType>(n);
        this.list.push(c);
        this.length ++;
    }

    addValueLast(n:DataType):void{
        let l = this.last();
        l.list.push(n);
    }

    reduce():void{
        this.list.pop();
        this.length--;
    }
    
    isWaiting():boolean{
        let last = this.last();
        let n = last.list.length;
        if( n < last.length){
            return true;
        }else{
            return false;
        }
    }
}


type NestedArray<T> = T | NestedArray<T>[];


export class StackTempList<T> {
  private items: NestedArray<T>[] = [];

  push(element: NestedArray<T>): void {
    this.items.push(element);
  }

  pop(): NestedArray<T> | undefined {
    return this.items.pop();
  }

  peek(): NestedArray<T> | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}