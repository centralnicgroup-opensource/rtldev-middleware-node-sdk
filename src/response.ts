import * as defresponses from './defaultresponses';

export const responses = defresponses.responses;

export const pagerRegexp: RegExp = /^(TOTAL|FIRST|LAST|LIMIT|COUNT)$/;

export class ResponseIterator {
  rows: any[];
  index: number = 0;

  constructor(rows: any[]) {
    this.rows = rows;
  }

  public hasPrevious(): boolean {
    return (this.index > 0);
  }

  public previous(): any {
    return (this.hasPrevious() ? this.rows[--this.index] : null);
  }

  public next(): any {
    return (this.hasNext() ? this.rows[++this.index] : null);
  }

  public hasNext(): boolean {
    return (this.index < (this.rows.length - 1));
  }

  public rewind(): any {
    this.index = 0;
    return this.current();
  }
    
  public current(): any {
    return this.rows[this.index];
  }
};

/**
 * @alias node.ispapi-apiconnector.Response
 * @desc Used to handle the response of the 1API backend API Constructor
 * @param {String} p_r String specifying the unparsed plain API response
 * @param {Object} p_command the API command of that request
 * @constructor
 */
export class Response {
  usecolregexp: boolean;
  colregexp: RegExp = /\*/;
  data: any;
  cmd: any;
  it: ResponseIterator;

  constructor(p_r: any, p_command: any){
    p_r = ((!p_r || p_r === "") ? responses.empty : p_r);
    this.usecolregexp = false;
    this.data = {
      unparsed: p_r,
      parsed: parse(p_r)
    };
    this.cmd = Object.assign({}, p_command);
    this.it = new ResponseIterator(this.as_list().LIST || []);
  }

  /**
   * sets the columns to be available in the response
   * @param {String|Array} [arr] regexp or * to filter response columns
   */
  public useColumns(arr?: String | String[]) {
    this.usecolregexp = false;
    if (arr){
      if (Array.isArray(arr)){
        this.usecolregexp = true;
        this.colregexp = new RegExp("^(" + arr.join("|") + ")$", "i");
      }
      else if (arr!=='*'){
        this.usecolregexp = true;
        this.colregexp = new RegExp("^" + arr + "$", "i");
      }
    }
  };

  /**
   * resets the iterator to start value 0 and returns first row
   * @return {Object|null} iterator
   */
  public rewind() {
    return this.it.rewind();
  };

  /**
   * checks if next row can be iterared
   * @return {Boolean} returns true if next row can be iterated, false otherwise
   */
  public hasNext() {
    return this.it.hasNext();
  };

  /**
   * returns the row of the next iterator position
   * @return {Object|null} returns the row for the next iterator position
   */
  public next(): any {
    return this.it.next();
  };

  /**
   * checks if previous row can be iterated
   * @return {Boolean} returns true if prev. row can be iterated, false otherwise
   */
  public hasPrevious(): boolean {
    return this.it.hasPrevious();
  };

  /**
   * returns the row of the previous iterator position
   * @return {Object|null} returns the row for the previous iterator position
   */
  public previous(): any {
    return this.it.previous();
  };

  /**
   * returns the list row for the current iterator value
   * @return {Object} the current iterator row
   */
  public current(): any {
    return this.it.current();
  };

  /**
   * returns the property value of the response object if found
   * @param {String} p_prop String specifying the property for value lookup
   * @return {Object|String|Boolean} Object/String if property found and is of type Object/String, false otherwise
   */
  public get(p_prop: string): string | null {
    if (this.data.parsed.hasOwnProperty(p_prop))
      return this.data.parsed[p_prop];
    return null;
  };

  /**
   * return all values of the given column/property identifier
   * @param {String} p_prop String specifying the column/property identifier
   * @return {Array}        column values
   */
  public getColumn(p_prop: string): any {
    var p: any = this.data.parsed.PROPERTY;
    if (p && p.hasOwnProperty(p_prop)){
      return p[p_prop]; // return whole column
    }
    return false;
  };

  /**
   * return the value by given row index and column identifier
   * @param {String}  p_prop     String specifying the column identifier
   * @param {Integer} p_idx      Integer specifying the row index
   * @param {Boolean} p_cast_int Boolean integer cast the value [optional]
   * @return {String|Boolean} String if succeeded, Boolean (false) otherwise
   */
  public getColumnIndex(p_prop: string, p_idx: number, p_cast_int: boolean): any {
    const col = this.getColumn(p_prop);
    if (col && col[p_idx]){
      return ( p_cast_int ? parseInt(col[p_idx], 10) : col[p_idx] );
    }
    return false;
  };

  /**
   * Overridable method to apply custom changes to the API response
   * Note: Adding new keys to the object may be a valid change (but use it with caution)
   * @param  {Object} r the response object
   * @return {Object} the customized response
   */
  public applyCustomChanges(r: any): any {
    return r;
  };

