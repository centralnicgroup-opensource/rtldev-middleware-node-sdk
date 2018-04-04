export declare class ResponseIterator {
    rows: any[];
    index: number;
    constructor(rows: any[]);
    hasPrevious(): boolean;
    previous(): any;
    next(): any;
    hasNext(): boolean;
    rewind(): any;
    current(): any;
}
