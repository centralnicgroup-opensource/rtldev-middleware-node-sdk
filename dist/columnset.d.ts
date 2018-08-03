import { Column } from "./column";
export declare class ColumnSet {
    private keys;
    private columns;
    constructor();
    addColumn(key: string, data: string[]): this;
    getColumn(key: string): Column | null;
    getColumns(): Column[];
    getColumnKeys(): string[];
    private hasColumn;
}