  /**
   * return the unparsed API response
   * @return {String} unparsed API response
   */
  public as_string(): string {
    if (this.usecolregexp){
      return serialize(this.as_hash());
    }
    return this.data.unparsed;
  };

  /**
   * return the parsed API response
   * @return {Object} parsed API response
   */
  public as_hash(): any {
    let d: any;
    if (this.usecolregexp) {
      d = Object.assign({}, this.data.parsed);
      Object.keys(d.PROPERTY).forEach((key: string) => {
        if (!this.colregexp.test(key))
          delete d.PROPERTY[key];
      });
    }
    else d = this.data.parsed;
    return this.applyCustomChanges(d);
  };
  
  /**
   * return the parsed API response as list
   * @return {Object} parse API response in list format
   */
  public as_list(): any {
    let row2: any;
    let i: number;
    let count: number = 0;
    let keys: string[];
    const r = this.as_hash();
    const tmp: any = {};
    Object.keys(r).forEach( (key: string) => {
      if (key !== 'PROPERTY')
        tmp[key] = r[key];
    });
    if (r.CODE === "200") {
      tmp.LIST = [];
      if (r.PROPERTY) {
        keys = Object.keys(r.PROPERTY).filter((key: string) => {
          return !pagerRegexp.test(key); // paging info
        });
        keys.forEach((key: string) => {
          if (r.PROPERTY[key].length > count)
            count = r.PROPERTY[key].length;
        });
        for (i = 0; i < count; i++) { // run up to max index found
          row2 = {};
          // run over all columns (properties) found
          // NOTE: do not add column indexes that are not available
          // -- avoids blowing up response size
          // -- requires implementation of mechanisms to avoid access on
          // these not existing indexes later (not part of this lib!)
          keys.forEach((key: string) => {
            if (r.PROPERTY[key][i] !== undefined)
              row2[key] = r.PROPERTY[key][i];
          });
          tmp.LIST.push(Object.assign({}, row2));
        }
      }
      tmp.meta = {
        columns: this.columns(),
        pg: this.getPagination()
      };
    }
    return tmp;
  };

  /**
   * return the API response code
   * @return {String|null} API response code
   */
  public code(): string | null {
    return this.get("CODE");
  };

  /**
   * return the API response description
   * @return {String|null} API response description
   */
  public description(): string | null {
    return this.get("DESCRIPTION");
  };

  /**
   * return the API response PROPERTY Object
   * @return {Object} API response PROPERTY Object
   */
  public properties(): any {
    return this.get("PROPERTY");
  };

  /**
   * return the API response runtime
   * @return {Number} API response runtime
   */
  public runtime(): number | null {
    const rt = this.get("RUNTIME");
    return rt ? parseFloat(rt) : null;
  };

  /**
   * return the API response queuetime
   * @return {String} API response queuetime
   */
  public queuetime(): number | null {
    const qt = this.get("QUEUETIME");
    return qt ? parseFloat(qt) : null;
  };

  /**
   * check if the API response code stands for success
   * @return {Boolean} true if the API request succeeded, false otherwise
   */
  public is_success(): boolean {
    const code = this.get("CODE");
    return (code ? code.charAt(0) === '2' : false);
  };

  /**
   * check if the API response code stands for a temporary error
   * @return {Boolean} true if the API request run into a temp. error, false otherwise
   */
  public is_tmp_error(): boolean {
    const code = this.get("CODE");
    return (code ? code.charAt(0) === '4' : false);
  };

  /**
   * check if the API response code stand for an error
   * @return {Boolean} true if the API request failed, false otherwise
   */
  public is_error(): boolean {
    return !(this.is_success() || this.is_tmp_error());
  };
  
  /**
   * return the API response PROPERTY key names
   * @return {Array} API response PROPERTY key names
   */
  public columns(): string[] {
    const props = this.properties();
    if (props) {
      return Object.keys(props).filter((key: string) => {
        return !pagerRegexp.test(key);
      });
    }
    return [];
  };

  /**
   * return pagination meta data of the API response
   * @return {Object} pagination meta data
   */
  public getPagination(): any {
    return {
      FIRST: this.first(),
      LAST: this.last(),
      COUNT: this.count(),
      TOTAL: this.total(),
      LIMIT: this.limit(),
      PAGES: this.pages(),
      PAGE: this.page(),
      PAGENEXT: this.nextpage(),
      PAGEPREV: this.prevpage()
    };
  };

  /**
   * return the index of the first response entry
   * @return {Integer} index of the first response entry
   */
  public first(): number {
    return (this.getColumnIndex("FIRST", 0, true) || 0);
  };

  /**
   * return the count of items in the API list response
   * @return {Integer} count of items in the response
   */
  public count(): number {
    let c = this.getColumnIndex("COUNT", 0, true);
    let cols, i, max = 0;
    if (c === false) {
      c = 0;
      cols = this.columns();
      for (i = 0; i < cols.length; i++) {
        c = this.getColumn(cols[i]).length;
        if (c > max) max = c;
      }
      c = max;
    }
    return c;
  };

