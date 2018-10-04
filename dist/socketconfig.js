"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixedURLEnc = (str) => {
    return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
        return `%${c.charCodeAt(0).toString(16).toUpperCase()}`;
    });
};
class SocketConfig {
    constructor() {
        this.entity = "";
        this.login = "";
        this.otp = "";
        this.pw = "";
        this.remoteaddr = "";
        this.session = "";
        this.user = "";
    }
    getPOSTData() {
        let data = "";
        if (this.entity !== "") {
            data += `${exports.fixedURLEnc("s_entity")}=${exports.fixedURLEnc(this.entity)}&`;
        }
        if (this.login !== "") {
            data += `${exports.fixedURLEnc("s_login")}=${exports.fixedURLEnc(this.login)}&`;
        }
        if (this.otp !== "") {
            data += `${exports.fixedURLEnc("s_otp")}=${exports.fixedURLEnc(this.otp)}&`;
        }
        if (this.pw !== "") {
            data += `${exports.fixedURLEnc("s_pw")}=${exports.fixedURLEnc(this.pw)}&`;
        }
        if (this.remoteaddr !== "") {
            data += `${exports.fixedURLEnc("s_remoteaddr")}=${exports.fixedURLEnc(this.remoteaddr)}&`;
        }
        if (this.session !== "") {
            data += `${exports.fixedURLEnc("s_session")}=${exports.fixedURLEnc(this.session)}&`;
        }
        if (this.user !== "") {
            data += `${exports.fixedURLEnc("s_user")}=${exports.fixedURLEnc(this.user)}&`;
        }
        return data;
    }
    getSession() {
        return this.session;
    }
    getSystemEntity() {
        return this.entity;
    }
    setLogin(value) {
        this.session = "";
        this.login = value;
        return this;
    }
    setOTP(value) {
        this.session = "";
        this.otp = value;
        return this;
    }
    setPassword(value) {
        this.session = "";
        this.pw = value;
        return this;
    }
    setRemoteAddress(value) {
        this.remoteaddr = value;
        return this;
    }
    setSession(value) {
        this.session = value;
        this.login = "";
        this.pw = "";
        this.otp = "";
        return this;
    }
    setSystemEntity(value) {
        this.entity = value;
        return this;
    }
    setUser(value) {
        this.user = value;
        return this;
    }
}
exports.SocketConfig = SocketConfig;
//# sourceMappingURL=socketconfig.js.map