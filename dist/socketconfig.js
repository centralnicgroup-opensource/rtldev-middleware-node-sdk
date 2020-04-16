"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixedURLEnc = function (str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
        return "%" + c.charCodeAt(0).toString(16).toUpperCase();
    });
};
var SocketConfig = (function () {
    function SocketConfig() {
        this.entity = "";
        this.login = "";
        this.otp = "";
        this.pw = "";
        this.remoteaddr = "";
        this.session = "";
        this.user = "";
    }
    SocketConfig.prototype.getPOSTData = function () {
        var data = "";
        if (this.entity !== "") {
            data += exports.fixedURLEnc("s_entity") + "=" + exports.fixedURLEnc(this.entity) + "&";
        }
        if (this.login !== "") {
            data += exports.fixedURLEnc("s_login") + "=" + exports.fixedURLEnc(this.login) + "&";
        }
        if (this.otp !== "") {
            data += exports.fixedURLEnc("s_otp") + "=" + exports.fixedURLEnc(this.otp) + "&";
        }
        if (this.pw !== "") {
            data += exports.fixedURLEnc("s_pw") + "=" + exports.fixedURLEnc(this.pw) + "&";
        }
        if (this.remoteaddr !== "") {
            data += exports.fixedURLEnc("s_remoteaddr") + "=" + exports.fixedURLEnc(this.remoteaddr) + "&";
        }
        if (this.session !== "") {
            data += exports.fixedURLEnc("s_session") + "=" + exports.fixedURLEnc(this.session) + "&";
        }
        if (this.user !== "") {
            data += exports.fixedURLEnc("s_user") + "=" + exports.fixedURLEnc(this.user) + "&";
        }
        return data;
    };
    SocketConfig.prototype.getSession = function () {
        return this.session;
    };
    SocketConfig.prototype.getSystemEntity = function () {
        return this.entity;
    };
    SocketConfig.prototype.setLogin = function (value) {
        this.session = "";
        this.login = value;
        return this;
    };
    SocketConfig.prototype.setOTP = function (value) {
        this.session = "";
        this.otp = value;
        return this;
    };
    SocketConfig.prototype.setPassword = function (value) {
        this.session = "";
        this.pw = value;
        return this;
    };
    SocketConfig.prototype.setRemoteAddress = function (value) {
        this.remoteaddr = value;
        return this;
    };
    SocketConfig.prototype.setSession = function (value) {
        this.session = value;
        this.login = "";
        this.pw = "";
        this.otp = "";
        return this;
    };
    SocketConfig.prototype.setSystemEntity = function (value) {
        this.entity = value;
        return this;
    };
    SocketConfig.prototype.setUser = function (value) {
        this.user = value;
        return this;
    };
    return SocketConfig;
}());
exports.SocketConfig = SocketConfig;
//# sourceMappingURL=socketconfig.js.map