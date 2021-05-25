export declare class Column {
  length: number;
  private key;
  private data;
  constructor(key: string, data: string[]);
  getKey(): string;
  getData(): string[];
  getDataByIndex(idx: number): string | null;
  private hasDataIndex;
}
//# sourceMappingURL=column.d.ts.map
