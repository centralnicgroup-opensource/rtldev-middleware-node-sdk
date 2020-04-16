import { ResponseParser } from "./responseparser";
import { ResponseTemplateManager } from "./responsetemplatemanager";

/**
 * ResponseTemplate class
 */
export class ResponseTemplate {
    /**
     * plain API response
     */
    protected raw: string;
    /**
     * hash representation of plain API response
     */
    protected hash: any;

    /**
     * Constructor
     * @param raw plain API response
     */
    public constructor(raw: string) {
        if (!raw) {
            raw = ResponseTemplateManager.getInstance().getTemplate("empty").getPlain();
        }
        this.raw = raw;
        this.hash = ResponseParser.parse(raw);
        if (
            !Object.prototype.hasOwnProperty.call(this.hash, "CODE") ||
            !Object.prototype.hasOwnProperty.call(this.hash, "DESCRIPTION")
        ) {
            this.raw = ResponseTemplateManager.getInstance().getTemplate("invalid").getPlain();
            this.hash = ResponseParser.parse(this.raw);
        }
    }

    /**
     * Get API response code
     * @returns API response code
     */
    public getCode(): number {
        return parseInt(this.hash.CODE, 10);
    }

    /**
     * Get API response description
     * @returns API response description
     */
    public getDescription(): string {
        return this.hash.DESCRIPTION;
    }

    /**
     * Get Plain API response
     * @returns Plain API response
     */
    public getPlain(): string {
        return this.raw;
    }

    /**
     * Get Queuetime of API response
     * @returns Queuetime of API response
     */
    public getQueuetime(): number {
        if (this.hash.hasOwnProperty("QUEUETIME")) {
            return parseFloat(this.hash.QUEUETIME);
        }
        return 0.00;
    }

    /**
     * Get API response as Hash
     * @returns API response hash
     */
    public getHash(): any {
        return this.hash;
    }

    /**
     * Get Runtime of API response
     * @returns Runtime of API response
     */
    public getRuntime(): number {
        if (this.hash.hasOwnProperty("RUNTIME")) {
            return parseFloat(this.hash.RUNTIME);
        }
        return 0.00;
    }

    /**
     * Check if current API response represents an error case
     * API response code is an 5xx code
     * @returns boolean result
     */
    public isError(): boolean {
        return this.hash.CODE.charAt(0) === "5";
    }

    /**
     * Check if current API response represents a success case
     * API response code is an 2xx code
     * @returns boolean result
     */
    public isSuccess(): boolean {
        return this.hash.CODE.charAt(0) === "2";
    }

    /**
     * Check if current API response represents a temporary error case
     * API response code is an 4xx code
     * @returns boolean result
     */
    public isTmpError(): boolean {
        return this.hash.CODE.charAt(0) === "4";
    }

    /**
     * Check if current operation is returned as pending
     * @returns boolean result
     */
    public isPending(): boolean {
        return (this.hash.hasOwnProperty("PENDING")) ? this.hash.PENDING === "1" : false;
    }
}
