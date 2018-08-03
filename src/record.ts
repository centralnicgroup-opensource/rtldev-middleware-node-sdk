/**
 * Record class
 */
export class Record {
    /**
     * row data container
     */
    private data: any;

    /**
     * Constructor
     * @param data data object (use column names as object keys)
     */
    public constructor(data: any) {
        this.data = data;
    }

    /**
     * get row data
     * @returns row data
     */
    public getData(): any {
        return this.data;
    }

    /**
     * get row data for given column
     * @param key column key
     * @returns row data for given column or null if column does not exist
     */
    public getDataByKey(key: string): string | null {
        if (this.hasData(key)) {
            return this.data[key];
        }
        return null;
    }

    /**
     * check if record has data for given column
     * @param key column name
     * @returns boolean result
     */
    private hasData(key: string): boolean {
        return this.data.hasOwnProperty(key);
    }
}
