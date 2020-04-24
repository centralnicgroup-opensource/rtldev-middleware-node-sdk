import { Response } from "./response";

/**
 * Logger class
 */
export class Logger {
    /**
     * output/log given data
     * @param post request string used
     * @param r Response object
     * @param error error message or null
     * @return current Logger instance for method chaining
     */
    public log(post: string, r: Response, error: string | null = null): Logger {
        console.dir(r.getCommand());
        console.log(post);
        if (error) {
            console.error(`HTTP communication failed: ${error}`);
        }
        console.log(r.getPlain());
        return this;
    }
}
