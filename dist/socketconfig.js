"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            data += `${encodeURIComponent("s_entity")}=${encodeURIComponent(this.entity)}&`;
        }
        if (this.login !== "") {
            data += `${encodeURIComponent("s_login")}=${encodeURIComponent(this.login)}&`;
        }
        if (this.otp !== "") {
            data += `${encodeURIComponent("s_otp")}=${encodeURIComponent(this.otp)}&`;
        }
        if (this.pw !== "") {
            data += `${encodeURIComponent("s_pw")}=${encodeURIComponent(this.pw)}&`;
        }
        if (this.remoteaddr !== "") {
            data += `${encodeURIComponent("s_remoteaddr")}=${encodeURIComponent(this.remoteaddr)}&`;
        }
        if (this.session !== "") {
            data += `${encodeURIComponent("s_session")}=${encodeURIComponent(this.session)}&`;
        }
        if (this.user !== "") {
            data += `${encodeURIComponent("s_user")}=${encodeURIComponent(this.user)}&`;
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