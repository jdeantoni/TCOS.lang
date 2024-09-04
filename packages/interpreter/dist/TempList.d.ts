interface IStack<T> {
    push(item: T): void;
    pop(): T | undefined;
    peek(): T | undefined;
    size(): number;
}
export declare class Stack<T> implements IStack<T> {
    private capacity;
    private storage;
    constructor(capacity?: number);
    push(item: T): void;
    pop(): T;
    peek(): T;
    size(): number;
}
export {};