  /**
   * return the index of the last response entry
   * @return {Integer} index of the last response entry
   */
  public last(): number {
    return (this.getColumnIndex("LAST", 0, true) || this.count() - 1);
  };

  /**
   * @description return the count of items per page
   * @return {Integer} count of items per page
   */
  public limit(): number {
    return (this.getColumnIndex("LIMIT", 0, true) || this.count());
  };

  /**
   * return the count of the total items matching the API request
   * @return {Integer} count of total items matching the API request
   */
  public total(): number {
    return (this.getColumnIndex("TOTAL", 0, true) || this.count());
  };

  /**
   * return the count of result pages matching the request
   * @return {Integer} count of result pages matching the request
   */
  public pages(): number {
    const t = this.total();
    if (t) return Math.ceil(t / this.limit()); //will never be 0
    return 1;
  };

  /**
   * return the current page number
   * @return {Integer} current page number
   */
  public page(): number {
    if (this.count()) {
      //limit cannot be 0 as this.count() will cover this, no worries
      return Math.floor(this.first() / this.limit()) + 1;
    }
    return 1;
  };

  /**
   * return the previous page number
   * @return {Integer} previous page number
   */
  public prevpage(): number {
    return ((this.page() - 1) || 1);
  };
  
  /**
   * return the next page number
   * @return {Integer} next page number
   */
  public nextpage(): number {
    const page = this.page() + 1;
    const pages = this.pages();
    return (page <= pages ? page : pages);
  };
}

/**
 * convert unparsed plain API response string to object notation
 * @param {String}   p_r String specifying the unparsed API response
 * @return {Object}      Response in hash format
 */
export const parse = (r:any): any => {
  let m, mm;
  const hash: any = {};
  const regexp: RegExp = /^([^\=]*[^\t\= ])[\t ]*=[\t ]*(.*)$/;
  r = r.replace(/\r\n/g, '\n').split('\n');
  while (r.length) {
    m = (r.shift()).match(regexp);
    if (m) {
      mm = m[1].match(/^property\[([^\]]*)\]/i);
      if (mm) {
        if (!hash.hasOwnProperty("PROPERTY")) hash.PROPERTY = {};
        mm[1] = mm[1].toUpperCase().replace(/\s/g, '');
        if (!hash.PROPERTY.hasOwnProperty(mm[1])) hash.PROPERTY[mm[1]] = [];
        hash.PROPERTY[mm[1]].push(m[2].replace(/[\t ]*$/, ""));
      }
      else {
        hash[m[1].toUpperCase()] = m[2].replace(/[\t ]*$/, "");
      }
    }
  }
  if (!hash.hasOwnProperty("DESCRIPTION")) hash.DESCRIPTION = "";
  return hash;
}

/**
 * convert parsed plain API response to unparsed string notation
 * @param  {Object} p_r Object specifying the parsed API response
 * @return {String}     Response in unparsed plain text
 */
export const serialize = (p_r: any): string => {
  const r = Object.assign({}, p_r);
  let plain: string = "[RESPONSE]";
  if (r.hasOwnProperty("PROPERTY")) {
    Object.keys(r.PROPERTY).forEach(function(key) {
      r.PROPERTY[key].forEach((val:string, index:number) => {
        plain += "\r\nPROPERTY[" + key + "][" + index + "]=" + val;
      });
    });
  }
  if (r.hasOwnProperty("CODE")) plain += "\r\ncode=" + r.CODE;
  if (r.hasOwnProperty("DESCRIPTION")) plain += "\r\ndescription=" + r.DESCRIPTION;
  if (r.hasOwnProperty("QUEUETIME")) plain += "\r\nqueuetime=" + r.QUEUETIME;
  if (r.hasOwnProperty("RUNTIME")) plain += "\r\nruntime=" + r.RUNTIME;
  plain += "\r\nEOF\r\n";
  return plain;
}

/**
 * returns the default response templates
 * @return {Object}  default response templates
 */
export const getTemplates = (): defresponses.IResponseTemplates => {
  return responses;
};

/**
 * returns a default response template as parsed js object hash
 * @param {String} p_tplid the id of the template to return
 * @param {Boolean} p_parse flag to toggle the returned format. true: parsed, otherwise: unparsed
 * @return {Object|String|Boolean}  default response template of false if not found
 */
export const getTemplate = (p_tplid: string, p_parse: boolean): any => {
  if (responses[p_tplid])
    if (p_parse)
      return parse(responses[p_tplid]);
    else
      return responses[p_tplid];
  return false;
};

/**
 * check if the given response matches a default response template
 * @param  {Object} p_r given response
 * @param  {String} p_tplid given default template id
 * @return {Boolean}  the check result
 */
export const isTemplateMatch = (p_r: any, p_tplid: string): boolean => {
  var tpl = getTemplate(p_tplid, true);
  return (
    tpl &&
    p_r.CODE === tpl.CODE &&
    p_r.DESCRIPTION === tpl.DESCRIPTION
  );
};