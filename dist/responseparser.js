"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResponseParser;
(function (ResponseParser) {
    ResponseParser.parse = function (raw) {
        var hash = {};
        var regexp = /^([^\=]*[^\t\= ])[\t ]*=[\t ]*(.*)$/;
        var r = raw.replace(/\r\n/g, "\n").split("\n");
        while (r.length) {
            var row = r.shift();
            var m = void 0;
            if (row) {
                m = row.match(regexp);
                if (m) {
                    var mm = m[1].match(/^property\[([^\]]*)\]/i);
                    if (mm) {
                        if (!hash.hasOwnProperty("PROPERTY")) {
                            hash.PROPERTY = {};
                        }
                        mm[1] = mm[1].toUpperCase().replace(/\s/g, "");
                        if (!hash.PROPERTY.hasOwnProperty(mm[1])) {
                            hash.PROPERTY[mm[1]] = [];
                        }
                        hash.PROPERTY[mm[1]].push(m[2].replace(/[\t ]*$/, ""));
                    }
                    else {
                        hash[m[1].toUpperCase()] = m[2].replace(/[\t ]*$/, "");
                    }
                }
            }
        }
        if (!hash.hasOwnProperty("DESCRIPTION")) {
            hash.DESCRIPTION = "";
        }
        return hash;
    };
    ResponseParser.serialize = function (r) {
        var plain = "[RESPONSE]";
        if (r.hasOwnProperty("PROPERTY")) {
            Object.keys(r.PROPERTY).forEach(function (key) {
                r.PROPERTY[key].forEach(function (val, index) {
                    plain += "\r\nPROPERTY[" + key + "][" + index + "]=" + val;
                });
            });
        }
        if (r.hasOwnProperty("CODE")) {
            plain += "\r\nCODE=" + r.CODE;
        }
        if (r.hasOwnProperty("DESCRIPTION")) {
            plain += "\r\nDESCRIPTION=" + r.DESCRIPTION;
        }
        if (r.hasOwnProperty("QUEUETIME")) {
            plain += "\r\nQUEUETIME=" + r.QUEUETIME;
        }
        if (r.hasOwnProperty("RUNTIME")) {
            plain += "\r\nRUNTIME=" + r.RUNTIME;
        }
        plain += "\r\nEOF\r\n";
        return plain;
    };
})(ResponseParser = exports.ResponseParser || (exports.ResponseParser = {}));
//# sourceMappingURL=responseparser.js.map