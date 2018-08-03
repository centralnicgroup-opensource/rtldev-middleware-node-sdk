import { Record } from "./record";
export declare class RecordSet {
    private currentIndex;
    private records;
    constructor();
    addRecord(h: any): RecordSet;
    getLength(): number;
    getRecords(): Record[];
    getRecord(idx: number): Record | null;
    getCurrent(): Record | null;
    getPrevious(): Record | null;
    getNext(): Record | null;
    rewind(): RecordSet;
    private hasCurrent;
    private hasNext;
    private hasPrevious;
}
