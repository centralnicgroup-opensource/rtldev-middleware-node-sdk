export declare class ResponseTemplate {
    protected raw: string;
    protected hash: any;
    constructor(raw: string);
    getCode(): number;
    getDescription(): string;
    getPlain(): string;
    getQueuetime(): number;
    getHash(): any;
    getRuntime(): number;
    isError(): boolean;
    isSuccess(): boolean;
    isTmpError(): boolean;
    isPending(): boolean;
}
//# sourceMappingURL=responsetemplate.d.ts.map