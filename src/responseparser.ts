/**
 * ResponseParser Module
 */
export namespace ResponseParser {

    /**
     * Method to parse plain API response into js object
     * @param raw API plain response
     * @returns API response as JS Object (hash)
     */
    export const parse = (raw: string): any => {
        const hash: any = {};
        const regexp = /^([^\=]*[^\t\= ])[\t ]*=[\t ]*(.*)$/;
        const r = raw.replace(/\r\n/g, "\n").split("\n");
        while (r.length) {
            const row = r.shift();
            let m;
            if (row) {
                m = row.match(regexp);
                if (m) {
                    const mm = m[1].match(/^property\[([^\]]*)\]/i);
                    if (mm) {
                        if (!hash.hasOwnProperty("PROPERTY")) {
                            hash.PROPERTY = {};
                        }
                        mm[1] = mm[1].toUpperCase().replace(/\s/g, "");
                        if (!hash.PROPERTY.hasOwnProperty(mm[1])) {
                            hash.PROPERTY[mm[1]] = [];
                        }
                        hash.PROPERTY[mm[1]].push(m[2].replace(/[\t ]*$/, ""));
                    } else {
                        hash[m[1].toUpperCase()] = m[2].replace(/[\t ]*$/, "");
                    }
                }
            }
        }
        return hash;
    };

    /**
     * Serialize given parsed response hash back to plain text
     * @param r API response as JS Object (hash)
     * @returns plain API response
     */
    export const serialize = (r: any): string => {
        let plain = "[RESPONSE]";
        if (r.hasOwnProperty("PROPERTY")) {
            Object.keys(r.PROPERTY).forEach((key) => {
                r.PROPERTY[key].forEach((val: string, index: number) => {
                    plain += `\r\nPROPERTY[${key}][${index}]=${val}`;
                });
            });
        }
        if (r.hasOwnProperty("CODE")) {
            plain += `\r\nCODE=${r.CODE}`;
        }
        if (r.hasOwnProperty("DESCRIPTION")) {
            plain += `\r\nDESCRIPTION=${r.DESCRIPTION}`;
        }
        if (r.hasOwnProperty("QUEUETIME")) {
            plain += `\r\nQUEUETIME=${r.QUEUETIME}`;
        }
        if (r.hasOwnProperty("RUNTIME")) {
            plain += `\r\nRUNTIME=${r.RUNTIME}`;
        }
        plain += "\r\nEOF\r\n";
        return plain;
    };
}
