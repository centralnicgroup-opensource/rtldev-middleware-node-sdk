/**
 * Column class
 */
export class Column {
    /**
     * count of column data entries
     */
    public length: number;
    /**
     * column key name
     */
    private key: string;
    /**
     * column data container
     */
    private data: string[];

    public constructor(key: string, data: string[]) {
        this.key = key;
        this.data = data;
        this.length = data.length;
    }

    /**
     * Get column name
     * @returns column name
     */
    public getKey(): string {
        return this.key;
    }

    /**
     * Get column data
     * @returns column data
     */
    public getData() {
        return this.data;
    }

    /**
     * Get column data at given index
     * @param idx data index
     * @returns data at given index
     */
    public getDataByIndex(idx: number): string | null {
        return this.hasDataIndex(idx) ? this.data[idx] : null;
    }

    /**
     * Check if column has a given data index
     * @param idx data index
     * @returns boolean result
     */
    private hasDataIndex(idx: number): boolean {
        return (idx >= 0 && idx < this.data.length);
    }
}
