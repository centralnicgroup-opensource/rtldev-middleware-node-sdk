import * as events from "events";
import * as clRequest from "./request";
import * as clResponse from "./response";

/**
 * @alias node.ispapi-apiconnector.Client
 * @desc Used to return 1API API Backend connections
 * @augments events.EventEmitter
 * @constructor
 */
export class Client extends events.EventEmitter {
  /**
   * method to be used for api requests AFTER login procedure
   * @param {Object} pcmd        API command to request
   * @param {Object} pcfg        the socket config
   * @param {Function} [pcb]     the callback method (success case)
   * @param {Function} [pcberr]  the callback method (error case)
   * @param {String} [ptype]     the response type format: hash or list
   */
  request(pcmd: any, pcfg: any, pcb: Function, pcberr: Function, ptype: string = 'hash') {
    if (!/^(hash|list)$/.test(ptype)){
      ptype = 'hash';
    }
    if (!pcfg) {
      const r = new clResponse.Response(clResponse.responses.expired, pcmd);
      pcb((r as any)[`as_${ptype}`]());
      return;
    }
    //----- the socket configuration ----
    //keys that may change in cfg:
    //agent -> false to disable socket pooling (no parallel request limitation!),
    //port -> the socket port
    //protocol -> the socket protocol
    //headers -> custom headers to use
    var opts = pcfg.options || getDefaultOptions();

    if (!opts.headers){
      opts.headers = {};
    }

    //----- the socket parameters ----
    //object keys -> login, pw, entity, remoteaddr, user (aka. subuser)
    //login -> the user account id to use for login
    //pw -> the corresponding user account password
    //entity -> system entity ("1234" for OT&E system, "54cd" for LIVE system)
    //remoteaddr -> the remote ip address of the customer incl. port (1.2.3.4:80)

    var c = this.createConnection(pcmd, {
      options: opts,
      params: pcfg.params
    });
    if (pcb) {
      c.on("response", (r:clResponse.Response) => {
        pcb((r as any)[`as_${ptype}`]());
      });
    }
    if (pcberr) {
      c.on("error", (r:clResponse.Response) => {
        pcberr((r as any)[`as_${ptype}`]());
      });
    }
    else {
      c.on("error", function( /*r*/ ) {
        //console.error('ispapi-apiconnector: error event thrown in request method but no error callback method provided.');
        //console.error(JSON.stringify(r[`as_${p_type}`]()));
      });
    }
    c.request();
  };

  /**
   * method for api login / session start
   * @param {Object} pparams specifying the socket parameters
   * @param {Function} pcb callback method
   * @param {String} [puri] specifying the socket uri to use
   * @param {Object} [pcmdparams] specifying additional startsession command paramaeters
   */
    login(pparams: any, pcb: Function, puri: string = "https://coreapi.1api.net/api/call.cgi", pcmdparams: any) {
      if (!/^(http|https):\/\//.test(puri))
        throw new Error("Unsupported protocol within api connection uri.");
      let cfg = {
        params: pparams,
        options: getDefaultOptions(puri)
      };
      const cb = (r: any) => {
        if (r.CODE === "200") {
          delete cfg.params.pw;
          delete cfg.params.login;
          delete cfg.params.user;
          cfg.params.session = r.PROPERTY.SESSION[0];
        }
        //return the socket configuration for reuse
        pcb(r, cfg);
      };
      this.request(Object.assign({
        command: "StartSession"
      }, pcmdparams || {}), cfg, cb, cb);
  };

  /**
   * method for api logout / ending session
   * @param {Object} pcfg the socket config
   * @param {Function} pcb callback method
   */
  logout(pcfg: any, pcb: Function) {
    this.request({
      command: "EndSession"
    }, pcfg, pcb, pcb);
  };

  /**
   * perform a command request to the 1API backend API
   * @param {Object} pcmd Object specifying the command to request
   * @param {Object} pcfg the socket config
   */
  createConnection(pcmd: any, pcfg: any) {
    let data = "";
    Object.keys(pcfg.params).forEach((key) => {
      data += encodeURIComponent('s_' + key);
      data += "=" + encodeURIComponent(pcfg.params[key]) + "&";
    });
    data += encodeURIComponent("s_command");
    data += "=" + encodeURIComponent(command_encode(pcmd));
    return new clRequest.Request(pcfg.options, data, pcmd);
  };
};

/**
 * convert given command object to string
 * @param {Object} pcmd Object specifying the command to encode
 */
export const command_encode = (pcmd: any): string => {
  let nullValueFound: boolean;
  let tmp: string = "";
  if (!(typeof pcmd === 'string' || pcmd instanceof String)) {
    nullValueFound = false;
    Object.keys(pcmd).forEach((key: string) => {
      if (pcmd[key]!==null||pcmd[key]!==undefined) { // 'toString' won't work
        tmp += key + '=' + pcmd[key].toString().replace(/\r|\n/g, "") + "\n";
      }
      else {
        nullValueFound = true;
      }
    });
    if (nullValueFound) {
      console.error('Command with null value in parameter.');
      console.error(pcmd);
    }
  }
  return tmp;
};

export const getDefaultOptions = (puri: string = 'https://coreapi.1api.net/api/call.cgi'): any => {
  const tmp = require("url").parse(puri);
  return {
    method: 'POST',
    //, agent: false //default usage of http.globalAgent
    port: (tmp.port || (/^https/i.test(tmp.protocol) ? '443' : '80')),
    protocol: tmp.protocol,
    host: tmp.host.replace(/:.+$/, ''), //remove port
    path: tmp.path
  };
};