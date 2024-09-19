export const ResponseParser: any = {
  /**
   * Method to parse plain API response into js object
   * @param raw API plain response
   * @returns API response as JS Object (hash)
   */
  parse: (raw: string): any => {
    const hash: any = {};
    const regexp = /^([^=]*[^\t= ])[\t ]*=[\t ]*(.*)$/;
    const r = raw.replace(/\r\n/g, "\n").split("\n");
    while (r.length) {
      const row = r.shift();
      let m;
      if (row) {
        m = row.match(regexp);
        if (m) {
          const mm = m[1].match(/^property\[([^\]]*)\]/i);
          if (mm) {
            if (!Object.prototype.hasOwnProperty.call(hash, "PROPERTY")) {
              hash.PROPERTY = {};
            }
            mm[1] = mm[1].toUpperCase().replace(/\s/g, "");
            if (!Object.prototype.hasOwnProperty.call(hash.PROPERTY, mm[1])) {
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
  },
};
